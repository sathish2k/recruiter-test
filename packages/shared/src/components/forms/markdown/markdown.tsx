"use client";

import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { useRef, useState } from "react";
import { FieldShell } from "../field/field-shell";
import type { Translate, WidgetProps } from "../types";
import { esc, markdownToHtml, tokens } from "./markdown-to-html";
import { MarkdownToolbar } from "./markdown-toolbar";

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  rows = 9,
  t,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  t: Translate;
}) {
  const [mode, setMode] = useState<"write" | "preview">("write");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const insertWrap = (before: string, after: string, fallback: string) => {
    const ta = inputRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = value.slice(start, end) || fallback;
    onChange(value.slice(0, start) + before + sel + after + value.slice(end));
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + before.length + sel.length;
      ta.setSelectionRange(pos, pos);
    });
  };

  const insertPrefix = (prefix: string) => {
    const ta = inputRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    onChange(value.slice(0, lineStart) + prefix + value.slice(lineStart));
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <Tabs
        value={mode}
        onChange={(_, next) => setMode(next)}
        sx={{ bgcolor: "surface.inset", p: "3px" }}
      >
        <Tab value="write" label={t("markdown.write", "Write")} sx={{ py: "5px", fontSize: 12 }} />
        <Tab
          value="preview"
          label={t("markdown.preview", "Preview")}
          sx={{ py: "5px", fontSize: 12 }}
        />
      </Tabs>
      {mode === "write" ? (
        <Box
          sx={{
            border: "1px solid",
            borderColor: "surface.border",
            borderRadius: "12px",
            overflow: "hidden",
            bgcolor: "surface.inset",
          }}
        >
          <MarkdownToolbar onWrap={insertWrap} onPrefix={insertPrefix} t={t} />
          <InputBase
            multiline
            fullWidth
            minRows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            inputRef={inputRef}
            sx={{
              p: "14px 16px",
              fontSize: 13.5,
              lineHeight: 1.6,
              color: "text.primary",
            }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            border: "1px solid",
            borderColor: "surface.border",
            borderRadius: "12px",
            bgcolor: "surface.inset",
            p: "16px 18px",
            minHeight: 180,
            fontSize: 13.5,
            lineHeight: 1.6,
            color: "surface.textMuted",
          }}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: input is escaped before rendering.
          dangerouslySetInnerHTML={{
            __html:
              markdownToHtml(value) ||
              `<p style="color:${tokens.muted}">${esc(t("markdown.empty", "Nothing to preview yet — write some markdown first."))}</p>`,
          }}
        />
      )}
    </Box>
  );
}

/** The `markdown` widget. */
export function MarkdownWidget({ prop, field, fieldState, t }: WidgetProps) {
  return (
    <FieldShell
      label={t(prop.title ?? "")}
      hideLabel={prop.hideLabel}
      help={prop.help ? t(prop.help) : undefined}
      error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
    >
      <MarkdownEditor
        value={String(field.value ?? "")}
        onChange={field.onChange}
        placeholder={prop.placeholder ? t(prop.placeholder) : undefined}
        rows={prop.rows}
        t={t}
      />
    </FieldShell>
  );
}
