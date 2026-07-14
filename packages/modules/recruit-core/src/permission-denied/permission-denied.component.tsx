"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {
  useConfiguration,
  usePortalRouter,
  useTranslation,
} from "@recruit/sdk";
import { AuthCard, IconRenderer } from "@recruit/shared";
import type { PermissionDeniedConfiguration } from "./permission-denied.configuration";

type PermissionDeniedConfig = typeof PermissionDeniedConfiguration;

export function PermissionDeniedComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<PermissionDeniedConfig>(id);
  const router = usePortalRouter();

  return (
    <AuthCard
      icon={<IconRenderer name="lock" size={26} />}
      title={t("title")}
      subtitle={t("subtitle")}
    >
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          variant="contained"
          startIcon={<IconRenderer name="arrow-back" size={16} />}
          onClick={() => router.push(config.homeRouteId)}
        >
          {t("backToDashboard")}
        </Button>
      </Box>
    </AuthCard>
  );
}
