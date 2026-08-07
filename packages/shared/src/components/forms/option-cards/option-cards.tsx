"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FieldShell } from "../field/field-shell";
import type { ChoiceOption, WidgetProps } from "../types";

/**
 * Single choice drawn as a stack of full-width cards, each a radio dot beside a
 * label and a sentence of consequence — the design's role picker, where the
 * detail line *is* the decision. Distinct from `choice-chips` (sizes to its
 * content and wraps) and `tiles` (bare labels in an even row).
 *
 * An option may be locked: it still shows, dimmed and unpickable, carrying the
 * reason as its title — the design never hides a role you cannot grant, it
 * tells you who can.
 */
export function OptionCardsWidget({ name, prop, field, fieldState, t }: WidgetProps) {
  const options: ChoiceOption[] =
    prop.choices ??
    (prop.enum ?? []).map((value) => ({ value: String(value), label: String(value) }));
  const locked = prop.optionLocked ?? {};

  return (
    <FieldShell
      label={t(prop.title ?? name)}
      hideLabel={prop.hideLabel}
      help={prop.help ? t(prop.help) : undefined}
      error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
    >
      <Box
        role="radiogroup"
        data-testid={`field-${name}`}
        sx={{ display: "flex", flexDirection: "column", gap: "8px" }}
      >
        {options.map((option) => {
          const selected = String(field.value ?? "") === option.value;
          const lockedReason = locked[option.value];
          const pick = () => {
            if (!lockedReason) field.onChange(option.value);
          };
          return (
            <Box
              key={option.value}
              role="radio"
              aria-checked={selected}
              aria-disabled={!!lockedReason}
              tabIndex={lockedReason ? -1 : 0}
              title={lockedReason ? t(lockedReason) : undefined}
              data-testid={`${name}-option-${option.value}`}
              onClick={pick}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") pick();
              }}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: "11px",
                p: "12px 14px",
                borderRadius: "10px",
                border: "1px solid",
                cursor: lockedReason ? "not-allowed" : "pointer",
                opacity: lockedReason ? 0.5 : 1,
                bgcolor: selected ? "surface.primarySoftBg" : "transparent",
                borderColor: selected ? "surface.primarySoftBorder" : "divider",
                "&:hover": lockedReason ? undefined : { borderColor: "surface.primarySoftBorder" },
              }}
            >
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  mt: "1px",
                  flex: "none",
                  borderRadius: "999px",
                  border: "2px solid",
                  borderColor: selected ? "surface.primarySoftFg" : "text.disabled",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selected ? (
                  <Box
                    sx={{
                      width: 9,
                      height: 9,
                      borderRadius: "999px",
                      bgcolor: "surface.primarySoftFg",
                    }}
                  />
                ) : null}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{t(option.label)}</Typography>
                {option.meta ? (
                  <Typography
                    sx={{
                      fontSize: 11.5,
                      lineHeight: 1.55,
                      color: "text.disabled",
                      mt: "1px",
                      textWrap: "pretty",
                    }}
                  >
                    {t(option.meta)}
                  </Typography>
                ) : null}
              </Box>
            </Box>
          );
        })}
      </Box>
    </FieldShell>
  );
}
