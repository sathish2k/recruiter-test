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
        background: on ? "var(--mui-palette-success-main)" : "var(--mui-palette-surface-neutral)",
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

/** Card heading + optional sub-caption and right-hand slot. */
export function CardHeader({
  title,
  subtitle,
  badge,
  action,
}: {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "14px",
        mb: subtitle ? "14px" : "10px",
      }}
    >
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>{title}</Typography>
          {badge}
        </Box>
        {subtitle ? (
          <Typography sx={{ fontSize: 12, color: "text.disabled", mt: "2px" }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {action}
    </Box>
  );
}

/** Gradient progress bar used by the security score, seats and AI credits. */
export function Meter({ percent, color }: { percent: number; color?: string }) {
  return (
    <Box
      sx={{
        height: 8,
        borderRadius: 999,
        // The design's track is the inset surface, not a translucent white.
        background: "var(--mui-palette-surface-inset)",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          height: "100%",
          borderRadius: 999,
          width: `${Math.min(100, Math.max(0, percent))}%`,
          background: color ?? ((theme) => theme.gradients.meter),
          transition: "width .25s",
        }}
      />
    </Box>
  );
}

/** Label-over-value tile (usage stats, SSO details). */
export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="inset" sx={{ p: "12px 14px" }}>
      <Typography sx={{ fontSize: 11, color: "text.disabled", fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 15, fontWeight: 700, mt: "3px" }}>{value}</Typography>
    </Card>
  );
}

/** A list row with a leading icon: sessions, tokens, integrations. */
export function ListRow({
  icon,
  title,
  meta,
  chips,
  action,
}: {
  icon?: ReactNode;
  title: ReactNode;
  meta?: string;
  chips?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "13px",
        py: "13px",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      {icon ? <Box sx={{ display: "flex", color: "text.disabled" }}>{icon}</Box> : null}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{title}</Typography>
          {chips}
        </Box>
        {meta ? (
          <Typography sx={{ fontSize: 11.5, color: "text.secondary", mt: "2px" }}>
            {meta}
          </Typography>
        ) : null}
      </Box>
      {action}
    </Box>
  );
}
