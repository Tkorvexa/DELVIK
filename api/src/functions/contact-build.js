const { app } = require("@azure/functions");

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "KORVEXA Website <website@forms.korvexa.co>";
const CONTACT_TO = "build@korvexa.co";
const MAX_FILE_COUNT = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_FILE_SIZE = 15 * 1024 * 1024;
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
            message: "Contact email is being configured. Please email build@korvexa.co."
        });
    }

    const from = process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM;
    const emailSubject = `New KORVEXA Build enquiry — ${subject}`;
    const attachmentNames = attachments.map((attachment) => attachment.filename);
    const textBody = [
        "New website enquiry",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Subject: ${subject}`,
        `Files: ${attachmentNames.length ? attachmentNames.join(", ") : "None"}`,
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
