"use client";

import Box from "@mui/material/Box";
import { keyframes } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
import { IconRenderer } from "../../renderers";
import { FieldShell } from "../field/field-shell";
import type { Attachment, WidgetProps } from "../types";

const DEFAULT_ACCEPT =
  "application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,image/png,image/jpeg";

// Animations from the design source.
const fileIn = keyframes`0%{opacity:0;transform:translateY(8px) scale(.96)}60%{opacity:1;transform:translateY(-2px) scale(1.01)}100%{opacity:1;transform:translateY(0) scale(1)}`;
const upBounce = keyframes`0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}`;
const tickPop = keyframes`0%{transform:scale(0);opacity:0}70%{transform:scale(1.25)}100%{transform:scale(1);opacity:1}`;

/** Uploads one file and resolves the stored attachment. Supplied by the module
 * (from its datasource) so the widget never owns an endpoint. */
export type AttachmentUploader = (
  file: File,
  onProgress?: (percent: number) => void,
) => Promise<Attachment>;

interface Pending {
  id: number;
  name: string;
  size: number;
  progress: number;
  error?: boolean;
}

function formatSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** A dropped file bypasses the input's `accept`, so match it here too. */
function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  return accept.split(",").some((raw) => {
    const rule = raw.trim().toLowerCase();
    if (!rule) return false;
    if (rule.startsWith(".")) return name.endsWith(rule);
    if (rule.endsWith("/*")) return file.type.startsWith(rule.slice(0, -1));
    return file.type === rule;
  });
}

const nameSx = {
  fontSize: 12.5,
  fontWeight: 600,
  whiteSpace: "nowrap" as const,
  overflow: "hidden",
  textOverflow: "ellipsis",
};

/** Multi-file dropzone matching the design: a dashed picker, an orange
 * "uploading" card (bouncing glyph + progress bar) per in-flight file, and a
 * green card that pops in when a file lands. With an `uploader` (injected by the
 * module from its datasource) files upload on pick; without one the raw `File`s
 * are held for the caller. */
export function AttachmentsWidget({
  prop,
  field,
  t,
  uploader,
}: WidgetProps & { uploader?: AttachmentUploader }) {
  const items = (field.value ?? []) as Attachment[];
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const [pending, setPending] = useState<Pending[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [rejected, setRejected] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);

  const maxSizeMb = prop.maxSizeMb;

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    setRejected(null);
    for (const file of Array.from(files)) {
      if (!matchesAccept(file, prop.accept)) {
        setRejected(`${file.name} — ${t("form.attachments.fileType", "unsupported file type")}`);
        continue;
      }
      if (maxSizeMb && file.size > maxSizeMb * 1024 * 1024) {
        setRejected(`${file.name} — ${t("form.attachments.fileTooLarge", `over ${maxSizeMb} MB`)}`);
        continue;
      }
      if (!uploader) {
        field.onChange([
          ...itemsRef.current,
          { name: file.name, size: file.size, type: file.type, file },
        ]);
        continue;
      }
      const id = ++idRef.current;
      setPending((rows) => [...rows, { id, name: file.name, size: file.size, progress: 0 }]);
      uploader(file, (percent) =>
        setPending((rows) =>
          rows.map((row) => (row.id === id ? { ...row, progress: percent } : row)),
        ),
      )
        .then((asset) => {
          field.onChange([
            ...itemsRef.current,
            { name: asset.name, url: asset.url, size: asset.size, type: asset.type },
          ]);
          setPending((rows) => rows.filter((row) => row.id !== id));
        })
        .catch(() =>
          setPending((rows) => rows.map((row) => (row.id === id ? { ...row, error: true } : row))),
        );
    }
  };

  const remove = (index: number) => field.onChange(items.filter((_, current) => current !== index));

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    handleFiles(event.dataTransfer.files);
  };

  return (
    <FieldShell
      label={t(prop.title ?? "")}
      hideLabel={prop.hideLabel}
      help={prop.help ? t(prop.help) : undefined}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Dropzone */}
        <Box
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "9px",
            p: "16px",
            borderRadius: "12px",
            border: "1px dashed",
            borderColor: dragOver ? "surface.primarySoftBorder" : "surface.controlBorder",
            bgcolor: dragOver ? "surface.hover" : "transparent",
            color: dragOver ? "text.primary" : "text.secondary",
            fontSize: 12.5,
            cursor: "pointer",
            transition: "border-color .15s, background .15s, color .15s",
            "&:hover": { borderColor: "surface.primarySoftBorder", color: "text.primary" },
          }}
        >
          <IconRenderer name="upload_file" size={18} />
          <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>
            {t(prop.uploadLabel ?? "form.attachments.browse", "Browse or drop a file")}
          </Typography>
        </Box>

        {rejected ? (
          <Typography sx={{ fontSize: 11.5, color: "error.main" }}>{rejected}</Typography>
        ) : null}

        {/* Uploaded / held files — green when stored, neutral while held. */}
        {items.map((item, index) => (
          <Box
            // biome-ignore lint/suspicious/noArrayIndexKey: files are only appended/removed, never reordered, and names can collide.
            key={`${item.name}-${index}`}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "11px",
              p: "11px 14px",
              borderRadius: "12px",
              border: "1px solid",
              borderColor: item.url ? "surface.successSoftBorder" : "surface.border",
              bgcolor: "surface.inset",
              animation: `${fileIn} 250ms cubic-bezier(0,0,.2,1) both`,
            }}
          >
            <Box sx={{ color: "surface.errorFg", flex: "none", display: "flex" }}>
              <IconRenderer name="pdf" size={19} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={nameSx}>
                {item.url ? (
                  <Box
                    component="a"
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    sx={{
                      color: "inherit",
                      textDecoration: "none",
                      "&:hover": { color: "primary.light" },
                    }}
                  >
                    {item.name}
                  </Box>
                ) : (
                  item.name
                )}
              </Typography>
              {item.size ? (
                <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
                  {formatSize(item.size)}
                </Typography>
              ) : null}
            </Box>
            {item.url ? (
              <Box
                sx={{
                  color: "surface.successFg",
                  flex: "none",
                  display: "flex",
                  animation: `${tickPop} 250ms cubic-bezier(0,0,.2,1) both`,
                }}
              >
                <IconRenderer name="check-circle" size={18} />
              </Box>
            ) : null}
            <Box
              onClick={() => remove(index)}
              sx={{
                display: "flex",
                cursor: "pointer",
                color: "text.disabled",
                flex: "none",
                "&:hover": { color: "text.primary" },
              }}
            >
              <IconRenderer name="close" size={16} />
            </Box>
          </Box>
        ))}

        {/* In-flight uploads */}
        {pending.map((row) => (
          <Box
            key={row.id}
            sx={{
              p: "11px 14px",
              borderRadius: "12px",
              border: "1px solid",
              borderColor: row.error ? "surface.errorFg" : "surface.primarySoftBorder",
              bgcolor: "surface.inset",
              animation: `${fileIn} 250ms cubic-bezier(0,0,.2,1) both`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: "11px", mb: "9px" }}>
              <Box
                sx={{
                  color: "surface.accentBright",
                  flex: "none",
                  display: "flex",
                  animation: row.error ? "none" : `${upBounce} 1s ease-in-out infinite`,
                }}
              >
                <IconRenderer name={row.error ? "close" : "upload"} size={19} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={nameSx}>{row.name}</Typography>
                <Typography
                  sx={{ fontSize: 11, color: row.error ? "error.main" : "text.secondary" }}
                >
                  {row.error
                    ? t("form.attachments.failed", "Upload failed")
                    : `${t("form.attachments.uploading", "Uploading…")} ${row.progress}%`}
                </Typography>
              </Box>
              {row.error ? (
                <Box
                  onClick={() => setPending((rows) => rows.filter((item) => item.id !== row.id))}
                  sx={{ display: "flex", cursor: "pointer", color: "text.disabled", flex: "none" }}
                >
                  <IconRenderer name="close" size={16} />
                </Box>
              ) : (
                <Typography
                  sx={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: "surface.accentBright",
                    flex: "none",
                  }}
                >
                  {row.progress}%
                </Typography>
              )}
            </Box>
            {row.error ? null : (
              <Box
                sx={{
                  height: 5,
                  borderRadius: "999px",
                  bgcolor: "surface.track",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: `${row.progress}%`,
                    borderRadius: "999px",
                    background:
                      "linear-gradient(90deg,var(--mui-palette-primary-light),var(--mui-palette-primary-dark))",
                    transition: "width .12s linear",
                  }}
                />
              </Box>
            )}
          </Box>
        ))}

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={prop.accept ?? DEFAULT_ACCEPT}
          hidden
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </Box>
    </FieldShell>
  );
}
