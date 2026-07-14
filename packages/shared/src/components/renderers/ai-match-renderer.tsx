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
}

export function AiMatchRenderer({
  config,
  data = {},
}: {
  config: AiMatchRendererConfig;
  data?: Record<string, unknown>;
}) {
  const color = config.colorPath
    ? String(delve(data, config.colorPath) ?? "#FF9D57")
    : (config.color ?? "#FF9D57");
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontWeight: 700,
        color,
      }}
    >
      <AutoAwesomeRounded sx={{ fontSize: 14 }} />
      {String(delve(data, config.path) ?? "")}
      {config.suffix ?? ""}
    </Box>
  );
}
