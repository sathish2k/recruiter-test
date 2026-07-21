"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import InputBase from "@mui/material/InputBase";
import { FieldShell } from "../field/field-shell";
import type { WidgetProps } from "../types";

export function ChipsWidget({ prop, field, fieldState, t }: WidgetProps) {
  const values: string[] = Array.isArray(field.value) ? field.value : [];

  return (
    <FieldShell
      label={t(prop.title ?? "")}
      hideLabel={prop.hideLabel}
      help={prop.help ? t(prop.help) : undefined}
      error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: (theme) => theme.form.inlineGap,
        }}
      >
        {values.map((value, index) => (
          <Chip
            // biome-ignore lint/suspicious/noArrayIndexKey: duplicate tags are allowed, so position is the identity.
            key={`${value}-${index}`}
            variant="soft"
            label={value}
            onDelete={() => field.onChange(values.filter((_, other) => other !== index))}
          />
        ))}
        <InputBase
          placeholder={prop.placeholder ? t(prop.placeholder) : undefined}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            const input = event.target as HTMLInputElement;
            const value = input.value.trim();
            if (!value) return;
            field.onChange([...values, value]);
            input.value = "";
          }}
          sx={{
            border: "1px dashed",
            borderColor: "surface.borderStrong",
            borderRadius: (theme) => theme.form.pillRadius,
            px: (theme) => theme.form.controlPadX,
            py: "3px",
            fontSize: 12.5,
            width: 150,
          }}
        />
      </Box>
    </FieldShell>
  );
}
