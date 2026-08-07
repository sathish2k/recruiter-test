"use client";

import SpaceDashboardRounded from "@mui/icons-material/SpaceDashboardRounded";
import { BrandErrorScreen, useConfiguration, usePortalRouter, useTranslation } from "@recruit/sdk";
import type { NotFoundConfiguration } from "./not-found.configuration";

export function NotFoundComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<typeof NotFoundConfiguration>(id);
  const router = usePortalRouter();

  return (
    <BrandErrorScreen
      code={["4", "4"]}
      headline={t("title")}
      subtitle={t("subtitle")}
      primary={{
        label: t("backToDashboard"),
        icon: <SpaceDashboardRounded sx={{ fontSize: 16 }} />,
        onClick: () => router.push(config.homeRouteId),
      }}
      errorLine={t("errorLine")}
    />
  );
}
