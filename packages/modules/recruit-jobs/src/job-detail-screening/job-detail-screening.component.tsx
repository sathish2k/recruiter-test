"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useFetch, useRouteParams, useTranslation } from "@recruit/sdk";
import { IconRenderer } from "@recruit/shared";

interface Screening {
  enabled: boolean;
  threshold: number;
  total: number;
  screened: number;
  matched: number;
  knockoutCount: number;
}

/** The rail's AI Screening panel — the accent card, and what the screener has
 * actually scored on this requirement. */
export function JobDetailScreeningComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const params = useRouteParams();
  const { data, isLoading } = useFetch<Screening>(id, { filters: { id: params.id } });

  if (isLoading || !data) return <Skeleton variant="rounded" height={150} />;

  const rows: { key: string; value: string; accent?: boolean }[] = [
    { key: "screened", value: t("values.screened", { done: data.screened, total: data.total }) },
    { key: "matched", value: String(data.matched), accent: true },
    { key: "threshold", value: `${data.threshold}%` },
    { key: "knockouts", value: String(data.knockoutCount) },
  ];

  return (
    <Box
      sx={{
        bgcolor: "surface.paper",
        border: "1px solid",
        borderColor: "surface.primarySoftBorder",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "11px",
          p: "14px 18px",
          background: "var(--mui-palette-surface-heroTint)",
        }}
      >
        <Box
          sx={{
            width: 30,
            height: 30,
            flex: "none",
            borderRadius: "9px",
            display: "grid",
            placeItems: "center",
            background: "var(--mui-palette-primary-main)",
            color: "#fff",
          }}
        >
          <IconRenderer name="sparkle" size={16} />
        </Box>
        <Typography sx={{ fontSize: 14, fontWeight: 700, flex: 1 }}>{t("title")}</Typography>
        <Chip
          variant="soft"
          size="small"
          color={data.enabled ? "success" : "default"}
          label={t(data.enabled ? "on" : "off")}
        />
      </Box>

      <Box sx={{ p: "14px 18px", display: "flex", flexDirection: "column", gap: "9px" }}>
        {rows.map((row) => (
          <Box
            key={row.key}
            sx={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}
          >
            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
              {t(`labels.${row.key}`)}
            </Typography>
            <Typography
              sx={{
                fontSize: 12.5,
                fontWeight: row.accent ? 700 : 600,
                color: row.accent ? "surface.accentBright" : "text.primary",
              }}
            >
              {row.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
