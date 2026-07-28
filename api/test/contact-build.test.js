const assert = require("node:assert/strict");
const { afterEach, beforeEach, test } = require("node:test");

const { contactBuildHandler } = require("../src/functions/contact-build");

const VALID_BODY = {
    name: "Website Test",
    email: "reply@example.com",
    phone: "+64 21 555 0101",
    subject: "new-build",
    message: "Please contact me about a new build.",
    website: ""
};

let originalFetch;
let originalApiKey;
let originalFrom;

function request(body = VALID_BODY, origin = "https://www.korvexa.co") {
    return {
        headers: new Headers(origin ? { origin } : {}),
        json: async () => body
    };
}

function context() {
    return {
        errors: [],
        error(...args) {
            this.errors.push(args);
        }
    };
}

beforeEach(() => {
    originalFetch = global.fetch;
    originalApiKey = process.env.RESEND_API_KEY;
    originalFrom = process.env.CONTACT_FROM_EMAIL;
    process.env.RESEND_API_KEY = "re_test_key";
    delete process.env.CONTACT_FROM_EMAIL;
});

afterEach(() => {
    global.fetch = originalFetch;

    if (originalApiKey === undefined) {
        delete process.env.RESEND_API_KEY;
    } else {
        process.env.RESEND_API_KEY = originalApiKey;
    }

    if (originalFrom === undefined) {
        delete process.env.CONTACT_FROM_EMAIL;
    } else {
        process.env.CONTACT_FROM_EMAIL = originalFrom;
    }
});

test("sends a validated enquiry to the fixed Korvexa recipient", async () => {
    let captured;
    global.fetch = async (url, options) => {
        captured = { url, options };
        return new Response(JSON.stringify({ id: "email_123" }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    };

    const response = await contactBuildHandler(request(), context());
    const payload = JSON.parse(captured.options.body);

    assert.equal(response.status, 200);
    assert.deepEqual(response.jsonBody, { success: true });
    assert.equal(captured.url, "https://api.resend.com/emails");
    assert.equal(captured.options.headers.Authorization, "Bearer re_test_key");
    assert.equal(captured.options.headers["User-Agent"], "KORVEXA-Contact-Form/1.0");
    assert.equal(payload.from, "KORVEXA Website <website@forms.korvexa.co>");
    assert.deepEqual(payload.to, ["build@korvexa.co"]);
    assert.equal(payload.reply_to, VALID_BODY.email);
    assert.equal(payload.subject, "New KORVEXA Build enquiry — New build");
});

test("rejects requests from an unapproved browser origin", async () => {
    let called = false;
    global.fetch = async () => {
        called = true;
    };

    const response = await contactBuildHandler(
        request(VALID_BODY, "https://malicious.example"),
        context()
    );

    assert.equal(response.status, 403);
    assert.equal(response.jsonBody.success, false);
    assert.equal(called, false);
});

test("silently accepts honeypot submissions without sending email", async () => {
    let called = false;
    global.fetch = async () => {
        called = true;
    };

    const response = await contactBuildHandler(
        request({ ...VALID_BODY, website: "https://spam.example" }),
        context()
    );

    assert.equal(response.status, 200);
    assert.deepEqual(response.jsonBody, { success: true });
    assert.equal(called, false);
});

test("returns a safe error when the Resend key is missing", async () => {
    delete process.env.RESEND_API_KEY;
    let called = false;
    global.fetch = async () => {
        called = true;
    };

    const response = await contactBuildHandler(request(), context());

    assert.equal(response.status, 503);
    assert.equal(response.jsonBody.success, false);
    assert.match(response.jsonBody.message, /build@korvexa\.co/);
    assert.equal(called, false);
});

test("returns failure when Resend rejects the email", async () => {
    global.fetch = async () =>
        new Response(
            JSON.stringify({
                name: "validation_error",
                message: "The sender domain is not verified."
            }),
            {
                status: 422,
                headers: { "Content-Type": "application/json" }
            }
        );

    const response = await contactBuildHandler(request(), context());

    assert.equal(response.status, 502);
    assert.equal(response.jsonBody.success, false);
    assert.match(response.jsonBody.message, /build@korvexa\.co/);
});

test("escapes user content before placing it in the HTML email", async () => {
    let payload;
    global.fetch = async (_url, options) => {
        payload = JSON.parse(options.body);
        return new Response(JSON.stringify({ id: "email_escaped" }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    };

    const response = await contactBuildHandler(
        request({
            ...VALID_BODY,
            name: "<script>alert('name')</script>",
            message: "<img src=x onerror=alert('message')>"
        }),
        context()
    );

    assert.equal(response.status, 200);
    assert.doesNotMatch(payload.html, /<script>|<img/);
    assert.match(payload.html, /&lt;script&gt;/);
    assert.match(payload.html, /&lt;img/);
});
