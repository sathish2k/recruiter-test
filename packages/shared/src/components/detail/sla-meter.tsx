"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export interface SlaMeterProps {
  /** Already-translated caption before the track ("48h SLA"). */
  label: string;
  /** 0–100, already clamped by the caller. */
  percent: number;
  /** Already-translated caption after the track ("8h left"). */
  trailing: string;
  /** Past the SLA — the track turns red rather than accent. */
  breached?: boolean;
  width?: number;
}

/**
 * The design's SLA strip: a kicker, a thin track, and how long is left. Drawn
 * the same wherever a countdown appears — the client header's hero and the
 * contact's "waiting on" card both use it.
 */
export function SlaMeter({ label, percent, trailing, breached, width = 120 }: SlaMeterProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "9px" }}>
      <Typography sx={{ fontSize: 11, fontWeight: 700, color: "surface.kicker" }}>
        {label}
      </Typography>
      <Box
        sx={{
          width,
          height: 5,
          flex: "none",
          borderRadius: "999px",
          overflow: "hidden",
          bgcolor: "surface.track",
        }}
      >
        <Box
          sx={{
            width: `${percent}%`,
            height: "100%",
            borderRadius: "999px",
            bgcolor: breached ? "error.main" : "surface.accentBright",
          }}
        />
      </Box>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color: breached ? "error.main" : "surface.textSecondary",
        }}
      >
        {trailing}
      </Typography>
    </Box>
  );
}
