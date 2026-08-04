const assert = require("node:assert/strict");
const { afterEach, beforeEach, test } = require("node:test");

const { contactBuildHandler } = require("../src/functions/contact-build");

const VALID_BODY = {
    name: "Website Test",
    email: "reply@example.com",
    phone: "+64 21 555 0101",
    subject: "new-build",
    projectLocation: "Papamoa 3118",
    projectStage: "concept-design",
    desiredStart: "2026-11-01",
    budget: "500k-1m",
    privacyConsent: true,
    message: "Please contact me about a new build.",
    website: ""
};

const PDF_BYTES = Buffer.from("%PDF-1.7\nTest plan");

let originalFetch;
let originalApiKey;
let originalFrom;

function request(body = VALID_BODY, origin = "https://delvik.co") {
    return {
        headers: new Headers(origin ? { origin } : {}),
        json: async () => body
    };
}

function multipartRequest({
    body = VALID_BODY,
    files = [],
    origin = "https://delvik.co"
} = {}) {
    const formData = new FormData();

    Object.entries(body).forEach(([key, value]) => {
        formData.append(key, value);
    });

    files.forEach((file) => {
        formData.append("projectFiles", file, file.name);
    });

    return {
        headers: new Headers({
            ...(origin ? { origin } : {}),
            "content-type": "multipart/form-data; boundary=test"
        }),
        formData: async () => formData
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

test("sends a validated enquiry to the fixed DELVIK recipient", async () => {
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
    assert.equal(captured.options.headers["User-Agent"], "DELVIK-Contact-Form/1.0");
    assert.equal(payload.from, "DELVIK Website <website@forms.delvik.co>");
    assert.deepEqual(payload.to, ["build@delvik.co"]);
    assert.equal(payload.reply_to, VALID_BODY.email);
    assert.equal(payload.subject, "New DELVIK Build enquiry — New build");
    assert.match(payload.text, /Project location: Papamoa 3118/);
    assert.match(payload.text, /Project stage: Concept design/);
    assert.match(payload.text, /Preferred start: 2026-11-01/);
    assert.match(payload.text, /Indicative budget: NZ\$500k–\$1m/);
    assert.match(payload.text, /Privacy consent: Confirmed/);
    assert.equal(payload.attachments, undefined);
});

test("forwards a validated PDF attachment to Resend", async () => {
    let payload;
    global.fetch = async (_url, options) => {
        payload = JSON.parse(options.body);
        return new Response(JSON.stringify({ id: "email_with_plan" }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    };

    const file = new File([PDF_BYTES], "concept-plan.pdf", {
        type: "application/pdf"
    });
    const response = await contactBuildHandler(
        multipartRequest({ files: [file] }),
        context()
    );

    assert.equal(response.status, 200);
    assert.equal(payload.attachments.length, 1);
    assert.equal(payload.attachments[0].filename, "concept-plan.pdf");
    assert.equal(payload.attachments[0].content, PDF_BYTES.toString("base64"));
    assert.equal(payload.attachments[0].content_type, "application/pdf");
    assert.match(payload.text, /Files: concept-plan\.pdf/);
});

test("rejects an unsupported attachment type", async () => {
    let called = false;
    global.fetch = async () => {
        called = true;
    };

    const file = new File(["drawing"], "drawing.dwg", {
        type: "application/acad"
    });
    const response = await contactBuildHandler(
        multipartRequest({ files: [file] }),
        context()
    );

    assert.equal(response.status, 400);
    assert.match(response.jsonBody.message, /Only PDF, JPG and PNG/);
    assert.equal(called, false);
});

test("rejects a renamed file whose signature does not match", async () => {
    let called = false;
    global.fetch = async () => {
        called = true;
    };

    const file = new File(["not-a-pdf"], "unsafe.pdf", {
        type: "application/pdf"
    });
    const response = await contactBuildHandler(
        multipartRequest({ files: [file] }),
        context()
    );

    assert.equal(response.status, 400);
    assert.match(response.jsonBody.message, /does not match/);
    assert.equal(called, false);
});

test("rejects more than three attachments", async () => {
    let called = false;
    global.fetch = async () => {
        called = true;
    };

    const files = [1, 2, 3, 4].map(
        (number) =>
            new File([PDF_BYTES], `plan-${number}.pdf`, {
                type: "application/pdf"
            })
    );
    const response = await contactBuildHandler(
        multipartRequest({ files }),
        context()
    );

    assert.equal(response.status, 400);
    assert.match(response.jsonBody.message, /no more than 3/);
    assert.equal(called, false);
});

test("rejects a lead without project location, stage or privacy consent", async () => {
    let called = false;
    global.fetch = async () => {
        called = true;
    };

    for (const missingField of ["projectLocation", "projectStage", "privacyConsent"]) {
        const invalidBody = { ...VALID_BODY };
        delete invalidBody[missingField];
        const response = await contactBuildHandler(request(invalidBody), context());

        assert.equal(response.status, 400);
        assert.match(response.jsonBody.message, /required fields/);
    }

    assert.equal(called, false);
});

test("rejects unknown budget values and malformed start dates", async () => {
    let called = false;
    global.fetch = async () => {
        called = true;
    };

    const unknownBudget = await contactBuildHandler(
        request({ ...VALID_BODY, budget: "unlimited" }),
        context()
    );
    const malformedDate = await contactBuildHandler(
        request({ ...VALID_BODY, desiredStart: "tomorrow" }),
        context()
    );

    assert.equal(unknownBudget.status, 400);
    assert.equal(malformedDate.status, 400);
    assert.equal(called, false);
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
    assert.match(response.jsonBody.message, /build@delvik\.co/);
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
    assert.match(response.jsonBody.message, /build@delvik\.co/);
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
