"use client";

import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRounded from "@mui/icons-material/RadioButtonUncheckedRounded";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { IconRenderer } from "../../renderers";
import { FieldShell } from "../field/field-shell";
import type { ChoiceOption, WidgetProps } from "../types";

/**
 * Choice drawn as a wrapping row of chips, each able to carry a second line of
 * detail — a zone's offset, a currency's symbol, a format's sample.
 *
 * `type: "array"` makes it multi-select and switches to the design's ticked
 * green treatment; a scalar stays single-select in the accent tone. Distinct
 * from `tiles`, which spreads a few bare labels across an even grid: this one
 * sizes to its content and wraps, so it takes a longer list.
 */
export function ChoiceChipsWidget({ name, prop, field, fieldState, t }: WidgetProps) {
  const multi = prop.type === "array";
  // A multi-select can list its options as `enum` (values are their own labels)
  // or as `choices` when they need a translation key.
  const options: ChoiceOption[] =
    prop.choices ??
    (prop.enum ?? []).map((value) => ({ value: String(value), label: String(value) }));
  const stacked = prop.choiceLayout === "stacked";
  const chosen = new Set(
    multi
      ? Array.isArray(field.value)
        ? field.value.map(String)
        : []
      : [String(field.value ?? "")],
  );

  const toggle = (option: ChoiceOption) => {
    if (!multi) {
      field.onChange(option.value);
      return;
    }
    const next = new Set(chosen);
    if (next.has(option.value)) next.delete(option.value);
    else next.add(option.value);
    // Ordered as configured, not by click order.
    field.onChange(options.filter((o) => next.has(o.value)).map((o) => o.value));
  };

  return (
    <FieldShell
      label={t(prop.title ?? name)}
      hideLabel={prop.hideLabel}
      labelIcon={
        prop.icon ? (
          <Box sx={{ display: "flex", color: prop.iconColor ?? "surface.accentBright" }}>
            <IconRenderer name={prop.icon} size={16} />
          </Box>
        ) : undefined
      }
      labelSuffix={
        prop.labelHint ? (
          <Typography sx={{ fontSize: 11, color: "text.disabled" }}>{t(prop.labelHint)}</Typography>
        ) : undefined
      }
      help={prop.help ? t(prop.help) : undefined}
      helpPlacement={prop.helpPlacement}
      error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
    >
      <Box
        role={multi ? "group" : "radiogroup"}
        data-testid={`field-${name}`}
        sx={{ display: "flex", flexWrap: "wrap", gap: multi ? "7px" : "8px" }}
      >
        {options.map((option) => {
          const selected = chosen.has(option.value);
          return (
            <Box
              key={option.value}
              role={multi ? "checkbox" : "radio"}
              aria-checked={selected}
              tabIndex={0}
              data-testid={`${name}-option-${option.value}`}
              onClick={() => toggle(option)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") toggle(option);
              }}
              sx={{
                display: "flex",
                alignItems: stacked ? "flex-start" : "center",
                flexDirection: stacked ? "column" : "row",
                gap: stacked ? "2px" : multi ? "6px" : "7px",
                borderRadius: stacked ? "12px" : "999px",
                p: stacked ? "9px 15px" : multi ? "6px 13px" : "7px 14px",
                minWidth: stacked ? 118 : undefined,
                cursor: "pointer",
                ...(multi
                  ? {
                      bgcolor: selected ? "surface.successSoftBg" : "surface.inset",
                      borderColor: selected ? "surface.successSoftBorder" : "divider",
                      color: selected ? "text.primary" : "text.disabled",
                    }
                  : {
                      bgcolor: selected ? "surface.primarySoftBg" : "surface.inset",
                      borderColor: selected ? "surface.primarySoftBorder" : "divider",
                      color: selected ? "surface.primarySoftFg" : "text.primary",
                      "&:hover": { borderColor: "surface.primarySoftBorder" },
                    }),
                border: "1px solid",
              }}
            >
              {multi ? (
                selected ? (
                  <CheckCircleRounded sx={{ fontSize: 14, color: "surface.successFg" }} />
                ) : (
                  <RadioButtonUncheckedRounded sx={{ fontSize: 14, color: "text.disabled" }} />
                )
              ) : null}
              {option.symbol ? (
                <Typography
                  component="span"
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: selected ? "surface.accentBright" : "text.disabled",
                  }}
                >
                  {option.symbol}
                </Typography>
              ) : null}
              <Typography
                component="span"
                sx={{ fontSize: multi ? 12 : 12.5, fontWeight: multi ? 500 : 600 }}
              >
                {t(option.label)}
              </Typography>
              {option.meta ? (
                <Typography component="span" sx={{ fontSize: 11, color: "text.disabled" }}>
                  {option.meta}
                </Typography>
              ) : null}
            </Box>
          );
        })}
      </Box>
    </FieldShell>
  );
}
