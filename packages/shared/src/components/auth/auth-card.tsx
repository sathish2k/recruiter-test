"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
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
      <Card
        variant="accent"
        sx={{
          width,
          maxWidth: "100%",
          borderRadius: "24px",
          p: "38px 44px 34px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0 30px 80px rgba(0,0,0,.5)",
        }}
      >
        <Avatar
          variant="rounded"
          sx={{
            width: 56,
            height: 56,
            borderRadius: "16px",
            background: "linear-gradient(180deg,#2A2A28,#1C1C1B)",
            border: "1px solid rgba(255,255,255,.12)",
            color: "#FF9D57",
            boxShadow: "0 10px 24px rgba(0,0,0,.4)",
            mb: "20px",
          }}
        >
          {icon}
        </Avatar>
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
      </Card>
    </Box>
  );
}
