import { Font } from "react-email";

/**
 * Montserrat font family loader via Google CSS `@import` and static fallbacks.
 */
export function BarebonesFonts() {
  return (
    <>
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Ignore
        dangerouslySetInnerHTML={{
          __html: `@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');`,
        }}
      />
      <Font
        fontFamily="Montserrat"
        fallbackFontFamily={["Arial", "sans-serif"]}
        webFont={{
          url: "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4MV96Axg.ttf",
          format: "truetype",
        }}
        fontWeight={400}
        fontStyle="normal"
      />
      <Font
        fontFamily="Montserrat"
        fallbackFontFamily={["Arial", "sans-serif"]}
        webFont={{
          url: "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4MV0Obxg.ttf",
          format: "truetype",
        }}
        fontWeight={500}
        fontStyle="normal"
      />
      <Font
        fontFamily="Montserrat"
        fallbackFontFamily={["Arial", "sans-serif"]}
        webFont={{
          url: "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4MV96Axg.ttf",
          format: "truetype",
        }}
        fontWeight={600}
        fontStyle="normal"
      />
      <Font
        fontFamily="Montserrat"
        fallbackFontFamily={["Arial", "sans-serif"]}
        webFont={{
          url: "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4MV96Axg.ttf",
          format: "truetype",
        }}
        fontWeight={700}
        fontStyle="normal"
      />
    </>
  );
}

// Keep an export for TechFonts that maps to Montserrat as well
export const TechFonts = BarebonesFonts;
