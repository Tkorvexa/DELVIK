const { app } = require("@azure/functions");

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "DELVIK Website <website@forms.delvik.co>";
const CONTACT_TO = "thiago@delvik.co";
const MAX_FILE_COUNT = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_ORIGINS = new Set([
    "https://delvik.co",
    "https://delvik.co"
]);
const SUBJECTS = new Map([
    ["new-build", "New build"],
    ["renovation", "Renovation"],
    ["light-commercial", "Light commercial"],
    ["project-delivery", "Project delivery"]
]);
const PROJECT_STAGES = new Map([
    ["idea", "Idea / early planning"],
    ["concept-design", "Concept design"],
    ["developed-design", "Developed design"],
    ["building-consent", "Building consent"],
    ["ready-for-pricing", "Ready for pricing"]
]);
const BUDGETS = new Map([
    ["under-250k", "Under NZ$250k"],
    ["250k-500k", "NZ$250k–$500k"],
    ["500k-1m", "NZ$500k–$1m"],
    ["1m-2m", "NZ$1m–$2m"],
    ["over-2m", "Over NZ$2m"],
    ["not-established", "Not established yet"]
]);
const FILE_TYPES = new Map([
    [".pdf", { contentType: "application/pdf", signature: "pdf" }],
    [".jpg", { contentType: "image/jpeg", signature: "jpeg" }],
    [".jpeg", { contentType: "image/jpeg", signature: "jpeg" }],
    [".png", { contentType: "image/png", signature: "png" }]
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

function isUploadedFile(value) {
    return (
        value &&
        typeof value === "object" &&
        typeof value.name === "string" &&
        typeof value.size === "number" &&
        typeof value.arrayBuffer === "function"
    );
}

function extensionOf(filename) {
    const dot = filename.lastIndexOf(".");
    return dot >= 0 ? filename.slice(dot).toLowerCase() : "";
}

function safeFilename(filename) {
    const leaf = filename.replaceAll("\\", "/").split("/").pop() || "attachment";
    const cleaned = leaf.replace(/[\u0000-\u001f\u007f]/g, "").trim();
    return (cleaned || "attachment").slice(0, 180);
}

function matchesSignature(buffer, signature) {
    if (signature === "pdf") {
        return buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-";
    }

    if (signature === "jpeg") {
        return (
            buffer.length >= 3 &&
            buffer[0] === 0xff &&
            buffer[1] === 0xd8 &&
            buffer[2] === 0xff
        );
    }

    if (signature === "png") {
        return (
            buffer.length >= 8 &&
            buffer.subarray(0, 8).equals(
                Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
            )
        );
    }

    return false;
}

async function parseRequest(request) {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.toLowerCase().startsWith("multipart/form-data")) {
        const formData = await request.formData();
        return {
            body: {
                name: formData.get("name"),
                email: formData.get("email"),
                phone: formData.get("phone"),
                subject: formData.get("subject"),
                projectLocation: formData.get("projectLocation"),
                projectStage: formData.get("projectStage"),
                desiredStart: formData.get("desiredStart"),
                budget: formData.get("budget"),
                privacyConsent: formData.get("privacyConsent"),
                message: formData.get("message"),
                website: formData.get("website")
            },
            files: formData
                .getAll("projectFiles")
                .filter((file) => isUploadedFile(file) && file.size > 0)
        };
    }

    return {
        body: await request.json(),
        files: []
    };
}

async function prepareAttachments(files) {
    if (files.length > MAX_FILE_COUNT) {
        return {
            error: `Please upload no more than ${MAX_FILE_COUNT} files.`
        };
    }

    const totalSize = files.reduce((total, file) => total + file.size, 0);
    if (totalSize > MAX_TOTAL_FILE_SIZE) {
        return {
            error: "The combined file size must be 15 MB or less."
        };
    }

    const attachments = [];

    for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
            return {
                error: "Each file must be 10 MB or less."
            };
        }

        const filename = safeFilename(file.name);
        const fileType = FILE_TYPES.get(extensionOf(filename));
        if (!fileType) {
            return {
                error: "Only PDF, JPG and PNG files are accepted."
            };
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        if (!matchesSignature(buffer, fileType.signature)) {
            return {
                error: `The file "${filename}" does not match its file type.`
            };
        }

        attachments.push({
            filename,
            content: buffer.toString("base64"),
            content_type: fileType.contentType
        });
    }

    return { attachments };
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
    let files;
    try {
        ({ body, files } = await parseRequest(request));
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
    const projectLocation = clean(body.projectLocation, 200);
    const projectStageKey = clean(body.projectStage, 60);
    const desiredStart = clean(body.desiredStart, 30);
    const budgetKey = clean(body.budget, 60);
    const message = clean(body.message, 5000);
    const subject = SUBJECTS.get(subjectKey);
    const projectStage = PROJECT_STAGES.get(projectStageKey);
    const budget = budgetKey ? BUDGETS.get(budgetKey) : "Not provided";
    const privacyConsent = body.privacyConsent === true ||
        ["true", "on", "1"].includes(clean(body.privacyConsent, 10).toLowerCase());
    const validDesiredStart = !desiredStart || /^\d{4}-\d{2}-\d{2}$/.test(desiredStart);

    if (
        !name ||
        !email ||
        !phone ||
        !subject ||
        !projectLocation ||
        !projectStage ||
        !budget ||
        !privacyConsent ||
        !validDesiredStart ||
        !message ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        return json(400, {
            success: false,
            message: "Please complete all required fields."
        });
    }

    const attachmentResult = await prepareAttachments(files);
    if (attachmentResult.error) {
        return json(400, {
            success: false,
            message: attachmentResult.error
        });
    }

    const attachments = attachmentResult.attachments;
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        context.error("RESEND_API_KEY is not configured.");
        return json(503, {
            success: false,
            message: "Contact email is being configured. Please email thiago@delvik.co."
        });
    }

    const from = process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM;
    const emailSubject = `New DELVIK Build enquiry — ${subject}`;
    const attachmentNames = attachments.map((attachment) => attachment.filename);
    const textBody = [
        "New website enquiry",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Subject: ${subject}`,
        `Project location: ${projectLocation}`,
        `Project stage: ${projectStage}`,
        `Preferred start: ${desiredStart || "Not provided"}`,
        `Indicative budget: ${budget}`,
        "Privacy consent: Confirmed",
        `Files: ${attachmentNames.length ? attachmentNames.join(", ") : "None"}`,
        "",
        "Message:",
        message
    ].join("\n");
    const htmlBody = `
        <h2>New DELVIK Build website enquiry</h2>
        <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse">
            <tr><th align="left">Name</th><td>${escapeHtml(name)}</td></tr>
            <tr><th align="left">Email</th><td>${escapeHtml(email)}</td></tr>
            <tr><th align="left">Phone</th><td>${escapeHtml(phone)}</td></tr>
            <tr><th align="left">Subject</th><td>${escapeHtml(subject)}</td></tr>
            <tr><th align="left">Project location</th><td>${escapeHtml(projectLocation)}</td></tr>
            <tr><th align="left">Project stage</th><td>${escapeHtml(projectStage)}</td></tr>
            <tr><th align="left">Preferred start</th><td>${escapeHtml(desiredStart || "Not provided")}</td></tr>
            <tr><th align="left">Indicative budget</th><td>${escapeHtml(budget)}</td></tr>
            <tr><th align="left">Privacy consent</th><td>Confirmed</td></tr>
            <tr><th align="left">Files</th><td>${attachmentNames.length
                ? attachmentNames.map(escapeHtml).join(", ")
                : "None"}</td></tr>
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

    if (attachments.length) {
        emailPayload.attachments = attachments;
    }

    try {
        const response = await fetch(RESEND_ENDPOINT, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "User-Agent": "DELVIK-Contact-Form/1.0"
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
                message: "We could not send your enquiry. Please email thiago@delvik.co."
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
