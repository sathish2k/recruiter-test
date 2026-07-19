"use client";

import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import ErrorOutlineRounded from "@mui/icons-material/ErrorOutlineRounded";
import LockOpenRounded from "@mui/icons-material/LockOpenRounded";
import MarkEmailReadRounded from "@mui/icons-material/MarkEmailReadRounded";
import Box from "@mui/material/Box";
import { BrandErrorScreen, useConfiguration, usePortalRouter, useTranslation } from "@recruit/sdk";
import { useState } from "react";
import type { PermissionDeniedConfiguration } from "./permission-denied.configuration";

export function PermissionDeniedComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<typeof PermissionDeniedConfiguration>(id);
  const router = usePortalRouter();
  const [requested, setRequested] = useState(false);

  return (
    <BrandErrorScreen
      variant="denied"
      headline={requested ? t("requestedHeadline") : t("title")}
      subtitle={t("subtitle")}
      primary={{
        label: requested ? t("accessRequested") : t("requestAccess"),
        icon: requested ? (
          <CheckRounded sx={{ fontSize: 16 }} />
        ) : (
          <LockOpenRounded sx={{ fontSize: 16 }} />
        ),
        onClick: requested ? undefined : () => setRequested(true),
      }}
      secondary={{
        label: t("backToDashboard"),
        icon: <ArrowBackRounded sx={{ fontSize: 16 }} />,
        onClick: () => router.push(config.homeRouteId),
      }}
      note={
        requested ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "success.light",
            }}
          >
            <MarkEmailReadRounded sx={{ fontSize: 14 }} />
            {t("requestedNote")}
          </Box>
        ) : undefined
      }
      errorLine={
        <>
          <ErrorOutlineRounded sx={{ fontSize: 15 }} />
          {t("errorLine")}
        </>
      }
    />
  );
}
