"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import { IconRenderer, Toast, useToast } from "@recruit/shared";
import delve from "dlv";
import { useState } from "react";
import type { EmployeeKpisConfig } from "./employee-kpis.configuration";

export function EmployeeKpisComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<EmployeeKpisConfig>(id);
  const { data } = useFetch<Record<string, unknown>>(id);
  const toast = useToast();
  const [logged, setLogged] = useState(0);
  const cards = config?.cards ?? [];
  if (!data || !config) return null;

  const target = Number(delve(data, config.targetKey) ?? 0);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "18px",
      }}
    >
      {cards.map((card) => {
        const base = Number(delve(data, card.key) ?? 0);
        const value = card.progress ? base + logged : base;
        const pct = target > 0 ? Math.round((value / target) * 100) : 0;

        return (
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
              {value}
            </Typography>
            {card.progress ? (
              <>
                <Typography
                  sx={{ fontSize: 12, color: "text.secondary", mt: "8px" }}
                >
                  {t("invitesSent.ofTarget", { pct })}
                </Typography>
                <Box
                  sx={{
                    height: 6,
                    borderRadius: "999px",
                    background: "rgba(255,255,255,.18)",
                    overflow: "hidden",
                    mt: "10px",
                  }}
                >
                  <Box
                    sx={{
                      width: `${Math.min(pct, 100)}%`,
                      height: "100%",
                      borderRadius: "999px",
                      background: "rgba(255,255,255,.9)",
                    }}
                  />
                </Box>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    setLogged((count) => count + 1);
                    toast.show(t("toast.logged"), t("toast.loggedSub"));
                  }}
                  startIcon={<IconRenderer name="add" size={15} />}
                  sx={{ fontSize: 12, mt: "14px" }}
                >
                  {t("log")}
                </Button>
              </>
            ) : (
              <Typography
                sx={{ fontSize: 12, color: "text.secondary", mt: "8px" }}
              >
                {t(card.sub, data)}
              </Typography>
            )}
          </Card>
        );
      })}
      <Toast toast={toast.toast} onClose={toast.clear} />
    </Box>
  );
}
