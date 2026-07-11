"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

export function AuthCard({
  icon,
  title,
  subtitle,
  width = 420,
  children,
}: {
  icon: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  width?: number;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        position: "relative",
        zIndex: 1,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: "60px 24px",
      }}
    >
      <Box
        sx={{
          width,
          maxWidth: "100%",
          background:
            "linear-gradient(180deg,rgba(242,106,27,.14),rgba(28,28,27,.6) 40%),#1C1C1B",
          border: "1px solid rgba(255,255,255,.09)",
          borderRadius: "24px",
          p: "40px 44px 36px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0 30px 80px rgba(0,0,0,.5)",
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "16px",
            background: "linear-gradient(180deg,#2A2A28,#1C1C1B)",
            border: "1px solid rgba(255,255,255,.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FF9D57",
            boxShadow: "0 10px 24px rgba(0,0,0,.4)",
            mb: "22px",
          }}
        >
          {icon}
        </Box>
        <Typography
          sx={{
            fontSize: 23,
            fontWeight: 700,
            letterSpacing: "-.01em",
            mb: "10px",
            textAlign: "center",
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontSize: 13.5,
            lineHeight: 1.5,
            color: "#9A968E",
            textAlign: "center",
            maxWidth: 320,
            mb: "26px",
          }}
        >
          {subtitle}
        </Typography>
        <Box sx={{ width: "100%" }}>{children}</Box>
      </Box>
    </Box>
  );
}
