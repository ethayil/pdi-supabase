import { Column, Img, Row, Section } from "react-email";
import { getSiteUrl } from "../utils/site-url";

const baseUrl = getSiteUrl();

export const EmailHeader = () => {
  return (
    <Section className="mb-2">
      <Row>
        <Column className="align-middle">
          <Img
            src={`${baseUrl}/logo.png`}
            alt="PDi UK"
            width={120}
            className="block"
          />
        </Column>
      </Row>
    </Section>
  );
};
