import Box from "@mui/material/Box";
import Typography, { type TypographyProps } from "@mui/material/Typography";
import delve from "dlv";
import { CopyButton } from "./copy-button";

export interface TextRendererConfig {
  type: "string" | "text";
  path: string;
  transform?: "uppercase" | "lowercase" | "capitalize";
  prefix?: string;
  suffix?: string;
  variant?: TypographyProps["variant"];
  color?: TypographyProps["color"];
  /** Read the colour per row — a list flags a value that has gone stale. */
  colorPath?: string;
  sx?: TypographyProps["sx"];
  placeholder?: string;
  /** Path to a substring of the value to draw in bold — the design emphasises
   * the subject inside an activity sentence. The row supplies the subject, so
   * nothing is inferred from the text itself. */
  highlightPath?: string;
  /** Adds a copy-to-clipboard icon after the value (emails, phones, IDs). */
  copyable?: boolean;
  /** Toast title shown after copying (already-resolved literal). */
  copiedLabel?: string;
}

function transform(value: string, kind?: TextRendererConfig["transform"]): string {
  if (kind === "uppercase") return value.toUpperCase();
  if (kind === "lowercase") return value.toLowerCase();
  if (kind === "capitalize") return value.charAt(0).toUpperCase() + value.slice(1);
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
  const value = raw == null || raw === "" ? (config.placeholder ?? "") : String(raw);
  const subject = config.highlightPath ? String(delve(data, config.highlightPath) ?? "") : "";
  const at = subject ? value.indexOf(subject) : -1;
  const body =
    at < 0 ? (
      transform(value, config.transform)
    ) : (
      <>
        {value.slice(0, at)}
        <Box component="b" sx={{ fontWeight: 700, color: "text.primary" }}>
          {subject}
        </Box>
        {value.slice(at + subject.length)}
      </>
    );
  const text = (
    <Typography
      component="span"
      variant={config.variant}
      color={
        (config.colorPath
          ? (delve(data, config.colorPath) as TypographyProps["color"])
          : undefined) ?? config.color
      }
      sx={config.sx}
    >
      {config.prefix ?? ""}
      {body}
      {config.suffix ?? ""}
    </Typography>
  );

  if (config.copyable && value) {
    return (
      <Box
        component="span"
        sx={{ display: "inline-flex", alignItems: "center", gap: "7px", minWidth: 0 }}
      >
        {text}
        <CopyButton value={value} copiedLabel={config.copiedLabel} />
      </Box>
    );
  }
  return text;
}
