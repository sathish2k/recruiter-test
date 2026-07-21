"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { AllModules, routes } from "@recruit/configurations";
import {
  AuthProvider,
  DatasourceProvider,
  LocaleProvider,
  PortalRouterProvider,
} from "@recruit/sdk";
import { ThemeModeProvider } from "@recruit/ui";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ThemeModeProvider>
        <LocaleProvider defaultLanguage="en">
          <PortalRouterProvider routes={routes}>
            <DatasourceProvider modules={AllModules}>
              <AuthProvider>{children}</AuthProvider>
            </DatasourceProvider>
          </PortalRouterProvider>
        </LocaleProvider>
      </ThemeModeProvider>
    </AppRouterCacheProvider>
  );
}
