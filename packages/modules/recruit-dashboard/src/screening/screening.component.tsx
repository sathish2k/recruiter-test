"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { useFetch, useTranslation } from "@recruit/sdk";

interface Screening {
  screened: number;
  quota: number;
  distribution: { label: string; pct: number; color: string }[];
}

export function ScreeningComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const { data } = useFetch<Screening>(id);
  if (!data) return null;
  const { screened, quota, distribution } = data;

  return (
    <Card variant="base">
      <Box sx={{ fontSize: 14.5, fontWeight: 600, mb: "6px" }}>
        {t("title")}
      </Box>
      <Box sx={{ fontSize: 21, fontWeight: 700 }}>
        {screened} {t("screened")}{" "}
        <Box
          component="span"
          sx={{ fontSize: 13, fontWeight: 400, color: "#9A968E" }}
        >
          {t("quota", { quota })}
        </Box>
      </Box>
      <Box sx={{ fontSize: 13, color: "#C9C5BD", m: "16px 0 8px" }}>
        {t("distribution")}
      </Box>
      <Box
        sx={{
          display: "flex",
          gap: "4px",
          height: 10,
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        {distribution.map((d) => (
          <Box key={d.label} sx={{ width: `${d.pct}%`, background: d.color }} />
        ))}
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px 14px",
          mt: "12px",
          fontSize: 12.5,
          color: "#C9C5BD",
        }}
      >
        {distribution.map((d) => (
          <Box
            key={d.label}
            sx={{ display: "flex", alignItems: "center", gap: "7px" }}
          >
            <Box
              sx={{
                width: 9,
                height: 9,
                borderRadius: "2px",
                background: d.color,
                flex: "none",
              }}
            />
            {d.label} ({d.pct}%)
          </Box>
        ))}
      </Box>
    </Card>
  );
}
