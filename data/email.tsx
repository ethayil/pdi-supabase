import { render } from "@react-email/render";
import CustomMessageEmail from "@/emails/CustomMessageEmail";
import OrderEmail from "@/emails/OrderEmail";
import PasswordResetEmail from "@/emails/PasswordResetEmail";
import VerificationEmail from "@/emails/VerificationEmail";
import { transporter, verifySmtpConfig } from "@/lib/nodemailer";
import { getSiteUrl } from "@/utils/site-url";

const smtpEmail = process.env.SMTP_EMAIL;
const siteUrl = getSiteUrl();

export async function sendVerificationEmail({
  to,
  url,
}: {
  to: string;
  url: string;
}) {
  if (!verifySmtpConfig()) return;

  try {
    const emailHtml = await render(<VerificationEmail url={url} />);

    const info = await transporter.sendMail({
      from: `"PDi" <${smtpEmail}>`,
      to,
      subject: "Verify your email",
      html: emailHtml,
    });

    console.log(
      `[SMTP] Verification email sent successfully to ${to}. MessageId: ${info.messageId}`,
    );
    return info.messageId;
  } catch (error) {
    console.error(`[SMTP] Error sending verification email to ${to}:`, error);
    throw error;
  }
}

export async function sendPasswordResetEmail({
  to,
  otp,
}: {
  to: string;
  otp: string;
}) {
  if (!verifySmtpConfig()) return;

  try {
    const resetUrl = `${siteUrl}/auth/reset-password?email=${encodeURIComponent(to)}&otp=${encodeURIComponent(otp)}`;

    const emailHtml = await render(<PasswordResetEmail url={resetUrl} />);

    const info = await transporter.sendMail({
      from: `"PDi" <${smtpEmail}>`,
      to,
      subject: "Reset your password",
      html: emailHtml,
    });

    console.log(
      `[SMTP] Password reset email sent successfully to ${to}. MessageId: ${info.messageId}`,
    );
    return info.messageId;
  } catch (error) {
    console.error(`[SMTP] Error sending password reset email to ${to}:`, error);
    throw error;
  }
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
    image?: string;
  }[];
  courier?: string;
  trackingNumber?: string;
  service?: string;
  signedBy?: string;
  deliveredAt?: number | Date;
  exceptionReason?: string;
  externalComments?: string;
  sendDate?: number | Date;
  orderUrl: string;
}) {
  if (!verifySmtpConfig()) return;

  const { to, ...templateProps } = args;

  try {
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
      sendDate:
        args.sendDate instanceof Date
          ? args.sendDate.getTime()
          : args.sendDate,
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

    console.log(
      `[SMTP] Order email (${args.reference}) sent successfully to ${to}. MessageId: ${info.messageId}`,
    );
    return info.messageId;
  } catch (error) {
    console.error(
      `[SMTP] Error sending order email (${args.reference}) to ${to}:`,
      error,
    );
    throw error;
  }
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

  try {
    const emailHtml = await render(<CustomMessageEmail {...templateProps} />);

    const info = await transporter.sendMail({
      from: `"PDi" <${smtpEmail}>`,
      to,
      subject: args.title,
      html: emailHtml,
    });

    console.log(
      `[SMTP] Custom email ("${args.title}") sent successfully to ${to}. MessageId: ${info.messageId}`,
    );
    return info.messageId;
  } catch (error) {
    console.error(
      `[SMTP] Error sending custom email ("${args.title}") to ${to}:`,
      error,
    );
    throw error;
  }
}
