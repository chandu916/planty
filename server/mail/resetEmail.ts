import nodemailer from "nodemailer";

type ResetEmailInput = {
  to: string;
  resetUrl: string;
};

let cachedTransporter: nodemailer.Transporter | null = null;

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !user || !pass || !from || Number.isNaN(port)) {
    return null;
  }

  return {
    host,
    port,
    user,
    pass,
    from,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
  };
}

export function isResetEmailConfigured() {
  return !!getSmtpConfig();
}

function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const config = getSmtpConfig();
  if (!config) {
    throw new Error("SMTP is not configured.");
  }

  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  return cachedTransporter;
}

function buildResetEmailHtml(resetUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif; background: #08120d; color: #f4fff6; padding: 32px;">
      <div style="max-width: 560px; margin: 0 auto; background: rgba(255,255,255,0.04); border: 1px solid rgba(74, 222, 128, 0.22); border-radius: 20px; padding: 32px;">
        <p style="margin: 0 0 8px; color: #4ade80; font-size: 14px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">Planty</p>
        <h1 style="margin: 0 0 16px; font-size: 28px; line-height: 1.2;">Reset your password</h1>
        <p style="margin: 0 0 16px; color: #c9f7d4; line-height: 1.6;">
          We received a request to reset your Planty account password. Use the button below to choose a new password.
        </p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #4ade80; color: #031108; padding: 14px 22px; border-radius: 999px; text-decoration: none; font-weight: 700;">
            Reset Password
          </a>
        </p>
        <p style="margin: 0 0 12px; color: #c9f7d4; line-height: 1.6;">
          This link expires in 30 minutes. If the button does not work, copy and paste this URL into your browser:
        </p>
        <p style="margin: 0; word-break: break-word; color: #86efac;">${resetUrl}</p>
      </div>
    </div>
  `;
}

function buildResetEmailText(resetUrl: string) {
  return [
    "Planty password reset",
    "",
    "We received a request to reset your Planty account password.",
    "Use the link below to choose a new password:",
    "",
    resetUrl,
    "",
    "This link expires in 30 minutes.",
  ].join("\n");
}

export async function sendResetPasswordEmail({ to, resetUrl }: ResetEmailInput) {
  const config = getSmtpConfig();
  if (!config) {
    throw new Error("SMTP is not configured.");
  }

  await getTransporter().sendMail({
    from: config.from,
    to,
    subject: "Reset your Planty password",
    text: buildResetEmailText(resetUrl),
    html: buildResetEmailHtml(resetUrl),
  });
}