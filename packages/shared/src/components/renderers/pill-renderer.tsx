import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import delve from "dlv";

export interface PillRendererConfig {
  type: "pill";
  path: string;
  /** Per-value pill colors (fg/bg/border). */
  styles: Record<string, { fg: string; bg: string; border: string }>;
}

export function PillRenderer({
  config,
  data = {},
}: {
  config: PillRendererConfig;
  data?: Record<string, unknown>;
}) {
  const value = String(delve(data, config.path) ?? "");
  const st = config.styles[value];
  if (!st) return <Box component="span">{value}</Box>;
  return (
    <Chip
      variant="soft"
      size="small"
      label={value}
      sx={{
        color: st.fg,
        backgroundColor: st.bg,
        border: `1px solid ${st.border}`,
      }}
    />
  );
}
