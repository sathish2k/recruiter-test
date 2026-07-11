import Chip, { type ChipProps } from "@mui/material/Chip";
import delve from "dlv";

export interface StatusRendererConfig {
  type: "status";
  path: string;
  labels?: Record<string, string>;
  colors?: Record<string, ChipProps["color"]>;
  variant?: ChipProps["variant"];
}

export function StatusRenderer({
  config,
  data = {},
}: {
  config: StatusRendererConfig;
  data?: Record<string, unknown>;
}) {
  const key = String(delve(data, config.path) ?? "");
  return (
    <Chip
      label={config.labels?.[key] ?? key}
      size="small"
      variant={config.variant ?? "soft"}
      color={config.colors?.[key] ?? "default"}
    />
  );
}
