"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import { IconRenderer } from "@recruit/shared";
import delve from "dlv";
import type { LeadKpisConfig } from "./lead-kpis.configuration";

export function LeadKpisComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<LeadKpisConfig>(id);
  const { data } = useFetch<Record<string, unknown>>(id);
  const cards = config?.cards ?? [];
  if (!data) return null;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "18px",
      }}
    >
      {cards.map((card) => (
        <Card key={card.key} variant={card.variant}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: "14px",
            }}
          >
            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
              {t(card.label)}
            </Typography>
            <IconRenderer name={card.icon} size={17} color="#F0B27C" />
          </Box>
          <Typography sx={{ fontSize: 30, fontWeight: 700, lineHeight: 1 }}>
            {String(delve(data, card.key) ?? 0)}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary", mt: "8px" }}>
            {t(card.sub, data)}
          </Typography>
        </Card>
      ))}
    </Box>
  );
}
