import { Section, Text } from "react-email";

export const EmailFooter = () => {
  return (
    <Section className="pt-8 text-center">
      <Text className="m-0 font-11 font-sans text-fg-3">
        E-PickPack Limited trading as PDi UK
        <br />5 Rabans Lane, Aylesbury, HP19 8RT, UK
      </Text>
    </Section>
  );
};
