"use client";

import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import { FieldShell } from "../field/field-shell";
import type { WidgetProps } from "../types";

/**
 * A fixed-length numeric code: a row of cells showing what has been entered,
 * with one real input laid transparently over them.
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
      <Box sx={{ position: "relative" }}>
        <Box
          aria-hidden
          data-testid="verification-code-cells"
          sx={{ display: "flex", gap: "10px", width: "100%" }}
        >
          {Array.from({ length }, (_, index) => {
            const char = code[index] ?? "";
            // Three strengths: entered, where the next digit lands, and untouched.
            const borderColor = char
              ? "primary.main"
              : index === code.length
                ? "surface.focusRing"
                : "surface.controlBorder";
            return (
              <Box
                // Positional cells with no identity of their own.
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length display
                key={index}
                data-testid={`verification-code-cell-${index}`}
                sx={{
                  flex: 1,
                  height: 60,
                  borderRadius: "8px",
                  bgcolor: "surface.inset",
                  border: "1.5px solid",
                  borderColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-grotesk), 'Space Grotesk', system-ui, sans-serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "text.primary",
                  fontVariantNumeric: "tabular-nums",
                  transition: "var(--recruit-motion-state)",
                }}
              >
                {char}
              </Box>
            );
          })}
        </Box>

        {/* One real field, sat invisibly over the cells: paste, autofill and a
            screen reader all reach it, and the row above is what's drawn. */}
        <InputBase
          value={code}
          name={name}
          inputRef={field.ref}
          onBlur={field.onBlur}
          onChange={(event) =>
            field.onChange(event.target.value.replace(/\D/g, "").slice(0, length))
          }
          inputProps={{ "aria-label": t(prop.title ?? name) }}
          slotProps={{ input: { inputMode: "numeric", autoComplete: "one-time-code" } }}
          data-testid={`field-${name}`}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: "pointer",
            "& .MuiInputBase-input": { height: "100%", p: 0, cursor: "pointer" },
          }}
        />
      </Box>
    </FieldShell>
  );
}
