import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface CustomMessageEmailProps {
  title: string;
  message: string;
  linkUrl?: string;
  senderName?: string;
}

export const CustomMessageEmail = ({
  title,
  message,
  linkUrl,
  senderName = "PDi Admin",
}: CustomMessageEmailProps) => (
  <Html>
    <Head />
    <Preview>{title}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={section}>
          <Heading style={h1}>{title}</Heading>
          <Text style={text}>{message}</Text>
          {linkUrl && (
            <Section style={btnContainer}>
              <Link style={button} href={linkUrl}>
                View Details
              </Link>
            </Section>
          )}
          <Hr style={hr} />
          <Text style={footer}>
            Sent by {senderName} via PDi Notification System
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default CustomMessageEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const section = {
  padding: "0 48px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const btnContainer = {
  textAlign: "center" as const,
  marginTop: "32px",
  marginBottom: "32px",
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
};
