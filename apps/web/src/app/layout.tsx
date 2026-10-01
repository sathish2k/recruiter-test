import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { getBootLocale } from "../locale";
import { Providers } from "./providers";

// Manrope carries all UI — it is the face the brand lockup is set in.
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "optional",
});

// Space Grotesk carries display: page titles, headline figures.
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-grotesk",
  display: "optional",
});

export const metadata: Metadata = {
  title: "AI Recruiter — ATS",
  description: "Applicant tracking system",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Server-fetched once per request so the locale store boots with the right
  // language/timezone/formats — correct from the first paint on any device.
  const bootLocale = await getBootLocale();
  return (
    <html
      lang={bootLocale.language ?? "en"}
      className={`${manrope.variable} ${grotesk.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Runs before paint: reads the stored preference and sets
            <html data-theme> so the first frame is already the right scheme. */}
        <InitColorSchemeScript
          attribute="data-theme"
          defaultMode="light"
          modeStorageKey="recruit-theme"
        />
        <Providers initialLocale={bootLocale}>{children}</Providers>
      </body>
    </html>
  );
}
