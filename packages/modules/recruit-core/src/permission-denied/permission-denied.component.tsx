"use client";

import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import ErrorOutlineRounded from "@mui/icons-material/ErrorOutlineRounded";
import { BrandErrorScreen, useConfiguration, usePortalRouter, useTranslation } from "@recruit/sdk";
import type { PermissionDeniedConfiguration } from "./permission-denied.configuration";

export function PermissionDeniedComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<typeof PermissionDeniedConfiguration>(id);
  const router = usePortalRouter();

  return (
    <BrandErrorScreen
      code={["4", "3"]}
      lock
      headline={t("title")}
      subtitle={t("subtitle")}
      primary={{
        label: t("backToDashboard"),
        icon: <ArrowBackRounded sx={{ fontSize: 16 }} />,
        onClick: () => router.push(config.homeRouteId),
      }}
      errorLine={
        <>
          <ErrorOutlineRounded sx={{ fontSize: 15 }} />
          {t("errorLine")}
        </>
      }
    />
  );
}
