"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import { IconRenderer } from "./icon-renderer";

export interface FunnelStage {
  key: string;
  count: number;
  pct: number;
  /** Optional bar tone; "success" renders the green gradient (later stages). */
  tone?: "default" | "success";
}

export interface FunnelData {
  stages: FunnelStage[];
  insightStage?: string;
  insightDrop?: number;
}

export interface FunnelRendererConfig {
  /** Card title — `name` is a translation key. */
  title: { name: string };
  /** Prefix for each stage's label translation key (default "stage."). */
  stageLabelPrefix?: string;
  /** Row value template — a translation key interpolated with the stage row
   * (i18next `{{count}}` / `{{pct}}` style). */
  valueFormat: { name: string };
  /** Trailing amber insight note. `name` is a translation key interpolated
   * with `{ stage, drop }`; `icon` overrides the leading icon. */
  insight?: { name: string; icon?: string };
}

const ORANGE = "linear-gradient(90deg,#FF8A3C,#C24509)";
const GREEN = "linear-gradient(90deg,#4EA874,#2E7D52)";

export function FunnelRenderer({
  id,
  config: configProp,
  data: dataProp,
}: {
  id: string;
  config?: FunnelRendererConfig;
  data?: FunnelData;
}) {
  const configFromId = useConfiguration<FunnelRendererConfig>(id);
  const config = configProp ?? configFromId;
  const { t } = useTranslation(id);
  // The engine injects `data={}` when this renderer is used directly as a
  // bootstrap value; an empty object means "no data provided → fetch".
  const seedData = dataProp && Object.keys(dataProp).length > 0 ? dataProp : undefined;
  const { data } = useFetch<FunnelData>(id, { data: seedData });
  if (!data || !config) return null;

  const prefix = config.stageLabelPrefix ?? "stage.";

  return (
    <Card variant="base">
      <Typography sx={{ fontSize: 14.5, fontWeight: 700, mb: "16px" }}>
        {t(config.title.name)}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "13px" }}>
        {data.stages.map((stage) => (
          <Box key={stage.key}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: "6px",
              }}
            >
              <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                {t(`${prefix}${stage.key}`)}
              </Typography>
              <Typography sx={{ fontSize: 12.5 }}>
                {t(config.valueFormat.name, { ...stage })}
              </Typography>
            </Box>
            <Box
              sx={{
                height: 9,
                borderRadius: "999px",
                background: "rgba(255,255,255,.06)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: `${stage.pct}%`,
                  height: "100%",
                  borderRadius: "999px",
                  background: stage.tone === "success" ? GREEN : ORANGE,
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
      {config.insight ? (
        <Alert
          severity="warning"
          icon={<IconRenderer name={config.insight.icon ?? "psychology"} size={18} />}
          sx={{ mt: "18px" }}
        >
          {t(config.insight.name, {
            stage: t(`${prefix}${data.insightStage}`),
            drop: data.insightDrop,
          })}
        </Alert>
      ) : null}
    </Card>
  );
}
