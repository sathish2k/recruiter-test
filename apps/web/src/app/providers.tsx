"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import { AllModules, routes } from "@recruit/configurations";
import {
  AuthProvider,
  DatasourceProvider,
  LocaleProvider,
  PortalRouterProvider,
} from "@recruit/sdk";
import { theme } from "@recruit/ui";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocaleProvider defaultLanguage="en">
          <PortalRouterProvider routes={routes}>
            <DatasourceProvider modules={AllModules}>
              <SessionProvider>
                <AuthProvider>{children}</AuthProvider>
              </SessionProvider>
            </DatasourceProvider>
          </PortalRouterProvider>
        </LocaleProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
