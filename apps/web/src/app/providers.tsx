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
import { ToastProvider } from "@recruit/shared";
import { ThemeModeProvider } from "@recruit/ui";
import type { ReactNode } from "react";

export function Providers({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: LocalePreferences;
}) {
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ThemeModeProvider>
        <ToastProvider>
          <LocaleProvider defaultLanguage="en" initialPreferences={initialLocale}>
            <PortalRouterProvider routes={routes}>
              <DatasourceProvider modules={AllModules}>
                <AuthProvider>{children}</AuthProvider>
              </DatasourceProvider>
            </PortalRouterProvider>
          </LocaleProvider>
        </ToastProvider>
      </ThemeModeProvider>
    </AppRouterCacheProvider>
  );
}
