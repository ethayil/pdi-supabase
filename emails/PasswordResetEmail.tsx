import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "react-email";
import { EmailFooter } from "./email-footer";
import { EmailHeader } from "./email-header";
import { barebonesBoxedTailwindConfig } from "./theme";
import { BarebonesFonts } from "./theme-fonts";

interface PasswordResetEmailProps {
  url: string;
}

export const PasswordResetEmail = ({ url }: PasswordResetEmailProps) => (
  <Tailwind config={barebonesBoxedTailwindConfig}>
    <Html>
      <Head>
        <BarebonesFonts />
      </Head>

      <Body className="bg-bg-2 text-center font-sans">
        <Preview>Reset your password</Preview>
        <Container className="mobile:mt-0 mx-auto mt-8 w-full max-w-[640px]">
          <Section className="bg-bg mobile:px-2 px-6 py-4">
            {/* Header inside the white container */}
            <EmailHeader />

            {/* Main Content inside Inner Rounded Gray Box */}
            <Section className="bg-bg-2 mobile:p-2 rounded-[8px] p-6 text-center">
              <Section className="max-w-[440px] mx-auto text-center">
                <Text className="m-0 font-32 font-sans text-fg">
                  Reset your password
                </Text>
                <Text className="m-0 my-4 font-14 font-sans text-fg-2 leading-relaxed">
                  We received a request to reset your password. Click the button
                  below to choose a new password.
                </Text>

                <Section>
                  <Button
                    href={url}
                    className="inline-block bg-[#1F2222] px-6 py-2 font-15 font-sans text-white rounded-[8px] leading-6"
                  >
                    {"Reset Password \u2192"}
                  </Button>
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

PasswordResetEmail.PreviewProps = {
  url: "https://example.com/",
} satisfies PasswordResetEmailProps;

export default PasswordResetEmail;
