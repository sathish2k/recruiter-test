"use client";

import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import { useRef } from "react";
import { FieldShell } from "../field/field-shell";
import type { WidgetProps } from "../types";

const HEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

/** Swatch + hex input, kept in sync. The swatch opens the OS picker; the text
 * field accepts a pasted hex. Stores the hex string. */
export function ColorWidget({ prop, field, fieldState, t }: WidgetProps) {
  const picker = useRef<HTMLInputElement | null>(null);
  const value = typeof field.value === "string" ? field.value : "";
  const valid = HEX.test(value);

  return (
    <FieldShell
      label={t(prop.title ?? "")}
      hideLabel={prop.hideLabel}
      help={prop.help ? t(prop.help) : undefined}
      error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
    >
      <Box sx={{ display: "flex", gap: (theme) => theme.form.inlineGap, alignItems: "center" }}>
        <Box
          onClick={() => picker.current?.click()}
          aria-label={t("form.pickColour", "Pick a colour")}
          sx={{
            width: 38,
            height: 38,
            flex: "none",
            cursor: "pointer",
            borderRadius: (theme) => theme.form.controlRadius,
            border: "1px solid",
            borderColor: "surface.border",
            // Falls back to the inset surface until the value is a valid hex.
            bgcolor: valid ? value : "surface.inset",
          }}
        />
        <Box
          component="input"
          ref={picker}
          type="color"
          value={valid ? value : "#000000"}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            field.onChange(event.target.value.toUpperCase())
          }
          sx={{ display: "none" }}
        />
        <InputBase
          value={value}
          onChange={(event) => field.onChange(event.target.value.toUpperCase())}
          onBlur={field.onBlur}
          placeholder={prop.placeholder ? t(prop.placeholder) : "#000000"}
          sx={{
            flex: 1,
            fontFamily: "monospace",
            fontSize: 13.5,
            px: (theme) => theme.form.controlPadX,
            py: (theme) => theme.form.controlPadY,
            borderRadius: (theme) => theme.form.controlRadius,
            border: "1px solid",
            borderColor: fieldState.error ? "error.main" : "surface.border",
            bgcolor: "surface.inset",
          }}
        />
      </Box>
    </FieldShell>
  );
}
