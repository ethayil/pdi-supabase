import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "react-email";
import { formattedDate } from "../utils/formatted-date";
import { getSiteUrl } from "../utils/site-url";
import { getTrackingUrl } from "../utils/tracking-url";
import { EmailFooter } from "./email-footer";
import { EmailHeader } from "./email-header";
import type { OrderEmailProps } from "./OrderEmail";
import { barebonesBoxedTailwindConfig } from "./theme";
import { BarebonesFonts } from "./theme-fonts";

const baseUrl = getSiteUrl();

type ShippingFaqItem = {
  title: string;
  body: string;
};

const techOrderShippingFaqItems: ShippingFaqItem[] = [
  {
    title: "When will my package arrive?",
    body: "Most domestic packages land in 1–3 business days after dispatch. Please follow your courier tracking link for live delivery windows.",
  },
  {
    title: "Can I change my delivery address?",
    body: "Once a package is in transit, the delivery address cannot be changed directly by us. You may use the courier's redirection tools once they have the parcel.",
  },
  {
    title: "Is my shipment protected?",
    body: "Yes, every PDi UK shipment is fully insured. If anything arrives damaged or is lost, please contact our support team immediately.",
  },
];

export const OrderShippingEmail = ({
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
  deliveredAt,
  exceptionReason,
  orderUrl,
}: OrderEmailProps) => {
  const isDelivered = status === "delivered";
  const isCollected = status === "collected";

  let statusText = "is on its way";
  if (isDelivered) statusText = "has been delivered";
  if (isCollected) statusText = "has been collected";
  if (status === "delay") statusText = "has been delayed";

  // Standardize vendor display name
  const rawVendor = courier || service || "";
  const formattedVendorName = rawVendor
    ? rawVendor.split(/[\s-]+/)[0].toUpperCase() === "UPS"
      ? "UPS"
      : rawVendor.split(/[\s-]+/)[0].toUpperCase() === "DHL"
        ? "DHL"
        : rawVendor.split(/[\s-]+/)[0].toUpperCase() === "DPD"
          ? "DPD"
          : rawVendor.split(/[\s-]+/)[0].toUpperCase() === "FEDEX"
            ? "FedEx"
            : rawVendor.split(/[\s-]+/)[0].toUpperCase() === "ROYAL"
              ? "Royal Mail"
              : rawVendor.charAt(0).toUpperCase() +
                rawVendor.slice(1).replace(/-/g, " ")
    : undefined;

  // Resolve tracking link via getTrackingUrl
  const trackingUrl =
    isDelivered || isCollected
      ? orderUrl
      : getTrackingUrl({
          courier: courier || null,
          trackingNumber: trackingNumber || null,
          postcode: postcode || null,
        }) || orderUrl;

  return (
    <Tailwind config={barebonesBoxedTailwindConfig}>
      <Html>
        <Head>
          <BarebonesFonts />
        </Head>

        <Body className="bg-bg-2 text-center font-sans">
          <Preview>
            Your PDi order #{reference} {statusText}
          </Preview>
          <Container className="mobile:mt-0 mx-auto mt-8 w-full max-w-[640px]">
            <Section className="bg-bg mobile:px-2 px-6 py-4">
              {/* Header inside the white container */}
              <EmailHeader />

              {/* Main Content inside Inner Rounded Gray Box */}
              <Section className="bg-bg-2 rounded-[8px] mobile:p-2 px-6 py-8 text-center">
                <Section className="max-w-[440px] mx-auto text-center">
                  <Text className="m-0 font-28 font-sans text-fg font-semibold leading-tight">
                    {isDelivered
                      ? "Order Delivered"
                      : isCollected
                        ? "Order Collected"
                        : "Your order is on the way"}
                  </Text>
                  <Text className="m-0 mt-4 font-14 font-sans text-fg-2 leading-relaxed">
                    Order #{reference} {statusText}.
                    {exceptionReason ? ` Note: ${exceptionReason}` : ""}
                  </Text>

                  <Section className="mt-6">
                    <Button
                      href={trackingUrl}
                      className="inline-block bg-[#1F2222] px-[20px] py-[12px] font-15 font-sans text-white rounded-[8px] leading-6"
                    >
                      {isDelivered || isCollected
                        ? "View order details \u2192"
                        : "Track your shipment \u2192"}
                    </Button>
                  </Section>
                </Section>

                {/* Courier / Tracking Details */}
                <Section className="py-6 border-t border-stroke text-left">
                  <Text className="m-0 font-16 font-sans text-fg font-semibold">
                    Courier Details
                  </Text>
                  <Section className="bg-white border border-stroke mt-3 p-4 rounded-[8px]">
                    <Row>
                      <Column className="w-1/2">
                        <Text className="m-0 font-12 font-sans text-fg-3 uppercase tracking-wider">
                          Courier
                        </Text>
                        <Text className="m-0 mt-1 font-15 font-sans text-fg font-semibold">
                          {formattedVendorName || "Standard Carrier"}
                        </Text>
                      </Column>
                      {/* <Column className="w-1/2">
                        <Text className="m-0 font-12 font-sans text-fg-3 uppercase tracking-wider">
                          Service
                        </Text>
                        <Text className="m-0 mt-1 font-15 font-sans text-fg font-semibold">
                          {service ? service.replace(/-/g, " ") : "Standard Shipping"}
                        </Text>
                      </Column> */}
                    </Row>
                    {(trackingNumber || signedBy || deliveredAt) && (
                      <Row className="mt-4">
                        {trackingNumber && (
                          <Column className="w-1/2">
                            <Text className="m-0 font-12 font-sans text-fg-3 uppercase tracking-wider">
                              Tracking No.
                            </Text>
                            <Text className="m-0 mt-1 font-15 font-sans text-fg font-semibold">
                              {trackingNumber}
                            </Text>
                          </Column>
                        )}
                        {signedBy && (
                          <Column className="w-1/2">
                            <Text className="m-0 font-12 font-sans text-fg-3 uppercase tracking-wider">
                              Signed By
                            </Text>
                            <Text className="m-0 mt-1 font-15 font-sans text-fg font-semibold">
                              {signedBy}
                            </Text>
                          </Column>
                        )}
                        {deliveredAt && (
                          <Column className="w-1/2">
                            <Text className="m-0 font-12 font-sans text-fg-3 uppercase tracking-wider">
                              Delivered On
                            </Text>
                            <Text className="m-0 mt-1 font-15 font-sans text-fg font-semibold">
                              {formattedDate(deliveredAt, "long")}
                            </Text>
                          </Column>
                        )}
                      </Row>
                    )}
                  </Section>
                </Section>

                {/* Items List */}
                {items.length > 0 && (
                  <Section className="pt-4 text-left">
                    <Text className="m-0 mb-2 font-16 font-sans text-fg font-semibold">
                      Items in this order
                    </Text>
                    {items.map((item, idx) => (
                      <Section
                        // biome-ignore lint/suspicious/noArrayIndexKey: idx is stable
                        key={idx}
                        className="bg-white mt-0 mb-1 p-2 rounded-[8px] text-left border border-stroke"
                      >
                        <Row>
                          <Column className="w-[60px] align-middle">
                            <Section className="w-[60px] h-[60px] rounded-[6px] bg-white border border-stroke flex items-center justify-center overflow-hidden">
                              <Img
                                src={item.image || `${baseUrl}/placeholder.svg`}
                                alt={item.name}
                                width={item.image ? 60 : 40}
                                className="block"
                              />
                            </Section>
                          </Column>
                          <Column className="pl-4 align-middle">
                            <Text className="m-0 font-14 font-sans text-fg font-semibold">
                              {item.name}
                            </Text>
                            {item.sku && (
                              <Text className="m-0 mt-0.5 font-12 font-sans text-fg-3">
                                SKU: {item.sku}
                              </Text>
                            )}
                            <Text className="m-0 mt-1 font-13 font-sans text-fg-3">
                              Qty: {item.quantity}
                            </Text>
                          </Column>
                        </Row>
                      </Section>
                    ))}
                  </Section>
                )}

                {/* Weight & Delivery Date Summary */}
                <Section className="pt-4 border-t border-stroke text-left">
                  <Row>
                    <Column>
                      <Text className="m-0 py-[4px] font-14 font-sans text-fg-2">
                        Total Package Weight
                      </Text>
                    </Column>
                    <Column align="right">
                      <Text className="m-0 py-[4px] font-15 font-sans text-fg-2">
                        {weight.toLocaleString()} g
                      </Text>
                    </Column>
                  </Row>
                  {!isDelivered && !isCollected && (
                    <Row>
                      <Column>
                        <Text className="m-0 py-[4px] font-14 font-sans text-fg-2">
                          Estimated Delivery Date
                        </Text>
                      </Column>
                      <Column align="right">
                        <Text className="m-0 py-[4px] font-15 font-sans text-fg-2">
                          {formattedDate(deliveryDate, "short")}
                        </Text>
                      </Column>
                    </Row>
                  )}
                </Section>

                {/* Delivery Address */}
                <Section className="mt-6 pt-6 border-t border-stroke text-left">
                  <Text className="m-0 font-16 font-sans text-fg font-semibold">
                    Delivery Address
                  </Text>
                  <Text className="m-0 mt-3 font-14 font-sans text-fg-2 leading-relaxed whitespace-pre-line">
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
                </Section>

                <Section className="mt-6 border-stroke border-t">
                  &nbsp;
                </Section>
                <Section className="mt-3 text-center">
                  <Text className="m-0 mx-auto max-w-[340px] font-14 font-sans text-fg-3">
                    Please note that address modifications are no longer
                    possible since your shipment has already been dispatched.
                  </Text>
                </Section>

                {/* Common Questions */}
                <Section className="mt-6 pt-6 border-stroke border-t text-left">
                  <Text className="m-0 font-16 font-sans text-fg-3">
                    Common questions
                  </Text>
                  <Section className="mt-4">
                    {techOrderShippingFaqItems.map((item, idx) => (
                      <Section
                        // biome-ignore lint/suspicious/noArrayIndexKey: idx is stable
                        key={idx}
                        className={idx > 0 ? "mt-4" : ""}
                      >
                        <Text className="m-0 font-15 font-sans text-fg font-semibold">
                          {item.title}
                        </Text>
                        <Text className="m-0 mt-1.5 font-14 font-sans text-fg-2">
                          {item.body}
                        </Text>
                      </Section>
                    ))}
                  </Section>
                </Section>
              </Section>

              {/* Footer outside the rounded box */}
              <EmailFooter />
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
};

OrderShippingEmail.PreviewProps = {
  reference: "ORD-98273-XYZ",
  status: "shipped",
  fullname: "John Doe",
  address1: "123 Logistics Hub Road",
  address2: "Suite 400",
  town: "Reading",
  city: "Berkshire",
  postcode: "RG1 1AF",
  country: "United Kingdom",
  deliveryDate: Date.now() + 86400000 * 2,
  weight: 1250,
  items: [
    { name: "Premium Wireless Keyboard", sku: "KB-WIRE-01", quantity: 1 },
    { name: "Ergonomic USB Mouse", sku: "MS-ERGO-02", quantity: 2 },
  ],
  courier: "ups",
  trackingNumber: "UPS123456789",
  service: "ups-express-standard",
  orderUrl: "https://example.com/orders/ORD-98273-XYZ",
} satisfies OrderEmailProps;

export default OrderShippingEmail;
