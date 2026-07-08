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
import { EmailFooter } from "./email-footer";
import { EmailHeader } from "./email-header";
import type { OrderEmailProps } from "./OrderEmail";
import { barebonesBoxedTailwindConfig } from "./theme";
import { BarebonesFonts } from "./theme-fonts";

const baseUrl = getSiteUrl();

export const OrderConfirmationEmail = ({
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
  service,
  courier,
  orderUrl,
}: OrderEmailProps) => {
  const displayStatus = status === "processing" ? "Processing" : "Confirmed";

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


  return (
    <Tailwind config={barebonesBoxedTailwindConfig}>
      <Html>
        <Head>
          <BarebonesFonts />
        </Head>

        <Body className="bg-bg-2 m-0 p-0 font-sans">
          <Preview>Your PDi order #{reference} is confirmed</Preview>
          <Container className="mobile:mt-0 mx-auto mt-8 w-full max-w-[640px]">
            <Section className="bg-bg mobile:px-2 px-6 py-2">
              {/* Header inside the white container */}
              <EmailHeader />

              {/* Main Content inside Inner Rounded Gray Box */}
              <Section className="bg-bg-2 mobile:p-2 rounded-[8px] p-6 text-center">
                <Section className="max-w-[440px] mx-auto text-center">
                  <Text className="m-0 font-32 font-sans text-fg">
                    Your order has been placed
                  </Text>
                  <Text className="m-0 my-4 font-14 font-sans text-fg-2 leading-relaxed">
                    Order #{reference} is {displayStatus.toLowerCase()}
                    —we&apos;re preparing your items for shipment and will email
                    the moment they leave our warehouse.
                  </Text>

                  <Section>
                    <Button
                      href={orderUrl}
                      className="inline-block bg-[#1F2222] px-6 py-2 font-15 font-sans text-white rounded-[8px] leading-6"
                    >
                      {"View order \u2192"}
                    </Button>
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

                {/* Package Summary */}
                <Section className="pt-2 border-t border-stroke text-left">
                  <Row>
                    <Column>
                      <Text className="m-0 font-14 font-sans text-fg-2">
                        Total Weight
                      </Text>
                    </Column>
                    <Column align="right">
                      <Text className="m-0 font-15 font-sans text-fg-2">
                        {weight.toLocaleString()} g
                      </Text>
                    </Column>
                  </Row>
                  <Row>
                    <Column>
                      <Text className="m-0 font-14 font-sans text-fg-2">
                        Estimated Delivery
                      </Text>
                    </Column>
                    <Column align="right">
                      <Text className="m-0 font-15 font-sans text-fg-2">
                        {formattedDate(deliveryDate, "short")}
                      </Text>
                    </Column>
                  </Row>
                  {formattedVendorName && (
                    <Row>
                      <Column>
                        <Text className="m-0 font-14 font-sans text-fg-2">
                          Courier{" "}
                        </Text>
                      </Column>
                      <Column align="right">
                        <Text className="m-0 font-15 font-sans text-fg-2">
                          {formattedVendorName}
                        </Text>
                      </Column>
                    </Row>
                  )}
                </Section>

                {/* Delivery Address */}
                <Section className="mt-4 border-t border-stroke text-left">
                  <Text className="m-0 font-16 font-sans text-fg font-semibold">
                    Delivery Address
                  </Text>
                  <Text className="m-0 font-14 font-sans text-fg-2 leading-relaxed whitespace-pre-line">
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
              </Section>

              {/* Footer outside the rounded box */}
              <EmailFooter />

              {/* <Text className="m-0 font-13 font-sans text-fg-2">
                  PDi UK is the logistics and fulfillment hub of E-PickPack
                  Limited. Over 20 years of experience in e-commerce
                  fulfillment.
                </Text>

                <Section className="mx-auto mt-4 mb-4 w-fit">
                  <Row>
                    <Column className="pr-[20px] w-[20px]">
                      <Link
                        href="https://x.com/pdi_uk"
                        className="inline-block"
                      >
                        <Img
                          src={`${baseUrl}/socials/social-x-black.png`}
                          alt="X"
                          width={20}
                          height={20}
                          className="block"
                        />
                      </Link>
                    </Column>
                    <Column className="w-[20px]">
                      <Link
                        href="https://linkedin.com/company/pdi"
                        className="inline-block"
                      >
                        <Img
                          src={`${baseUrl}/socials/social-in-black.png`}
                          alt="LinkedIn"
                          width={20}
                          height={20}
                          className="block"
                        />
                      </Link>
                    </Column>
                  </Row>
                </Section> */}
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
};

OrderConfirmationEmail.PreviewProps = {
  reference: "ORD-98273-XYZ",
  status: "processing",
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
  service: "ups-express-standard",
  orderUrl: "https://example.com/orders/ORD-98273-XYZ",
} satisfies OrderEmailProps;

export default OrderConfirmationEmail;
