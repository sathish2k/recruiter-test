"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
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
    <Card variant="feature">
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
        <Avatar
          sx={{
            width: 44,
            height: 44,
            bgcolor: n.avatarBg,
            color: n.avatarFg,
            fontSize: 14,
          }}
        >
          {n.initials}
        </Avatar>
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
        <Button variant="contained" color="secondary" sx={{ fontSize: 12.5 }}>
          {t("join")}
        </Button>
      </Box>
    </Card>
  );
}
