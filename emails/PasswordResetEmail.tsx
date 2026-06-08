import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";

interface PasswordResetEmailProps {
  url: string;
}

export const PasswordResetEmail = ({ url }: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Reset your password</Heading>
          <Text style={text}>
            We received a request to reset your password. Click the button below
            to choose a new password.
          </Text>
          <Link href={url} style={button}>
            Reset Password
          </Link>
          <Text style={footnote}>
            If you didn&apos;t request this, you can safely ignore this email.
            This link will expire in 5 minutes.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "560px",
};

const h1 = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "400",
  color: "#484848",
  padding: "17px 0 0",
};

const text = {
  margin: "0 0 15px",
  color: "#3c4149",
  fontSize: "15px",
  lineHeight: "1.4",
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "3px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px",
  lineHeight: "100%",
};

const footnote = {
  margin: "20px 0 0",
  color: "#898989",
  fontSize: "13px",
  lineHeight: "1.4",
};

export default PasswordResetEmail;
