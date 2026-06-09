import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import CustomMessageEmail from "../emails/CustomMessageEmail";
import OrderEmail from "../emails/OrderEmail";
import PasswordResetEmail from "../emails/PasswordResetEmail";
import VerificationEmail from "../emails/VerificationEmail";

const smtpEmail = process.env.SMTP_EMAIL;
const smtpPassword = process.env.SMTP_PASSWORD;
const smtpHost = process.env.SMTP_HOST || "";
const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
const siteUrl = process.env.SITE_URL;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpEmail,
    pass: smtpPassword,
  },
});

function verifySmtpConfig(): boolean {
  if (!smtpEmail || !smtpPassword) {
    console.error("SMTP credentials not configured");
    return false;
  }
  return true;
}

export async function sendVerificationEmail({
  to,
  url,
}: {
  to: string;
  url: string;
}) {
  if (!verifySmtpConfig()) return;

  const emailHtml = await render(<VerificationEmail url={url} />);

  const info = await transporter.sendMail({
    from: `"PDi" <${smtpEmail}>`,
    to,
    subject: "Verify your email",
    html: emailHtml,
  });

  return info.messageId;
}

export async function sendPasswordResetEmail({
  to,
  otp,
}: {
  to: string;
  otp: string;
}) {
  if (!verifySmtpConfig()) return;

  const resetUrl = `${siteUrl}/auth/reset-password?email=${encodeURIComponent(to)}&otp=${encodeURIComponent(otp)}`;

  const emailHtml = await render(<PasswordResetEmail url={resetUrl} />);

  const info = await transporter.sendMail({
    from: `"PDi" <${smtpEmail}>`,
    to,
    subject: "Reset your password",
    html: emailHtml,
  });

  return info.messageId;
}

export async function sendOrderEmail(args: {
  to: string;
  reference: string;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "on_the_way"
    | "delay"
    | "exception"
    | "delivered"
    | "cancelled"
    | "returned"
    | "collected";
  fullname: string;
  address1: string;
  address2?: string;
  town: string;
  city?: string;
  postcode: string;
  country: string;
  deliveryDate: number | Date;
  weight: number;
  items?: {
    name: string;
    sku?: string;
    quantity: number;
  }[];
  courier?: string;
  trackingNumber?: string;
  service?: string;
  signedBy?: string;
  deliveredAt?: number | Date;
  exceptionReason?: string;
  orderUrl: string;
}) {
  if (!verifySmtpConfig()) return;

  const { to, ...templateProps } = args;

  const formattedProps = {
    ...templateProps,
    deliveryDate:
      args.deliveryDate instanceof Date
        ? args.deliveryDate.getTime()
        : args.deliveryDate,
    deliveredAt:
      args.deliveredAt instanceof Date
        ? args.deliveredAt.getTime()
        : args.deliveredAt,
  };

  const emailHtml = await render(<OrderEmail {...formattedProps} />);

  const statusLabels: Record<string, string> = {
    pending: "Order Received",
    processing: "Processing",
    shipped: "Shipped",
    on_the_way: "On The Way",
    delay: "Delayed",
    delivered: "Delivered",
    collected: "Collected",
    exception: "Exception — Action Required",
    cancelled: "Cancelled",
    returned: "Returned",
  };

  const subject = `Order ${args.reference} — ${statusLabels[args.status] ?? args.status}`;

  const info = await transporter.sendMail({
    from: `"PDi" <${smtpEmail}>`,
    to,
    subject,
    html: emailHtml,
  });

  return info.messageId;
}

export async function sendCustomEmail(args: {
  to: string;
  title: string;
  message: string;
  linkUrl?: string;
  senderName?: string;
}) {
  if (!verifySmtpConfig()) return;

  const { to, ...templateProps } = args;

  const emailHtml = await render(<CustomMessageEmail {...templateProps} />);

  const info = await transporter.sendMail({
    from: `"PDi" <${smtpEmail}>`,
    to,
    subject: args.title,
    html: emailHtml,
  });

  return info.messageId;
}
