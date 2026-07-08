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
  <Tailwind config={barebonesBoxedTailwindConfig}>
    <Html>
      <Head>
        <BarebonesFonts />
      </Head>
      <Body className="bg-bg-2 text-center font-sans">
        <Preview>{title}</Preview>
        <Container className="mobile:mt-0 mx-auto mt-8 w-full max-w-[640px]">
          <Section className="bg-bg mobile:px-2 px-6 py-4">
            {/* Header inside the white container */}
            <EmailHeader />

            {/* Main Content inside Inner Rounded Gray Box */}
            <Section className="bg-bg-2 mobile:p-2 rounded-[8px] p-6 text-center">
              <Section className="max-w-[440px] mx-auto text-center">
                <Text className="m-0 font-32 font-sans text-fg">{title} </Text>
                <Text className="m-0 my-4 font-14 font-sans text-fg-2 leading-relaxed">
                  {message}
                </Text>

                {linkUrl && (
                  <Section>
                    <Button
                      href={linkUrl}
                      className="inline-block bg-[#1F2222] px-6 py-2 font-15 font-sans text-white rounded-[8px] leading-6"
                    >
                      {"View Details \u2192"}
                    </Button>
                  </Section>
                )}
              </Section>

              <Text className="font-13 text-fg-3 mx-auto mt-4 max-w-[280px] text-center font-sans">
                Sent by {senderName} via PDi Notification System
              </Text>
            </Section>

            {/* Footer outside the rounded box */}
            <EmailFooter />
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

CustomMessageEmail.PreviewProps = {
  title: "Important Notification",
  message:
    "This is a custom message sent to you regarding your account. Please click below to verify details.",
  linkUrl: "https://example.com/",
  senderName: "PDi Logistics Team",
} satisfies CustomMessageEmailProps;

export default CustomMessageEmail;
