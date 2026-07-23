"use client";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { WidgetProps } from "@recruit/shared";
import { useWatch } from "react-hook-form";

/**
 * Fee value input whose label + placeholder track the sibling `feeBasis` — "Fee
 * % of annual CTC" for a percentage, "Flat fee per placement (₹)" for a flat
 * fee — matching the design's dynamic `{{ feeLabel }}`. Reads `feeBasis` off the
 * form context (FormWithSectionsRenderer wraps the tree in FormProvider). Lives
 * in the client module — it's specific to this screen.
 */
export function FeeValueField({ field, t }: WidgetProps) {
  const feeBasis = useWatch({ name: "feeBasis" }) as string | undefined;
  const isPct = (feeBasis ?? "percent") === "percent";
  const label = isPct
    ? t("fields.feeLabelPct", "Fee % of annual CTC")
    : t("fields.feeLabelFlat", "Flat fee per placement (₹)");
  const placeholder = isPct
    ? t("fields.feePhPct", "e.g. 8.33")
    : t("fields.feePhFlat", "e.g. 1,50,000");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "surface.textMuted" }}>
        {label}
      </Typography>
      <TextField
        value={typeof field.value === "string" ? field.value : ""}
        onChange={field.onChange}
        onBlur={field.onBlur}
        placeholder={placeholder}
        fullWidth
      />
    </Box>
  );
}
