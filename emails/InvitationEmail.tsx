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

interface InvitationEmailProps {
  url: string;
  inviterName?: string;
  orgName?: string;
  role?: string;
}

export const InvitationEmail = ({
  url,
  inviterName = "An administrator",
  orgName = "PDi",
  role = "member",
}: InvitationEmailProps) => (
  <Tailwind config={barebonesBoxedTailwindConfig}>
    <Html>
      <Head>
        <BarebonesFonts />
      </Head>

      <Body className="bg-bg-2 text-center font-sans">
        <Preview>You&apos;ve been invited to join {orgName}</Preview>
        <Container className="mobile:mt-0 mx-auto mt-8 w-full max-w-160">
          <Section className="bg-bg mobile:px-2 px-6 py-4">
            {/* Header inside the white container */}
            <EmailHeader />

            {/* Main Content inside Inner Rounded Gray Box */}
            <Section className="bg-bg-2 mobile:p-2 rounded-xl p-6 text-center">
              <Section className="max-w-110 mx-auto text-center">
                <Text className="m-0 font-32 font-sans text-fg">
                  You&apos;ve been invited!
                </Text>
                <Text className="m-0 my-4 font-14 font-sans text-fg-2 leading-relaxed">
                  <span className="font-semibold">{inviterName}</span> has invited
                  you to join <span className="font-semibold">{orgName}</span> as a{" "}
                  <span className="font-semibold">{role}</span> on PDi.
                  <br />
                  Click the button below to accept your invitation and get started.
                </Text>

                <Section>
                  <Button
                    href={url}
                    className="inline-block bg-[#1F2222] px-6 py-2 font-15 font-sans text-white rounded-xl leading-6"
                  >
                    {"Accept Invitation \u2192"}
                  </Button>
                </Section>

                <Text className="font-13 text-fg-3 mx-auto mt-8 mb-0 max-w-100 text-center font-sans">
                  If you weren&apos;t expecting this invitation, you can safely ignore this email.
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

InvitationEmail.PreviewProps = {
  url: "https://example.com/auth/accept-invitation?id=123",
  inviterName: "John Doe",
  orgName: "Acme Corp",
  role: "member",
} satisfies InvitationEmailProps;

export default InvitationEmail;
