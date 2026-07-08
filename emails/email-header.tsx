import { Column, Img, Row, Section, Text } from "react-email";
import { getSiteUrl } from "@/utils/site-url";

export const EmailHeader = () => {
  const baseUrl = getSiteUrl();

  return (
    <Section className="mb-2">
      <Row>
        <Column className="w-1/2 align-middle">
          <Img
            src={`${baseUrl}/logo.png`}
            alt="PDi Logo"
            width={60}
            className="block"
          />
        </Column>
        <Column align="right" className="w-1/2 align-middle">
          <Text className="m-0 text-right font-13 text-fg-3">PDi UK</Text>
        </Column>
      </Row>
    </Section>
  );
};
