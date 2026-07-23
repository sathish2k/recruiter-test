"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { IconRenderer } from "../../renderers";
import type { Attachment, WidgetProps } from "../types";

/** Uploads one file and returns its stored `{ name, url, size, type }`. */
export type AttachmentUploader = (
  file: File,
  onProgress?: (percent: number) => void,
) => Promise<Attachment>;

export interface ResumeAutofillProps extends WidgetProps {
  /** Injected by the screen (the datasource does the upload). */
  uploader?: AttachmentUploader;
}

/**
 * The design's "Autofill from resume" card: drop a CV, it uploads, and the
 * stored file also becomes the candidate's `resume` (so the parse source is
 * kept). AI extraction is server-side; this owns the upload + the parsed-state
 * messaging. Its own field value isn't persisted.
 */
export function ResumeAutofillWidget({ field, t, uploader }: ResumeAutofillProps) {
  const { setValue } = useFormContext();
  const [state, setState] = useState<"idle" | "parsing" | "done">("idle");
  const [name, setName] = useState("");

  const onFile = async (file?: File | null) => {
    if (!file) return;
    setName(file.name);
    setState("parsing");
    const att = await uploader?.(file);
    if (att?.url) {
      field.onChange([att]);
      // The dropped CV becomes the stored resume too.
      setValue("resume", [att], { shouldDirty: true });
      setState("done");
    } else {
      setState("idle");
    }
  };

  if (state === "done") {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: "11px",
          p: "12px 14px",
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "surface.successSoftBorder",
          bgcolor: "surface.successSoftBg",
        }}
      >
        <Box sx={{ color: "surface.successFg", display: "flex", flex: "none", mt: "1px" }}>
          <IconRenderer name="check-circle" size={18} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{name}</Typography>
          <Typography sx={{ fontSize: 11.5, color: "surface.textSecondary", lineHeight: 1.5 }}>
            {t("fields.autofillDone", "Parsed — review the fields on the left before saving.")}
          </Typography>
        </Box>
      </Box>
    );
  }

  const parsing = state === "parsing";
  return (
    <Box
      component="label"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        p: "14px 10px",
        borderRadius: "12px",
        border: "1px dashed",
        borderColor: "rgba(242,106,27,.5)",
        color: "surface.primarySoftFg",
        cursor: parsing ? "default" : "pointer",
        textAlign: "center",
      }}
    >
      <Box sx={{ display: "flex" }}>
        <IconRenderer name={parsing ? "sparkle" : "upload-file"} size={17} />
      </Box>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "inherit" }}>
        {parsing
          ? t("fields.autofillParsing", "Parsing…")
          : t("fields.autofillBrowse", "Browse or drop a resume")}
      </Typography>
      <input
        type="file"
        hidden
        accept="application/pdf,.doc,.docx"
        disabled={parsing}
        onChange={(event) => onFile(event.target.files?.[0])}
      />
    </Box>
  );
}
