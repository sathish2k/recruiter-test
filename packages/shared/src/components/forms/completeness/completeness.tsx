"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { useWatch } from "react-hook-form";
import { IconRenderer } from "../../renderers";
import type { WidgetProps } from "../types";

/** One quality check: met when any of its fields holds something. */
export interface CompletenessCheck {
  /** Translation key for the row label. */
  label: string;
  /** Fields that satisfy it — any one being filled is enough. */
  fields?: string[];
  /** Always met (the design counts job association as a given). */
  always?: boolean;
  /** Field to scroll to when the check is still open. Defaults to the first
   * entry of `fields`. */
  target?: string;
}

/** Brings a field's card into view and focuses its first control. */
function goToField(name: string) {
  const cell = document.querySelector(`[data-field="${name}"]`);
  if (!cell) return;
  (cell.closest(".MuiCard-root") ?? cell).scrollIntoView({ behavior: "smooth", block: "center" });
  const control = cell.querySelector<HTMLElement>("input, textarea, [tabindex]");
  window.setTimeout(() => control?.focus({ preventScroll: true }), 320);
}

const filled = (value: unknown): boolean => {
  if (Array.isArray(value)) {
    return value.some((entry) =>
      entry && typeof entry === "object"
        ? Object.values(entry as Record<string, unknown>).some(filled)
        : filled(entry),
    );
  }
  if (typeof value === "string") return value.trim().length > 0;
  return Boolean(value);
};

/**
 * The design's completeness card: a percentage, a bar, and the list of checks
 * with the unmet ones first so the next thing to fix is at the top. Reads live
 * form values, so it moves as the form is filled.
 */
export function CompletenessWidget({ prop, t, control }: WidgetProps) {
  const checks = prop.checks ?? [];
  const watched = checks.flatMap((check) => check.fields ?? []);
  const values = useWatch({ control, name: watched.length ? watched : [" __none__"] }) as unknown[];
  const byName = Object.fromEntries(watched.map((name, index) => [name, values[index]]));

  const rows = checks.map((check) => ({
    label: check.label,
    ok: check.always || (check.fields ?? []).some((name) => filled(byName[name])),
    target: check.target ?? check.fields?.[0],
  }));
  const done = rows.filter((row) => row.ok).length;
  const percent = rows.length ? Math.round((done / rows.length) * 100) : 0;
  const strong = percent >= 80;

  return (
    <Card variant="base" sx={{ p: "18px 20px" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{t(prop.title ?? "")}</Typography>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 700,
            color: strong ? "surface.successFg" : "surface.accentBright",
          }}
        >
          {percent}%
        </Typography>
      </Box>

      <Box
        sx={{
          height: 5,
          mt: "10px",
          borderRadius: "999px",
          bgcolor: "surface.track",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${percent}%`,
            height: "100%",
            borderRadius: "999px",
            bgcolor: strong ? "surface.successFg" : "surface.accentBright",
          }}
        />
      </Box>

      <Typography sx={{ fontSize: 11.5, color: "text.disabled", mt: "8px" }}>
        {t(prop.help ?? "", { done, total: rows.length })}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap: "12px",
          rowGap: "7px",
          mt: "12px",
        }}
      >
        {/* Unmet first — the card is a to-do list, not a scoreboard. */}
        {[...rows]
          .sort((a, b) => Number(a.ok) - Number(b.ok))
          .map((row) => (
            <Box
              key={row.label}
              onClick={row.ok || !row.target ? undefined : () => goToField(row.target as string)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: 12,
                cursor: row.ok || !row.target ? "default" : "pointer",
                "&:hover": row.ok || !row.target ? undefined : { color: "text.primary" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flex: "none",
                  color: row.ok ? "surface.successFg" : "surface.warningFg",
                }}
              >
                <IconRenderer name={row.ok ? "check-circle" : "warning"} size={15} />
              </Box>
              <Box
                component="span"
                sx={{
                  flex: 1,
                  minWidth: 0,
                  color: row.ok ? "surface.textMuted" : "surface.warningFg",
                }}
              >
                {t(row.label)}
              </Box>
              {row.ok ? null : (
                <Box sx={{ display: "flex", flex: "none", color: "surface.textDisabled" }}>
                  <IconRenderer name="arrow-forward" size={13} />
                </Box>
              )}
            </Box>
          ))}
      </Box>
    </Card>
  );
}
