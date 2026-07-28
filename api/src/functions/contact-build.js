const { app } = require("@azure/functions");

const FORM_ENDPOINT = "https://formsubmit.co/ajax/build@korvexa.co";
const ALLOWED_ORIGINS = new Set([
    "https://www.korvexa.co",
    "https://korvexa.co"
]);
const SUBJECTS = new Map([
    ["new-build", "New build"],
    ["renovation", "Renovation"],
    ["light-commercial", "Light commercial"],
    ["project-delivery", "Project delivery"]
]);

function clean(value, maxLength) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function json(status, body) {
    return {
        status,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
        },
        jsonBody: body
    };
}

async function contactBuildHandler(request, context) {
    const origin = request.headers.get("origin");
    if (origin && !ALLOWED_ORIGINS.has(origin)) {
        return json(403, {
            success: false,
            message: "Request origin is not allowed."
        });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return json(400, {
            success: false,
            message: "Invalid request."
        });
    }

    // Silently accept bot submissions without forwarding them.
    if (clean(body.website, 200)) {
        return json(200, { success: true });
    }

    const name = clean(body.name, 120);
    const email = clean(body.email, 254);
    const phone = clean(body.phone, 60);
    const subjectKey = clean(body.subject, 60);
    const message = clean(body.message, 5000);
    const subject = SUBJECTS.get(subjectKey);

    if (
        !name ||
        !email ||
        !phone ||
        !subject ||
        !message ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        return json(400, {
            success: false,
            message: "Please complete all required fields."
        });
    }

    const formPayload = {
        _subject: "New KORVEXA Build website enquiry",
        _template: "table",
        _captcha: "false",
        _url: "https://www.korvexa.co/contact-build.html",
        _replyto: email,
        name,
        email,
        phone,
        subject,
        message
    };

    try {
        const response = await fetch(FORM_ENDPOINT, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formPayload)
        });

        const responseText = await response.text();
        let result = {};

        try {
            result = JSON.parse(responseText);
        } catch {
            context.error("FormSubmit returned a non-JSON response.");
        }

        const accepted =
            result.success === true ||
            result.success === "true";

        if (!response.ok || !accepted) {
            context.error("FormSubmit rejected the contact request.", {
                status: response.status
            });
            return json(502, {
                success: false,
                message: "The email service did not accept the enquiry."
            });
        }

        return json(200, { success: true });
    } catch (error) {
        context.error("Contact email delivery failed.", {
            error: error instanceof Error ? error.message : "Unknown error"
        });
        return json(502, {
            success: false,
            message: "The email service is temporarily unavailable."
        });
    }
}

app.http("contactBuild", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "contact/build",
    handler: contactBuildHandler
});

module.exports = { contactBuildHandler };
