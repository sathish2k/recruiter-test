import Typography, { type TypographyProps } from "@mui/material/Typography";
import delve from "dlv";

export interface TextRendererConfig {
  type: "string" | "text";
  path: string;
  transform?: "uppercase" | "lowercase" | "capitalize";
  prefix?: string;
  suffix?: string;
  variant?: TypographyProps["variant"];
  color?: TypographyProps["color"];
  placeholder?: string;
}

function transform(
  value: string,
  kind?: TextRendererConfig["transform"],
): string {
  if (kind === "uppercase") return value.toUpperCase();
  if (kind === "lowercase") return value.toLowerCase();
  if (kind === "capitalize")
    return value.charAt(0).toUpperCase() + value.slice(1);
  return value;
}

export function TextRenderer({
  config,
  data = {},
}: {
  config: TextRendererConfig;
  data?: Record<string, unknown>;
}) {
  const raw = delve(data, config.path);
  const value =
    raw == null || raw === "" ? (config.placeholder ?? "") : String(raw);
  return (
    <Typography component="span" variant={config.variant} color={config.color}>
      {config.prefix ?? ""}
      {transform(value, config.transform)}
      {config.suffix ?? ""}
    </Typography>
  );
}
