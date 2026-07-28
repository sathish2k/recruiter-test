"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

export function AuthCard({
  icon,
  iconColor = "surface.accentBright",
  title,
  subtitle,
  subtitleGap = "26px",
  width = 420,
  children,
  "data-testid": testId,
}: {
  icon: ReactNode;
  /** The design tints the tile per state — amber pending, red expired, green done. */
  iconColor?: string;
  title: ReactNode;
  subtitle: ReactNode;
  /** Space below the subtitle. Shorter when a second line follows it. */
  subtitleGap?: string;
  width?: number;
  children: ReactNode;
  "data-testid"?: string;
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
        data-testid={testId}
        sx={{
          width,
          maxWidth: "100%",
          borderRadius: "24px",
          p: "38px 44px 34px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "var(--mui-palette-surface-menuShadow)",
        }}
      >
        <Avatar
          variant="rounded"
          sx={{
            width: 56,
            height: 56,
            borderRadius: "16px",
            background:
              "linear-gradient(180deg,var(--mui-palette-surface-neutral),var(--mui-palette-background-paper))",
            border: "1px solid var(--mui-palette-surface-border)",
            color: iconColor,
            boxShadow: "var(--mui-palette-surface-menuShadow)",
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
            color: "text.secondary",
            textAlign: "center",
            maxWidth: 320,
            mb: subtitleGap,
          }}
        >
          {subtitle}
        </Typography>
        <Box sx={{ width: "100%" }}>{children}</Box>
      </Card>
    </Box>
  );
}
