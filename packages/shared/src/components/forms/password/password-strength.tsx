"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { JsonSchemaProperty, PasswordStrengthConfig, Translate } from "../types";

/**
 * The standard policy. Exported so a form can reference or extend it rather
 * than restate the rules — `strengthMeter: true` resolves to exactly this, and
 * any form needing a different policy passes its own `levels`.
 */
export const DEFAULT_PASSWORD_STRENGTH: PasswordStrengthConfig = {
  levels: [
    { rule: "^.{8,}$", label: "form.strength.weak", fallback: "Weak", color: "error.main" },
    { rule: "[A-Z]", label: "form.strength.okay", fallback: "Okay", color: "warning.main" },
    { rule: "[0-9]", label: "form.strength.strong", fallback: "Strong", color: "success.main" },
  ],
};

/** `true` means the default policy; an object overrides it wholesale. */
export function resolveStrengthConfig(
  strengthMeter: JsonSchemaProperty["strengthMeter"],
): PasswordStrengthConfig | null {
  if (!strengthMeter) return null;
  return strengthMeter === true ? DEFAULT_PASSWORD_STRENGTH : strengthMeter;
}

export interface PasswordStrengthMeterProps {
  value: string;
  config: PasswordStrengthConfig;
  t: Translate;
}

/**
 * Segmented bar + label. The score is how many levels the value satisfies, so
 * the meter's length and wording follow entirely from `config.levels`.
 */
export function PasswordStrengthMeter({ value, config, t }: PasswordStrengthMeterProps) {
  const { levels } = config;
  const score = value ? levels.filter((level) => new RegExp(level.rule).test(value)).length : 0;
  const reached = score > 0 ? levels[score - 1] : undefined;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1 }}>
      {levels.map((level, index) => (
        <Box
          key={level.rule}
          sx={{
            flex: 1,
            height: 4,
            borderRadius: 999,
            bgcolor: score > index ? (reached?.color ?? level.color) : "surface.neutral",
          }}
        />
      ))}
      <Typography sx={{ fontSize: 11, color: "text.secondary", ml: 0.75, minWidth: 34 }}>
        {reached ? t(reached.label, reached.fallback) : ""}
      </Typography>
    </Box>
  );
}
