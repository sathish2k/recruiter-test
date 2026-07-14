"use client";

import Box from "@mui/material/Box";
import { useFetch, useTranslation } from "@recruit/sdk";

interface NextInterview {
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  role: string;
  when: string;
  inLabel: string;
}

export function NextInterviewComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const { data } = useFetch<{ next: NextInterview }>(id);
  const n = data?.next;
  if (!n) return null;

  return (
    <Box
      sx={{
        borderRadius: "16px",
        p: "20px",
        background:
          "radial-gradient(120% 140% at 85% 0%,rgba(242,106,27,.4),rgba(28,28,27,.9) 55%),#1C1C1B",
        border: "1px solid rgba(255,255,255,.09)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: "16px",
        }}
      >
        <Box sx={{ fontSize: 12, letterSpacing: ".1em", color: "#D9B79A" }}>
          {t("label")}
        </Box>
        <Box sx={{ fontSize: 12.5, color: "#F0B27C", fontWeight: 600 }}>
          {n.inLabel}
        </Box>
      </Box>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: "12px", mb: "14px" }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "999px",
            background: n.avatarBg,
            color: n.avatarFg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {n.initials}
        </Box>
        <Box>
          <Box sx={{ fontSize: 15.5, fontWeight: 700 }}>{n.name}</Box>
          <Box sx={{ fontSize: 12.5, color: "#C9C5BD" }}>{n.role}</Box>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ fontSize: 13, color: "#C9C5BD" }}>{n.when}</Box>
        <Box
          sx={{
            p: "8px 16px",
            borderRadius: "999px",
            background: "#F5F3F0",
            color: "#1a1a1a",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: "pointer",
            "&:hover": { filter: "brightness(.92)" },
          }}
        >
          {t("join")}
        </Box>
      </Box>
    </Box>
  );
}
