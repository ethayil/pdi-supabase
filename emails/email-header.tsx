import { Column, Row, Section } from "react-email";
import { Logo } from "@/components/ui/logo";

export const EmailHeader = () => {
  return (
    <Section className="mb-2">
      <Row>
        <Column className="align-middle">
          <Logo email />
        </Column>
      </Row>
    </Section>
  );
};
