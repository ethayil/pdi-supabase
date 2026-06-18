import nodemailer from "nodemailer";

const smtpEmail = process.env.SMTP_EMAIL;
const smtpPassword = process.env.SMTP_PASSWORD;
const smtpHost = process.env.SMTP_HOST || "";
const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);

export const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
        user: smtpEmail,
        pass: smtpPassword,
    },
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    rateLimit: 10,
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000, // 10 seconds
    socketTimeout: 30000, // 30 seconds
    tls: {
        rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== "false",
    },
    debug: process.env.SMTP_DEBUG === "true",
    logger: process.env.SMTP_DEBUG === "true",
});

export function verifySmtpConfig(): boolean {
    if (!smtpEmail || !smtpPassword) {
        console.error("SMTP credentials not configured");
        return false;
    }
    return true;
}
