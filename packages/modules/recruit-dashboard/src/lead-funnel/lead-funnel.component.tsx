"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { useFetch, useTranslation } from "@recruit/sdk";
import { IconRenderer } from "@recruit/shared";

interface FunnelStage {
  key: string;
  count: number;
  pct: number;
}

interface Funnel {
  stages: FunnelStage[];
  insightStage: string;
  insightDrop: number;
}

export function LeadFunnelComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const { data } = useFetch<Funnel>(id);
  if (!data) return null;

  return (
    <Card variant="base">
      <Typography sx={{ fontSize: 14.5, fontWeight: 700, mb: "16px" }}>
        {t("title")}
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
                {t(`stage.${stage.key}`)}
              </Typography>
              <Typography sx={{ fontSize: 12.5 }}>
                {t("stageValue", { count: stage.count, pct: stage.pct })}
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
                  background: "linear-gradient(90deg,#FF8A3C,#C24509)",
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
      <Alert
        severity="warning"
        icon={<IconRenderer name="psychology" size={18} />}
        sx={{ mt: "18px" }}
      >
        {t("insight", {
          stage: t(`stage.${data.insightStage}`),
          drop: data.insightDrop,
        })}
      </Alert>
    </Card>
  );
}
