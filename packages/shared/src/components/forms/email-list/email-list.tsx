"use client";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { IconRenderer } from "../../renderers";
import { FieldShell } from "../field/field-shell";
import type { JsonSchemaProperty, WidgetProps } from "../types";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** `errorMessage` is either one key or a per-rule map. */
function invalidKey(errorMessage: JsonSchemaProperty["errorMessage"]): string {
  if (typeof errorMessage === "string") return errorMessage;
  return errorMessage?.format ?? "";
}

/**
 * Recipient list: a normal control where Enter commits the typed address as a
 * removable pill beneath it — the design's billing-email field, which takes
 * several finance contacts. The value is `string[]`.
 */
export function EmailListWidget({ prop, field, fieldState, t, disabled }: WidgetProps) {
  const values: string[] = Array.isArray(field.value)
    ? field.value
    : typeof field.value === "string" && field.value
      ? [field.value]
      : [];
  const [draft, setDraft] = useState("");
  const [invalid, setInvalid] = useState(false);

  const commit = () => {
    const email = draft.trim();
    if (!email) return;
    if (!EMAIL.test(email)) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setDraft("");
    if (!values.includes(email)) field.onChange([...values, email]);
  };

  const error = fieldState.error?.message ? t(fieldState.error.message) : undefined;

  return (
    <FieldShell
      label={t(prop.title ?? "")}
      hideLabel={prop.hideLabel}
      help={prop.help ? t(prop.help) : undefined}
      error={error ?? (invalid ? t(invalidKey(prop.errorMessage)) : undefined)}
    >
      <TextField
        fullWidth
        hiddenLabel
        value={draft}
        disabled={disabled}
        error={Boolean(error) || invalid}
        placeholder={prop.placeholder ? t(prop.placeholder) : undefined}
        onChange={(event) => {
          setDraft(event.target.value);
          setInvalid(false);
        }}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          commit();
        }}
      />

      {values.length ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {values.map((email) => (
            <Box
              key={email}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                p: "4px 7px 4px 11px",
                borderRadius: "999px",
                bgcolor: "surface.hover",
                border: "1px solid",
                borderColor: "surface.border",
                fontSize: 11.5,
                fontWeight: 600,
                color: "surface.textMuted",
              }}
            >
              {email}
              <Box
                onClick={() => field.onChange(values.filter((item) => item !== email))}
                sx={{ display: "flex", color: "surface.textDisabled", cursor: "pointer" }}
              >
                <IconRenderer name="close" size={13} />
              </Box>
            </Box>
          ))}
        </Box>
      ) : null}
    </FieldShell>
  );
}
