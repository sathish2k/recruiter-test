import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import delve from "dlv";

export interface BooleanRendererConfig {
  type: "boolean";
  path: string;
  trueText?: string;
  falseText?: string;
  asChip?: boolean;
}

export function BooleanRenderer({
  config,
  data = {},
}: {
  config: BooleanRendererConfig;
  data?: Record<string, unknown>;
}) {
  const value = !!delve(data, config.path);
  const label = value ? (config.trueText ?? "Yes") : (config.falseText ?? "No");
  return config.asChip ? (
    <Chip label={label} size="small" variant="soft" color={value ? "success" : "default"} />
  ) : (
    <Typography component="span">{label}</Typography>
  );
}
