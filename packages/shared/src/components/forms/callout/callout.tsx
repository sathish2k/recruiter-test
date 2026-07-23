"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { IconRenderer } from "../../renderers";
import type { WidgetProps } from "../types";

/** Display-only accent callout. Two looks: the default `"card"` (bordered tip
 * with a title + help — drop into a `bare` section so it owns the container) and
 * `"banner"` (a filled accent strip of icon + help text, no title — sits inline
 * as one field in a section). Ignores the field value. */
export function CalloutWidget({ prop, t }: WidgetProps) {
  if (prop.variant === "banner") {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          p: "10px 13px",
          borderRadius: "11px",
          border: "1px solid",
          borderColor: "surface.primarySoftBorder",
          bgcolor: "surface.primarySoftBg",
        }}
      >
        {prop.icon ? (
          <Box sx={{ color: "surface.accentBright", flex: "none", display: "flex" }}>
            <IconRenderer name={prop.icon} size={16} />
          </Box>
        ) : null}
        {prop.help ? (
          <Typography sx={{ fontSize: 11.5, lineHeight: 1.5, color: "#E8C4A6" }}>
            {t(prop.help)}
          </Typography>
        ) : null}
      </Box>
    );
  }
  return (
    <Box
      sx={{
        p: "20px",
        borderRadius: "16px",
        border: "1px solid",
        borderColor: "surface.primarySoftBorder",
        bgcolor: "surface.paper",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "9px" }}>
        {prop.icon ? (
          <Box sx={{ color: "surface.accentBright", flex: "none", display: "flex" }}>
            <IconRenderer name={prop.icon} size={17} />
          </Box>
        ) : null}
        {prop.title ? (
          <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>{t(prop.title)}</Typography>
        ) : null}
      </Box>
      {prop.help ? (
        <Typography
          sx={{ fontSize: 12.5, color: "surface.textMuted", lineHeight: 1.65, mt: "8px" }}
        >
          {t(prop.help)}
        </Typography>
      ) : null}
    </Box>
  );
}
