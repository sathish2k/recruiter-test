"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useRouteParams, useTranslation } from "@recruit/sdk";
import { seedRows } from "../../utils/seed-data";
import { LinkRenderer, type LinkRendererConfig } from "./link-renderer";

/** One tile of the strip: the stage, and how many sit in it. */
export interface StageStripRow {
  key: string;
  label: string;
  count: number;
}

export interface StageStripRendererConfig {
  /** Kicker above the strip. Interpolated with the fetch `meta`, so it can
   * print the totals the design puts there. */
  kicker: { name: string };
  /** Header link on the right ("Open board"). */
  link?: LinkRendererConfig;
  /** Set when stage labels are translation keys rather than workspace names. */
  labelPrefix?: string;
}

/**
 * The board strip the design draws across a requisition: a count tile per
 * stage, joined by the dashed connectors the rest of the app uses for
 * progression. Distinct from `StageFunnelRenderer`, which is the dashboard's
 * column board.
 */
export function StageStripRenderer({
  id,
  config: configProp,
  data: dataProp,
}: {
  id: string;
  config?: StageStripRendererConfig;
  data?: StageStripRow[];
}) {
  const configFromId = useConfiguration<StageStripRendererConfig>(id);
  const config = configProp ?? configFromId;
  const { t } = useTranslation(id);
  // The strip belongs to one record, so it reads the route's id the way the
  // other detail cards do.
  const params = useRouteParams();
  const { data, meta, isLoading } = useFetch<StageStripRow[]>(id, {
    data: seedRows<StageStripRow>(dataProp),
    filters: params.id ? { id: params.id } : undefined,
  });
  const rows = Array.isArray(data) ? data : [];

  if (!config?.kicker) return null;

  return (
    <Card variant="base" sx={{ p: "20px 24px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".08em",
            color: "text.secondary",
            textTransform: "uppercase",
          }}
        >
          {t(config.kicker.name, { ...meta })}
        </Typography>
        {config.link ? <LinkRenderer config={config.link} /> : null}
      </Box>

      {isLoading ? (
        <Skeleton variant="rounded" height={68} sx={{ mt: "16px" }} />
      ) : (
        <Box sx={{ display: "flex", alignItems: "center", mt: "16px", overflowX: "auto" }}>
          {rows.map((row, index) => (
            <Box key={row.key} sx={{ display: "flex", alignItems: "center", flex: "none" }}>
              <Box
                sx={{
                  minWidth: 104,
                  p: "12px 14px",
                  borderRadius: "10px",
                  bgcolor: "surface.inset",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography sx={{ fontSize: 19, fontWeight: 700 }}>{row.count}</Typography>
                <Typography
                  sx={{ fontSize: 11, color: "text.disabled", mt: "2px", whiteSpace: "nowrap" }}
                >
                  {config.labelPrefix
                    ? t(`${config.labelPrefix}${row.label}`, row.label)
                    : row.label}
                </Typography>
              </Box>
              {index < rows.length - 1 ? (
                <Box sx={{ width: 20, borderTop: "1px dashed", borderColor: "divider" }} />
              ) : null}
            </Box>
          ))}
        </Box>
      )}
    </Card>
  );
}
