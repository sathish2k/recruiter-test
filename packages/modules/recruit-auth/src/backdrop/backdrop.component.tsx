"use client";

import Box from "@mui/material/Box";
import { BrandLogo, BrandWordmark } from "@recruit/shared";

/**
 * The auth backdrop: the design's "horizon rings" motif, drawn from the mark's
 * own geometry — a band across the upper canvas, the horizon hairline, the
 * takeoff kerf climbing off it into the amber pilot dot, and two rings centred
 * on the join. Everything is a theme token, so it re-resolves per scheme.
 */
export function AuthBackdropComponent() {
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      <Box sx={{ position: "absolute", inset: 0, opacity: 0.5 }}>
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: "46%",
            bgcolor: "surface.inset",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "46%",
            height: "1px",
            bgcolor: "surface.border",
          }}
        />
        {/* The takeoff kerf — it leaves the horizon and fades into the amber. */}
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: "46%",
            width: "60%",
            height: "1px",
            background: (theme) =>
              `linear-gradient(90deg,${theme.palette.surface.border},${theme.palette.surface.accentBright})`,
            transformOrigin: "left center",
            transform: "rotate(-26deg)",
          }}
        />
        {[1200, 1720].map((size, i) => (
          <Box
            key={size}
            sx={{
              position: "absolute",
              left: "50%",
              top: "46%",
              width: size,
              height: size,
              borderRadius: "999px",
              border: "1px solid",
              borderColor: "surface.border",
              transform: "translate(-50%,-50%)",
              opacity: i === 0 ? 1 : 0.6,
            }}
          />
        ))}
      </Box>

      <Box
        sx={{
          position: "absolute",
          top: 26,
          left: 28,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          color: "text.primary",
        }}
      >
        <BrandLogo size={38} />
        <BrandWordmark fontSize={19.5} />
      </Box>
    </Box>
  );
}
