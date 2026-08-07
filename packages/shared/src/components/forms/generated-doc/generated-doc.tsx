"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { IconRenderer } from "../../renderers";
import { FieldShell } from "../field/field-shell";
import type { Attachment, WidgetProps } from "../types";

/**
 * A document the app produces rather than one you upload — the design's
 * "Formatted resume" cell: an icon, what it is, and the action that builds it.
 * Once produced it reads like any other attachment, with a remove control.
 */
export function GeneratedDocWidget({
  prop,
  field,
  t,
  onGenerate,
}: WidgetProps & {
  /** Injected by the screen — builds the document and returns the stored file. */
  onGenerate?: () => Promise<Attachment | null>;
}) {
  const files: Attachment[] = Array.isArray(field.value) ? field.value : [];
  const existing = files[0];
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    if (!onGenerate || busy) return;
    setBusy(true);
    try {
      const made = await onGenerate();
      if (made) field.onChange([made]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <FieldShell label={t(prop.title ?? "")} hideLabel={prop.hideLabel}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          p: "13px 15px",
          borderRadius: "12px",
          border: "1px dashed",
          borderColor: existing ? "surface.successSoftBorder" : "surface.borderStrong",
          bgcolor: existing ? "surface.inset" : "transparent",
        }}
      >
        <Box sx={{ display: "flex", flex: "none", color: "surface.textDisabled" }}>
          <IconRenderer name={existing ? "pdf" : "description"} size={19} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 12.5,
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {existing ? existing.name : t(prop.emptyTitle ?? "", "No document yet")}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "text.disabled", mt: "1px", lineHeight: 1.45 }}>
            {t(prop.help ?? "")}
          </Typography>
        </Box>

        {existing ? (
          <Box
            onClick={() => field.onChange([])}
            sx={{
              display: "flex",
              flex: "none",
              color: "surface.textDisabled",
              cursor: "pointer",
              "&:hover": { color: "error.main" },
            }}
          >
            <IconRenderer name="close" size={16} />
          </Box>
        ) : (
          <Button
            variant="soft"
            size="small"
            disabled={busy || !onGenerate}
            onClick={generate}
            startIcon={<IconRenderer name="sparkle" size={14} />}
            sx={{ flex: "none" }}
          >
            {t(prop.generateLabel ?? "form.generate", "Generate")}
          </Button>
        )}
      </Box>
    </FieldShell>
  );
}
