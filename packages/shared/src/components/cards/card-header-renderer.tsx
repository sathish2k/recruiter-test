"use client";

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { GenericRenderer } from "../renderers/generic-renderer";
import { IconRenderer } from "../renderers/icon-renderer";
import type { CardHeaderConfig, T } from "./card-renderer.types";

const KICKER_SX = {
  feature: { fontSize: 12, letterSpacing: ".1em", color: "surface.kicker", fontWeight: 400 },
  accent: {
    fontSize: 11,
    letterSpacing: ".07em",
    color: "surface.primarySoftFg",
    fontWeight: 700,
  },
  title: { fontSize: 13.5, fontWeight: 600, color: "text.primary" },
} as const;

const HEADER_GAP = { feature: "16px", accent: "8px", title: "11px" } as const;

export function CardHeaderRenderer({
  config,
  data,
  t,
  isLoading,
}: {
  config: CardHeaderConfig;
  data: Record<string, unknown>;
  t: T;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Box
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "16px" }}
      >
        <Skeleton variant="text" width={130} height={16} />
        {config.aside ? <Skeleton variant="text" width={54} height={16} /> : null}
      </Box>
    );
  }

  const kickerSx = KICKER_SX[config.kicker?.variant ?? "feature"];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        mb: HEADER_GAP[config.kicker?.variant ?? "feature"],
      }}
    >
      {config.kicker ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px", ...kickerSx }}>
          {config.kicker.icon ? (
            <IconRenderer name={config.kicker.icon} size={13} color="inherit" />
          ) : null}
          {t(config.kicker.name, data)}
        </Box>
      ) : null}
      {config.aside ? <GenericRenderer config={config.aside} data={data} /> : null}
    </Box>
  );
}
