import Box from "@mui/material/Box";
import delve from "dlv";

export interface PillRendererConfig {
  type: "pill";
  path: string;
  /** Per-value pill colors (fg/bg/border). */
  styles: Record<string, { fg: string; bg: string; border: string }>;
}

// A status/stage pill with arbitrary per-value colors (matches the design's
// custom pills, which the MUI-palette StatusRenderer can't express).
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
    <Box
      component="span"
      sx={{
        display: "inline-block",
        fontSize: 12,
        fontWeight: 600,
        color: st.fg,
        background: st.bg,
        border: `1px solid ${st.border}`,
        p: "4px 11px",
        borderRadius: "999px",
      }}
    >
      {value}
    </Box>
  );
}
