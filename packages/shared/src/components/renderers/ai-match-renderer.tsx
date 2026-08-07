import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import Box from "@mui/material/Box";
import delve from "dlv";

export interface AiMatchRendererConfig {
  type: "ai-match";
  path: string;
  suffix?: string;
  /** Literal text color. */
  color?: string;
  /** Data path for the text color (overrides `color`). */
  colorPath?: string;
  /** Leading text inside the badge ("AI "). */
  prefix?: string;
  /** `inline` (default) is the sparkle + score; `pill` is the design`s
   * accent-bordered badge beside a candidate name. */
  variant?: "inline" | "pill";
}

export function AiMatchRenderer({
  config,
  data = {},
}: {
  config: AiMatchRendererConfig;
  data?: Record<string, unknown>;
}) {
  const color = config.colorPath
    ? String(delve(data, config.colorPath) ?? "var(--mui-palette-surface-accentBright)")
    : (config.color ?? "var(--mui-palette-surface-accentBright)");
  const value = delve(data, config.path);
  if (value == null || value === "") return null;

  const body = `${config.prefix ?? ""}${String(value)}${config.suffix ?? ""}`;

  if (config.variant === "pill") {
    return (
      <Box
        component="span"
        sx={{
          flex: "none",
          fontSize: 11,
          fontWeight: 700,
          color: "surface.primarySoftFg",
          bgcolor: "surface.primarySoftBg",
          border: "1px solid",
          borderColor: "surface.primarySoftBorder",
          p: "2px 8px",
          borderRadius: "999px",
        }}
      >
        {body}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, color }}>
      <AutoAwesomeRounded sx={{ fontSize: 14 }} />
      {body}
    </Box>
  );
}
