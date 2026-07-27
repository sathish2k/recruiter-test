"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { type FieldValues, useFormContext } from "react-hook-form";
import { IconRenderer } from "../../renderers";
import { applyExtraction } from "../extraction/apply";
import { type DocumentExtractor, extractionPlan, planToContract } from "../extraction/contract";
import type { Attachment, JsonSchema, WidgetProps } from "../types";

/** Uploads one file and returns its stored `{ name, url, size, type }`. */
export type AttachmentUploader = (
  file: File,
  onProgress?: (percent: number) => void,
) => Promise<Attachment>;

export interface ResumeAutofillProps extends WidgetProps {
  /** Injected by the screen (the datasource does the upload). */
  uploader?: AttachmentUploader;
  /** Injected by the screen — parses the document server-side. */
  extractor?: DocumentExtractor;
  /** The form's schema. The extraction request is derived from it, so a field's
   * configuration is the only place it has to be declared. */
  schema?: JsonSchema;
}

const MAX_BYTES = 10 * 1024 * 1024;
/** Legacy `.doc` is deliberately absent — mammoth cannot read it. */
const ACCEPT = "application/pdf,.pdf,.docx";

type State = "idle" | "working" | "done" | "error";

/**
 * The design's "Autofill from resume" card: drop a CV, it uploads and is parsed
 * in parallel, and the extracted values prefill the rest of the form. Which
 * fields are requested and filled comes entirely from the schema's `extract`
 * flags — this component knows nothing about candidates.
 */
export function ResumeAutofillWidget({
  field,
  t,
  uploader,
  extractor,
  schema,
}: ResumeAutofillProps) {
  const { setValue, getValues, trigger } = useFormContext<FieldValues>();
  const [state, setState] = useState<State>("idle");
  const [name, setName] = useState("");
  const [filledCount, setFilledCount] = useState(0);
  const [message, setMessage] = useState("");

  const plan = useMemo(() => extractionPlan(schema), [schema]);

  const onFile = async (file?: File | null) => {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setState("error");
      setMessage(t("fields.autofillTooLarge", "That file is larger than 10MB"));
      return;
    }
    setName(file.name);
    setMessage("");
    setState("working");

    // Upload and parse are independent — one failing must not lose the other.
    const [upload, parsed] = await Promise.allSettled([
      uploader?.(file),
      extractor?.(file, planToContract(plan)),
    ]);

    if (upload.status === "fulfilled" && upload.value) {
      field.onChange([upload.value]);
      // The dropped CV becomes the stored resume too.
      setValue("resume", [upload.value], { shouldDirty: true });
    }

    if (parsed.status === "rejected") {
      setState("error");
      setMessage(
        parsed.reason instanceof Error && parsed.reason.message
          ? parsed.reason.message
          : t("fields.autofillFailed", "Could not read that document"),
      );
      return;
    }

    // Read current values at apply time, so a slow parse cannot overwrite
    // anything typed while it was running.
    const { values, filled } = applyExtraction(
      plan,
      (parsed.value ?? {}) as Record<string, unknown>,
      getValues(),
    );
    for (const [key, value] of Object.entries(values)) {
      setValue(key, value, { shouldDirty: true });
    }
    // One validation pass after the batch — per-call options are ignored on
    // array roots.
    if (filled.length) void trigger();
    setFilledCount(filled.length);
    setState("done");
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
            {filledCount
              ? `${filledCount} ${t("fields.autofillDone", "fields filled — review them before saving.")}`
              : t("fields.autofillNothing", "Nothing could be read — fill the fields in manually.")}
          </Typography>
        </Box>
      </Box>
    );
  }

  const working = state === "working";
  const failed = state === "error";
  return (
    <Box>
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
          borderColor: failed ? "error.main" : "rgba(242,106,27,.5)",
          color: failed ? "error.main" : "surface.primarySoftFg",
          cursor: working ? "default" : "pointer",
          textAlign: "center",
        }}
      >
        <Box sx={{ display: "flex" }}>
          <IconRenderer name={working ? "sparkle" : failed ? "warning" : "upload-file"} size={17} />
        </Box>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "inherit" }}>
          {working
            ? t("fields.autofillParsing", "Reading the resume…")
            : failed
              ? t("fields.autofillRetry", "Try another file")
              : t("fields.autofillBrowse", "Browse or drop a resume")}
        </Typography>
        <input
          type="file"
          hidden
          accept={ACCEPT}
          disabled={working}
          onChange={(event) => onFile(event.target.files?.[0])}
        />
      </Box>
      {failed && message ? (
        <Typography sx={{ fontSize: 11, color: "error.main", mt: "6px" }}>{message}</Typography>
      ) : null}
    </Box>
  );
}
