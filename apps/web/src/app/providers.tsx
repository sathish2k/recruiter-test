"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { AllModules, routes } from "@recruit/configurations";
import type { LocalePreferences } from "@recruit/sdk";
import {
  AuthProvider,
  DatasourceProvider,
  LocaleProvider,
  PortalRouterProvider,
} from "@recruit/sdk";
import { SnackbarProvider, ToastProvider } from "@recruit/shared";
import { ThemeModeProvider } from "@recruit/ui";
import type { ReactNode } from "react";

export function Providers({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: LocalePreferences;
}) {
  // Unguarded routes are guest screens — they render straight from the server
  // HTML instead of waiting behind the session loader.
  const publicPaths = routes
    .filter((route) => !route.guard?.length)
    .map((route) => `/${route.path}`.replace(/\/+/g, "/"));
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ThemeModeProvider>
        <ToastProvider>
          <SnackbarProvider>
            <LocaleProvider defaultLanguage="en" initialPreferences={initialLocale}>
              <PortalRouterProvider routes={routes}>
                <DatasourceProvider modules={AllModules}>
                  <AuthProvider publicPaths={publicPaths}>{children}</AuthProvider>
                </DatasourceProvider>
              </PortalRouterProvider>
            </LocaleProvider>
          </SnackbarProvider>
        </ToastProvider>
      </ThemeModeProvider>
    </AppRouterCacheProvider>
  );
}
