"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useRef, useState } from "react";
import { IconRenderer } from "../../renderers";
import type { UploadValue, WidgetProps } from "../types";

export interface UploadFieldProps {
  /** Current image URL, or "" when nothing is set. */
  value: string;
  /** Receives the object URL for preview; `file` is what you upload. */
  onChange: (value: string, file: File | null) => void;
  label?: string;
  buttonLabel?: string;
  /** Mime allow-list passed to the file input. */
  accept?: string;
  maxSizeMb?: number;
  help?: string;
  /** Second help line, under the first. */
  helpSecondary?: string;
  preview?: "square" | "circle";
  removeLabel?: string;
  errorLabel?: (reason: "type" | "size" | "upload") => string;
  /** Uploads the picked file, reporting 0–100. When given, the tile draws the
   * design`s progress ring and a completion tick; without it the field just holds
   * the File for the caller to upload on submit. */
  uploader?: (file: File, onProgress: (percent: number) => void) => Promise<{ url: string }>;
}

/**
 * Image picker with a live preview tile. Holds the chosen File and hands it to
 * the caller, which owns the actual upload — the field itself never touches the
 * network, so it works the same for org logos, avatars and client logos.
 */
export function UploadField({
  value,
  onChange,
  label,
  buttonLabel = "Upload",
  accept = "image/png,image/jpeg,image/webp,image/svg+xml",
  maxSizeMb = 2,
  help,
  helpSecondary,
  preview = "square",
  removeLabel = "Remove",
  errorLabel,
  uploader,
}: UploadFieldProps) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  // null = idle; 0–100 = uploading; 100 then cleared = just finished.
  const [percent, setPercent] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const remove = () => {
    setDone(false);
    setPercent(null);
    setError(null);
    onChange("", null);
  };

  const pick = (file?: File | null) => {
    if (!file) return;
    setError(null);
    const allowed = accept.split(",").map((a) => a.trim());
    if (allowed.length && !allowed.includes(file.type)) {
      setError(errorLabel?.("type") ?? "That file type isn't supported");
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(errorLabel?.("size") ?? `Keep it under ${maxSizeMb} MB`);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    if (!uploader) {
      onChange(objectUrl, file);
      return;
    }
    // Show the local preview immediately, then swap in the stored URL.
    onChange(objectUrl, file);
    setDone(false);
    setPercent(0);
    uploader(file, setPercent)
      .then((stored) => {
        onChange(stored.url || objectUrl, file);
        setDone(true);
      })
      .catch(() => setError(errorLabel?.("upload") ?? "Upload failed"))
      .finally(() => setPercent(null));
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        bgcolor: "surface.inset",
        border: "1px solid",
        borderColor: "surface.controlBorder",
        borderRadius: "13px",
        p: "12px 14px",
      }}
    >
      <Box sx={{ position: "relative", width: 50, height: 50, flex: "none" }}>
        {percent !== null ? (
          <Box
            sx={{
              position: "absolute",
              inset: "-5px",
              borderRadius: "16px",
              background: (theme) =>
                `conic-gradient(${theme.palette.primary.main} ${percent}%, ${theme.palette.surface.border} 0)`,
            }}
          />
        ) : null}
        <Box
          sx={{
            position: "absolute",
            inset: "-2px",
            borderRadius: "14px",
            bgcolor: "surface.inset",
          }}
        />
        <Box
          onClick={() => input.current?.click()}
          sx={{
            position: "relative",
            width: 50,
            height: 50,
            flex: "none",
            display: "grid",
            placeItems: "center",
            overflow: "hidden",
            cursor: "pointer",
            borderRadius: preview === "circle" ? "999px" : "13px",
            // Empty reads as a drop target (dashed); filled is just the image.
            border: value ? "none" : "1px dashed",
            borderColor: "surface.borderStrong",
            color: "surface.textDisabled",
          }}
        >
          {value ? (
            <Box
              component="img"
              src={value}
              alt=""
              sx={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <IconRenderer name="upload_file" size={22} />
          )}
        </Box>
        {done && value ? (
          <Box
            sx={{
              position: "absolute",
              right: -6,
              bottom: -6,
              width: 20,
              height: 20,
              borderRadius: "999px",
              bgcolor: "success.main",
              border: "2.5px solid",
              borderColor: "surface.inset",
              display: "grid",
              placeItems: "center",
              color: "#fff",
            }}
          >
            <IconRenderer name="check" size={12} />
          </Box>
        ) : null}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {label ? (
          <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "surface.textMuted" }}>
            {label}
          </Typography>
        ) : null}
        {help ? (
          <Typography sx={{ fontSize: 11, color: "text.disabled", mt: "3px" }}>{help}</Typography>
        ) : null}
        {helpSecondary ? (
          <Typography sx={{ fontSize: 11, color: "text.disabled", mt: "3px" }}>
            {helpSecondary}
          </Typography>
        ) : null}
        {error ? (
          <Typography sx={{ fontSize: 11, color: "error.main", mt: "3px" }}>{error}</Typography>
        ) : null}
      </Box>

      {value ? (
        <Typography
          onClick={remove}
          sx={{
            flex: "none",
            fontSize: 12,
            fontWeight: 600,
            color: "surface.textSecondary",
            cursor: "pointer",
          }}
        >
          {removeLabel}
        </Typography>
      ) : (
        <Button
          variant="outlined"
          onClick={() => input.current?.click()}
          startIcon={<IconRenderer name="upload" size={14} />}
          sx={{ flex: "none", fontSize: 12.5 }}
        >
          {buttonLabel}
        </Button>
      )}

      <Box
        component="input"
        ref={input}
        type="file"
        accept={accept}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          pick(e.target.files?.[0]);
          // Allows re-picking the same file after a remove.
          e.target.value = "";
        }}
        sx={{ display: "none" }}
      />
    </Box>
  );
}

/** The `upload` widget. Value is `{ url, file }` — see UploadValue. */
export function UploadWidget({
  prop,
  field,
  t,
  uploader,
}: WidgetProps & { uploader?: UploadFieldProps["uploader"] }) {
  const upload = (field.value ?? {}) as UploadValue;
  return (
    <UploadField
      uploader={uploader}
      value={typeof upload.url === "string" ? upload.url : ""}
      onChange={(url, file) => field.onChange({ url, file })}
      label={prop.hideLabel ? undefined : t(prop.title ?? "")}
      buttonLabel={t(prop.uploadLabel ?? "form.upload", "Upload")}
      accept={prop.accept}
      maxSizeMb={prop.maxSizeMb}
      help={prop.help ? t(prop.help) : undefined}
      helpSecondary={prop.helpSecondary ? t(prop.helpSecondary) : undefined}
      preview={prop.preview}
      removeLabel={t("form.remove", "Remove")}
      errorLabel={(reason) =>
        reason === "type"
          ? t("form.fileType", "That file type isn't supported")
          : t("form.fileSize", "File is too large")
      }
    />
  );
}
