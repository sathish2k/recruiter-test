"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

export function SectionCard({ children }: { children: ReactNode }) {
  return (
    <Card variant="base" sx={{ p: "20px 22px", borderRadius: "16px" }}>
      {children}
    </Card>
  );
}

export function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: 44,
        height: 26,
        flex: "none",
        borderRadius: "999px",
        position: "relative",
        cursor: "pointer",
        transition: "background .15s",
        background: on ? "#4EA874" : "#3A3A37",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 3,
          left: on ? 21 : 3,
          width: 20,
          height: 20,
          borderRadius: "999px",
          background: "#fff",
          transition: "left .15s",
        }}
      />
    </Box>
  );
}

export function Field({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.disabled" }}>
        {label}
      </Typography>
      <Card
        variant="inset"
        sx={{ p: "11px 14px", fontSize: 13.5, color: muted ? "text.secondary" : "text.primary" }}
      >
        {value}
      </Card>
    </Box>
  );
}

export function Row({ title, desc, action }: { title: string; desc: string; action: ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        py: "13px",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box>
        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{title}</Typography>
        <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>{desc}</Typography>
      </Box>
      {action}
    </Box>
  );
}
