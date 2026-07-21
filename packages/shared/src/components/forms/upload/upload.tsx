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
  preview?: "square" | "circle";
  removeLabel?: string;
  errorLabel?: (reason: "type" | "size") => string;
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
  preview = "square",
  removeLabel = "Remove",
  errorLabel,
}: UploadFieldProps) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

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
    onChange(URL.createObjectURL(file), file);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
      <Box
        onClick={() => input.current?.click()}
        sx={{
          width: 64,
          height: 64,
          flex: "none",
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
          cursor: "pointer",
          borderRadius: preview === "circle" ? "999px" : "14px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.default",
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
          <IconRenderer name="upload_file" size={22} sx={{ color: "text.disabled" }} />
        )}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        {label ? (
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "surface.textMuted", mb: "7px" }}>
            {label}
          </Typography>
        ) : null}

        <Box sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Button
            variant="outlined"
            onClick={() => input.current?.click()}
            startIcon={<IconRenderer name="upload" size={14} />}
            sx={{ fontSize: 12 }}
          >
            {buttonLabel}
          </Button>
          {value ? (
            <Button
              color="error"
              onClick={() => onChange("", null)}
              sx={{ fontSize: 12, fontWeight: 400 }}
            >
              {removeLabel}
            </Button>
          ) : null}
        </Box>

        {help ? (
          <Typography sx={{ fontSize: 11, color: "text.disabled", mt: "7px" }}>{help}</Typography>
        ) : null}
        {error ? (
          <Typography sx={{ fontSize: 11, color: "error.main", mt: "3px" }}>{error}</Typography>
        ) : null}

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
    </Box>
  );
}

/** The `upload` widget. Value is `{ url, file }` — see UploadValue. */
export function UploadWidget({ prop, field, t }: WidgetProps) {
  const upload = (field.value ?? {}) as UploadValue;
  return (
    <UploadField
      value={typeof upload.url === "string" ? upload.url : ""}
      onChange={(url, file) => field.onChange({ url, file })}
      label={prop.hideLabel ? undefined : t(prop.title ?? "")}
      buttonLabel={t(prop.uploadLabel ?? "form.upload", "Upload")}
      accept={prop.accept}
      maxSizeMb={prop.maxSizeMb}
      help={prop.help ? t(prop.help) : undefined}
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
