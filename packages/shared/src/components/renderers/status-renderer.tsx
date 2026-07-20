import Box from "@mui/material/Box";
import Chip, { type ChipProps } from "@mui/material/Chip";
import delve from "dlv";

export interface StatusRendererConfig {
  type: "status";
  path: string;
  labels?: Record<string, string>;
  colors?: Record<string, ChipProps["color"]>;
  variant?: ChipProps["variant"];
  /** Render a leading dot (in the current text color) before the label. */
  dot?: boolean;
  sx?: ChipProps["sx"];
}

export function StatusRenderer({
  config,
  data = {},
}: {
  config: StatusRendererConfig;
  data?: Record<string, unknown>;
}) {
  const key = String(delve(data, config.path) ?? "");
  const label = config.labels?.[key] ?? key;
  return (
    <Chip
      label={
        config.dot ? (
          <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Box
              component="span"
              sx={{
                width: 5,
                height: 5,
                borderRadius: "999px",
                background: "currentColor",
              }}
            />
            {label}
          </Box>
        ) : (
          label
        )
      }
      size="small"
      variant={config.variant ?? "soft"}
      color={config.colors?.[key] ?? "default"}
      sx={config.sx}
    />
  );
}
