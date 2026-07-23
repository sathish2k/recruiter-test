import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import type { Metadata } from "next";
import { Instrument_Sans, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import { getBootLocale } from "../locale";
import { Providers } from "./providers";

const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument",
  display: "swap",
});

// Brand wordmark font (matches the Claude Design source).
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
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
      className={`${instrument.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Runs before paint: reads the stored preference and sets
            <html data-theme> so the first frame is already the right scheme. */}
        <InitColorSchemeScript
          attribute="data-theme"
          defaultMode="dark"
          modeStorageKey="recruit-theme"
        />
        <Providers initialLocale={bootLocale}>{children}</Providers>
      </body>
    </html>
  );
}
