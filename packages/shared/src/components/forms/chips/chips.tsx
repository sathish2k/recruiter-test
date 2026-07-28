"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import InputBase from "@mui/material/InputBase";
import { useState } from "react";
import { IconRenderer } from "../../renderers";
import { FieldShell } from "../field/field-shell";
import type { WidgetProps } from "../types";

export function ChipsWidget({
  prop,
  field,
  fieldState,
  t,
  onSuggest,
}: WidgetProps & {
  /** Injected by the screen: returns values to merge in — e.g. skills read back
   * out of the uploaded resume. Its presence adds the design's header action. */
  onSuggest?: () => Promise<string[]>;
}) {
  const values: string[] = Array.isArray(field.value) ? field.value : [];
  // Which chips the suggestion added, so the design can mark them.
  const [suggested, setSuggested] = useState<Set<string>>(() => new Set());
  const [busy, setBusy] = useState(false);

  const suggest = async () => {
    if (!onSuggest || busy) return;
    setBusy(true);
    try {
      const found = await onSuggest();
      const fresh = found.filter(
        (value) => !values.some((existing) => existing.toLowerCase() === value.toLowerCase()),
      );
      if (fresh.length) {
        setSuggested((current) => new Set([...current, ...fresh]));
        field.onChange([...values, ...fresh]);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <FieldShell
      label={t(prop.title ?? "")}
      labelSuffix={
        onSuggest && prop.suggestLegend ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: 10.5,
              color: "text.disabled",
            }}
          >
            <IconRenderer name="sparkle" size={12} />
            {t("form.aiExtracted", "= AI-extracted")}
          </Box>
        ) : undefined
      }
      hideLabel={prop.hideLabel}
      help={prop.help ? t(prop.help) : undefined}
      error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
      labelAction={
        onSuggest ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Button
              variant="soft"
              size="small"
              onClick={suggest}
              disabled={busy}
              startIcon={<IconRenderer name="sparkle" size={14} />}
            >
              {t(prop.suggestLabel ?? "form.suggest", "Suggest")}
            </Button>
          </Box>
        ) : undefined
      }
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
            label={
              suggested.has(value) ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <IconRenderer name="sparkle" size={11} />
                  {value}
                </Box>
              ) : (
                value
              )
            }
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
