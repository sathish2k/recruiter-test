"use client";

import { ServerError } from "@recruit/sdk";
import { ThemeModeProvider } from "@recruit/ui";
import { useEffect } from "react";

/**
 * Only fires when the root layout itself throws, which takes the normal
 * providers down with it — so this replaces `<html>` and brings its own theme.
 * Nothing here may depend on the session or the engine.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] unhandled root error", error);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeModeProvider>
          <ServerError onRetry={reset} />
        </ThemeModeProvider>
      </body>
    </html>
  );
}
