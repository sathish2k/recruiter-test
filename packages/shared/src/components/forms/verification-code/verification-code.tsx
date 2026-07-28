"use client";

import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import { FieldShell } from "../field/field-shell";
import type { WidgetProps } from "../types";

/**
 * A fixed-length numeric code: a row of cells showing what has been entered,
 * and one real input under them that accepts typing *or* a paste.
 *
 * The cells are display only. Six separate inputs look the same until you try
 * to paste a code into them, or use a password manager, or reach them with a
 * screen reader — so there is exactly one field here, and the cells mirror it.
 */
export function VerificationCodeWidget({ name, prop, field, fieldState, t }: WidgetProps) {
  const length = prop.maxLength ?? 6;
  const code = String(field.value ?? "")
    .replace(/\D/g, "")
    .slice(0, length);

  return (
    <FieldShell
      label={t(prop.title ?? name)}
      hideLabel={prop.hideLabel}
      help={prop.help ? t(prop.help) : undefined}
      error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Box
          aria-hidden
          data-testid="verification-code-cells"
          sx={{ display: "flex", gap: "9px", mb: "18px" }}
        >
          {Array.from({ length }, (_, index) => {
            const char = code[index] ?? "";
            // Three strengths: entered, where the next digit lands, and untouched.
            const borderColor = char
              ? "surface.focusRing"
              : index === code.length
                ? "surface.controlOutline"
                : "surface.controlBorder";
            return (
              <Box
                // Positional cells with no identity of their own.
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length display
                key={index}
                data-testid={`verification-code-cell-${index}`}
                sx={{
                  width: 46,
                  height: 56,
                  borderRadius: "12px",
                  bgcolor: "surface.inset",
                  border: "1.5px solid",
                  borderColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 21,
                  fontWeight: 700,
                  color: "text.primary",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {char}
              </Box>
            );
          })}
        </Box>

        <InputBase
          value={code}
          name={name}
          inputRef={field.ref}
          onBlur={field.onBlur}
          onChange={(event) =>
            field.onChange(event.target.value.replace(/\D/g, "").slice(0, length))
          }
          placeholder={t(prop.placeholder ?? "")}
          slotProps={{ input: { inputMode: "numeric", autoComplete: "one-time-code" } }}
          data-testid={`field-${name}`}
          sx={{
            width: "100%",
            bgcolor: "surface.inset",
            border: "1px solid",
            borderColor: "surface.controlBorder",
            borderRadius: "12px",
            p: "12px 15px",
            fontSize: 13,
            color: "text.primary",
            letterSpacing: ".02em",
            "&.Mui-focused": { borderColor: "surface.focusRing" },
            "& .MuiInputBase-input": { p: 0, textAlign: "center" },
          }}
        />
      </Box>
    </FieldShell>
  );
}
