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

interface VerificationEmailProps {
  url: string;
}

export const VerificationEmail = ({ url }: VerificationEmailProps) => (
  <Tailwind config={barebonesBoxedTailwindConfig}>
    <Html>
      <Head>
        <BarebonesFonts />
      </Head>

      <Body className="bg-bg-2 text-center font-sans">
        <Preview>Verify your email address</Preview>
        <Container className="mobile:mt-0 mx-auto mt-8 w-full max-w-[640px]">
          <Section className="bg-bg mobile:px-2 px-6 py-4">
            {/* Header inside the white container */}
            <EmailHeader />

            {/* Main Content inside Inner Rounded Gray Box */}
            <Section className="bg-bg-2 mobile:p-2 rounded-[8px] p-6 text-center">
              <Section className="max-w-[440px] mx-auto text-center">
                <Text className="m-0 font-32 font-sans text-fg">
                  Verify your email
                </Text>
                <Text className="m-0 my-4 font-14 font-sans text-fg-2 leading-relaxed">
                  Thank you for signing up for{" "}
                  <span className="font-semibold">PDi UK</span>.
                  <br />
                  To verify your account, we just need to confirm your email
                  address.
                </Text>

                <Section>
                  <Button
                    href={url}
                    className="inline-block bg-[#1F2222] px-6 py-2 font-15 font-sans text-white rounded-[8px] leading-6"
                  >
                    {"Confirm email \u2192"}
                  </Button>
                </Section>

                <Text className="font-13 text-fg-3 mx-auto mt-8 mb-0 max-w-[400px] text-center font-sans">
                  If you didn&apos;t request this, please ignore this email.
                </Text>
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

VerificationEmail.PreviewProps = {
  url: "https://example.com/",
} satisfies VerificationEmailProps;

export default VerificationEmail;
