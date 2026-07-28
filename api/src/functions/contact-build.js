const { app } = require("@azure/functions");

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "KORVEXA Website <website@forms.korvexa.co>";
const CONTACT_TO = "build@korvexa.co";
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

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
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

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        context.error("RESEND_API_KEY is not configured.");
        return json(503, {
            success: false,
            message: "Contact email is being configured. Please email build@korvexa.co."
        });
    }

    const from = process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM;
    const emailSubject = `New KORVEXA Build enquiry — ${subject}`;
    const textBody = [
        "New website enquiry",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Subject: ${subject}`,
        "",
        "Message:",
        message
    ].join("\n");
    const htmlBody = `
        <h2>New KORVEXA Build website enquiry</h2>
        <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse">
            <tr><th align="left">Name</th><td>${escapeHtml(name)}</td></tr>
            <tr><th align="left">Email</th><td>${escapeHtml(email)}</td></tr>
            <tr><th align="left">Phone</th><td>${escapeHtml(phone)}</td></tr>
            <tr><th align="left">Subject</th><td>${escapeHtml(subject)}</td></tr>
        </table>
        <h3>Message</h3>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
    `;

    const emailPayload = {
        from,
        to: [CONTACT_TO],
        reply_to: email,
        subject: emailSubject,
        text: textBody,
        html: htmlBody
    };

    try {
        const response = await fetch(RESEND_ENDPOINT, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "User-Agent": "KORVEXA-Contact-Form/1.0"
            },
            body: JSON.stringify(emailPayload)
        });

        const responseText = await response.text();
        let result = {};

        try {
            result = JSON.parse(responseText);
        } catch {
            context.error("Resend returned a non-JSON response.");
        }

        if (!response.ok || !result.id) {
            context.error("Resend rejected the contact request.", {
                status: response.status,
                upstreamName: result.name,
                upstreamMessage: result.message
            });
            return json(502, {
                success: false,
                message: "We could not send your enquiry. Please email build@korvexa.co."
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
