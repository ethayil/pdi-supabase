import { formattedDate } from "../utils/formatted-date";
import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export interface OrderEmailItem {
  name: string;
  sku?: string;
  quantity: number;
}

export type OrderEmailStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "on_the_way"
  | "delay"
  | "delivered"
  | "collected"
  | "exception"
  | "cancelled"
  | "returned";

export interface OrderEmailProps {
  reference: string;
  status: OrderEmailStatus;
  fullname: string;
  address1: string;
  address2?: string;
  town: string;
  city?: string;
  postcode: string;
  country: string;
  deliveryDate: number;
  weight: number;
  // Only used for pending / processing
  items?: OrderEmailItem[];
  // Shipping info — used for shipped / delivered / collected
  courier?: string;
  trackingNumber?: string;
  service?: string;
  // Delivery confirmation — delivered only
  signedBy?: string;
  deliveredAt?: number;
  // Exception reason / note
  exceptionReason?: string;
  orderUrl: string;
}

const STATUS_CONFIG: Record<
  OrderEmailStatus,
  {
    label: string;
    headline: string;
    intro: (name: string) => string;
    color: string;
  }
> = {
  pending: {
    label: "Order Received",
    headline: "We've received your order",
    intro: (n) =>
      `Thank you, ${n}. We've received your order and it is currently awaiting confirmation. You will hear from us shortly.`,
    color: "#6b7280",
  },
  processing: {
    label: "Processing",
    headline: "Your order is being processed",
    intro: (n) =>
      `Hi ${n}, great news — your order is now being processed and will be dispatched soon.`,
    color: "#2563eb",
  },
  shipped: {
    label: "Shipped",
    headline: "Your order is on its way!",
    intro: (n) =>
      `Hi ${n}, your order has been shipped and is on its way to you.`,
    color: "#0891b2",
  },
  on_the_way: {
    label: "On the Way",
    headline: "Your order is on the way",
    intro: (n) =>
      `Hi ${n}, your order is out for delivery and will be with you shortly.`,
    color: "#0891b2",
  },
  delay: {
    label: "Delayed",
    headline: "Your order is delayed",
    intro: (n) =>
      `Hi ${n}, your order has been slightly delayed. We are working to get it to you as soon as possible.`,
    color: "#d97706",
  },
  delivered: {
    label: "Delivered",
    headline: "Your order has been delivered",
    intro: (n) =>
      `Hi ${n}, your order has been successfully delivered. We hope everything arrived in perfect condition.`,
    color: "#16a34a",
  },
  collected: {
    label: "Collected",
    headline: "Your order has been collected",
    intro: (n) => `Hi ${n}, your order has been collected successfully.`,
    color: "#16a34a",
  },
  exception: {
    label: "Exception",
    headline: "There's an issue with your order",
    intro: (n) =>
      `Hi ${n}, we've encountered an issue with your order. Please see the details below.`,
    color: "#dc2626",
  },
  cancelled: {
    label: "Cancelled",
    headline: "Your order has been cancelled",
    intro: (n) =>
      `Hi ${n}, unfortunately your order has been cancelled. If you have any questions, please contact our support team.`,
    color: "#dc2626",
  },
  returned: {
    label: "Returned",
    headline: "Your order has been returned",
    intro: (n) =>
      `Hi ${n}, your order has been returned and is being processed.`,
    color: "#d97706",
  },
};

const showItems = (status: OrderEmailStatus) =>
  status === "pending" || status === "processing";

const showTracking = (status: OrderEmailStatus) =>
  status === "shipped" ||
  status === "on_the_way" ||
  status === "delay" ||
  status === "delivered" ||
  status === "collected";

export const OrderEmail = ({
  reference,
  status,
  fullname,
  address1,
  address2,
  town,
  city,
  postcode,
  country,
  deliveryDate,
  weight,
  items = [],
  courier,
  trackingNumber,
  service,
  signedBy,
  deliveredAt: deliveredAtTs,
  exceptionReason,
  orderUrl: _orderUrl,
}: OrderEmailProps) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

  return (
    <Html>
      <Head />
      <Preview>{`Order ${reference} — ${cfg.label}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logoText}>PDi</Heading>
          </Section>

          {/* Title */}
          <Heading style={h1}>{cfg.headline}</Heading>
          <Text style={text}>{cfg.intro(fullname)}</Text>

          {/* Exception alert — red */}
          {status === "exception" && exceptionReason && (
            <Section style={exceptionBox}>
              <Text style={exceptionTitle}>Issue Details</Text>
              <Text style={exceptionText}>{exceptionReason}</Text>
            </Section>
          )}

          {/* Note for returned only — delivered shows it inside tracking section */}
          {status === "returned" && exceptionReason && (
            <Section style={noteBox}>
              <Text style={noteTitle}>Note</Text>
              <Text style={noteText}>{exceptionReason}</Text>
            </Section>
          )}

          {/* Order info box */}
          <Section style={infoBox}>
            <Row>
              <Column style={infoLabel}>Order Reference</Column>
              <Column style={infoValue}>{reference}</Column>
            </Row>
            <Row>
              <Column style={infoLabel}>Status</Column>
              <Column
                style={{ ...infoValue, color: cfg.color, fontWeight: "600" }}
              >
                {cfg.label}
              </Column>
            </Row>
            <Row>
              <Column style={infoLabel}>Delivery Date</Column>
              <Column style={infoValue}>
                {formattedDate(deliveryDate, "long")}
              </Column>
            </Row>
            <Row>
              <Column style={infoLabel}>Total Weight</Column>
              <Column style={infoValue}>{weight.toLocaleString()} g</Column>
            </Row>
          </Section>

          {/* Tracking details — shipped / collected / on_the_way / delay (requires courier or tracking number) */}
          {(status === "shipped" ||
            status === "on_the_way" ||
            status === "delay" ||
            status === "collected") &&
            (courier || trackingNumber) && (
              <>
                <Hr style={divider} />
                <Heading style={h2}>Tracking Information</Heading>
                <Section style={infoBox}>
                  {courier && (
                    <Row>
                      <Column style={infoLabel}>Courier</Column>
                      <Column style={infoValue}>{courier}</Column>
                    </Row>
                  )}
                  {service && (
                    <Row>
                      <Column style={infoLabel}>Service</Column>
                      <Column style={infoValue}>{service}</Column>
                    </Row>
                  )}
                  {trackingNumber && (
                    <Row>
                      <Column style={infoLabel}>Tracking No.</Column>
                      <Column style={infoValue}>{trackingNumber}</Column>
                    </Row>
                  )}
                </Section>
              </>
            )}

          {/* Delivery confirmation — always shown for delivered */}
          {status === "delivered" && (
            <>
              <Hr style={divider} />
              <Heading style={h2}>Tracking Information</Heading>
              <Section style={infoBox}>
                {courier && (
                  <Row>
                    <Column style={infoLabel}>Courier</Column>
                    <Column style={infoValue}>{courier}</Column>
                  </Row>
                )}
                {service && (
                  <Row>
                    <Column style={infoLabel}>Service</Column>
                    <Column style={infoValue}>{service}</Column>
                  </Row>
                )}
                {trackingNumber && (
                  <Row>
                    <Column style={infoLabel}>Tracking No.</Column>
                    <Column style={infoValue}>{trackingNumber}</Column>
                  </Row>
                )}
                {deliveredAtTs && (
                  <Row>
                    <Column style={infoLabel}>Delivered On</Column>
                    <Column style={infoValue}>
                      {formattedDate(deliveredAtTs, "long")}
                    </Column>
                  </Row>
                )}
                {signedBy && (
                  <Row>
                    <Column style={infoLabel}>Signed By</Column>
                    <Column style={infoValue}>{signedBy}</Column>
                  </Row>
                )}
                {exceptionReason && (
                  <Row>
                    <Column style={{ ...infoLabel, verticalAlign: "top" }}>
                      Note
                    </Column>
                    <Column style={infoValue}>{exceptionReason}</Column>
                  </Row>
                )}
              </Section>
            </>
          )}

          {/* Items — only for pending / processing */}
          {showItems(status) && items.length > 0 && (
            <>
              <Hr style={divider} />
              <Heading style={h2}>Items</Heading>
              <Section style={tableContainer}>
                <Row style={tableHeaderRow}>
                  <Column style={tableHeaderCell}>Product</Column>
                  <Column
                    style={{
                      ...tableHeaderCell,
                      width: "80px",
                      textAlign: "right",
                    }}
                  >
                    Qty
                  </Column>
                </Row>
                {items.map((item, i) => (
                  <Row key={i} style={i % 2 === 1 ? tableRowAlt : tableRow}>
                    <Column style={tableCell}>
                      <Text style={productName}>{item.name}</Text>
                      {item.sku && <Text style={productSku}>{item.sku}</Text>}
                    </Column>
                    <Column
                      style={{
                        ...tableCell,
                        width: "80px",
                        textAlign: "right",
                      }}
                    >
                      <Text style={tableCell}>{item.quantity}</Text>
                    </Column>
                  </Row>
                ))}
              </Section>
            </>
          )}

          <Hr style={divider} />

          {/* Delivery Address */}
          <Heading style={h2}>Delivery Address</Heading>
          <Text style={addressText}>
            {fullname}
            {"\n"}
            {address1}
            {address2 ? `\n${address2}` : ""}
            {"\n"}
            {town}
            {city ? `, ${city}` : ""}
            {"\n"}
            {postcode}
            {"\n"}
            {country}
          </Text>

          <Hr style={divider} />

          <Text style={footer}>
            You&apos;re receiving this email because you placed an order with
            PDi. If you have any questions, please contact our support team.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderEmail;

// ── Styles ────────────────────────────────────────────────────────────────────
const main = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px",
  maxWidth: "600px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
};

const header = {
  backgroundColor: "#111827",
  borderRadius: "8px 8px 0 0",
  padding: "16px 24px",
};

const logoText = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0",
  letterSpacing: "2px",
};

const h1 = {
  color: "#111827",
  fontSize: "24px",
  fontWeight: "700",
  margin: "24px 0 8px",
};

const h2 = {
  color: "#374151",
  fontSize: "16px",
  fontWeight: "600",
  margin: "20px 0 8px",
};

const text = {
  color: "#6b7280",
  fontSize: "15px",
  lineHeight: "1.5",
  margin: "0 0 16px",
};

const exceptionBox = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "6px",
  padding: "12px 16px",
  margin: "0 0 16px",
};

const exceptionTitle = {
  color: "#991b1b",
  fontSize: "13px",
  fontWeight: "600",
  margin: "0 0 4px",
};

const exceptionText = {
  color: "#7f1d1d",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0",
};

const noteBox = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  padding: "12px 16px",
  margin: "0 0 16px",
};

const noteTitle = {
  color: "#475569",
  fontSize: "13px",
  fontWeight: "600",
  margin: "0 0 4px",
};

const noteText = {
  color: "#334155",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0",
};

const infoBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
  padding: "12px 16px",
  margin: "16px 0",
};

const infoLabel = {
  color: "#6b7280",
  fontSize: "13px",
  padding: "4px 0",
  width: "140px",
};

const infoValue = {
  color: "#111827",
  fontSize: "13px",
  fontWeight: "500",
  padding: "4px 0",
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "20px 0",
};

const tableContainer = {
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  overflow: "hidden",
};

const tableHeaderRow = { backgroundColor: "#f3f4f6" };

const tableHeaderCell = {
  color: "#374151",
  fontSize: "12px",
  fontWeight: "600",
  padding: "8px 12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const tableRow = { backgroundColor: "#ffffff" };
const tableRowAlt = { backgroundColor: "#f9fafb" };

const tableCell = {
  padding: "10px 12px",
  fontSize: "14px",
  color: "#374151",
  verticalAlign: "middle" as const,
};

const productName = {
  margin: "0",
  fontSize: "14px",
  color: "#111827",
  fontWeight: "500",
};

const productSku = {
  margin: "2px 0 0",
  fontSize: "12px",
  color: "#9ca3af",
};

const addressText = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "1.8",
  margin: "0",
  whiteSpace: "pre-line" as const,
};

const footer = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "0",
};
