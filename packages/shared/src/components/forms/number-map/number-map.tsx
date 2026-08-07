"use client";

import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { FieldShell } from "../field/field-shell";
import { useRemoteOptions } from "../select/remote-options";
import type { WidgetProps } from "../types";

/**
 * One number per option, stored as `{ [option value]: number }` — the
 * requirement's per-stage SLA overrides. The options come from the API
 * (`optionSource`), so the rows follow whatever the workspace's pipeline is;
 * `defaultKey` names the field on each option row that supplies the fallback
 * shown as the placeholder.
 */
export function NumberMapWidget({ prop, field, t, disabled }: WidgetProps) {
  const { options } = useRemoteOptions(prop.optionSource, "");
  const value = (field.value ?? {}) as Record<string, number>;

  const set = (key: string, next: string) => {
    const rest = { ...value };
    if (next === "") delete rest[key];
    else rest[key] = Number(next);
    field.onChange(rest);
  };

  return (
    <FieldShell
      label={t(prop.title ?? "")}
      hideLabel={prop.hideLabel}
      help={prop.help ? t(prop.help) : undefined}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {options.map((option) => {
          const fallback = prop.defaultKey
            ? Number((option.raw as Record<string, unknown> | undefined)?.[prop.defaultKey] ?? 0)
            : 0;
          return (
            <Box
              key={option.value}
              data-option={option.value}
              sx={{ display: "flex", alignItems: "center", gap: "12px" }}
            >
              <Typography sx={{ flex: 1, minWidth: 0, fontSize: 13, color: "text.secondary" }}>
                {option.label}
              </Typography>
              <TextField
                hiddenLabel
                type="number"
                sx={{ width: 128, flex: "none" }}
                disabled={disabled}
                value={value[option.value] ?? ""}
                onChange={(event) => set(option.value, event.target.value)}
                placeholder={fallback ? String(fallback) : t(prop.placeholder ?? "")}
                slotProps={{
                  htmlInput: { min: 0, max: 365 },
                  input: prop.unit
                    ? {
                        endAdornment: (
                          <InputAdornment position="end" sx={{ color: "text.disabled" }}>
                            {t(prop.unit)}
                          </InputAdornment>
                        ),
                      }
                    : undefined,
                }}
              />
            </Box>
          );
        })}
      </Box>
    </FieldShell>
  );
}
