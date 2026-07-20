"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { useRef, useState } from "react";
import { IconRenderer } from "../renderers";

type TFunc = (key: string, fallback?: string) => string;

type Tool =
  | { divider: true }
  | {
      title: string;
      icon?: string;
      text?: string;
      wrap?: [string, string, string];
      prefix?: string;
    };

const TOOLS: Tool[] = [
  { title: "Heading 1", text: "H1", prefix: "# " },
  { title: "Heading 2", text: "H2", prefix: "## " },
  { title: "Heading 3", text: "H3", prefix: "### " },
  { divider: true },
  { title: "Bold", icon: "bold", wrap: ["**", "**", "bold text"] },
  { title: "Italic", icon: "italic", wrap: ["*", "*", "italic text"] },
  {
    title: "Strikethrough",
    icon: "strikethrough",
    wrap: ["~~", "~~", "struck text"],
  },
  { divider: true },
  { title: "Bulleted list", icon: "list-bulleted", prefix: "- " },
  { title: "Numbered list", icon: "list-numbered", prefix: "1. " },
  { title: "Task list", icon: "checklist", prefix: "- [ ] " },
  { divider: true },
  { title: "Quote", icon: "quote", prefix: "> " },
  { title: "Inline code", icon: "code", wrap: ["`", "`", "code"] },
  {
    title: "Code block",
    icon: "code-block",
    wrap: ["\n```\n", "\n```\n", "code block"],
  },
  { title: "Link", icon: "link", wrap: ["[", "](https://)", "link text"] },
  { title: "Divider", icon: "horizontal-rule", prefix: "\n---\n" },
];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const inline = (s: string) =>
  s
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/~~([^~]+)~~/g, '<del style="color:#7C7972">$1</del>')
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(
      /`([^`]+)`/g,
      '<code style="background:rgba(255,255,255,.08);padding:1px 6px;border-radius:5px;font-size:12px">$1</code>',
    )
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#F0B27C">$1</a>');

export function markdownToHtml(md: string): string {
  const lines = esc(md).split("\n");
  let html = "";
  let list: "ul" | "ol" | null = null;
  let inCode = false;
  let codeBuf: string[] = [];
  const closeList = () => {
    if (list) {
      html += list === "ul" ? "</ul>" : "</ol>";
      list = null;
    }
  };
  for (const line of lines) {
    if (/^```/.test(line.trim())) {
      if (inCode) {
        html += `<pre style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:9px;padding:12px 14px;font-size:12px;line-height:1.55;overflow-x:auto;margin:10px 0">${codeBuf.join("\n")}</pre>`;
        inCode = false;
        codeBuf = [];
      } else {
        closeList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }
    if (/^---\s*$/.test(line)) {
      closeList();
      html += '<hr style="border:none;border-top:1px solid rgba(255,255,255,.12);margin:14px 0">';
    } else if (/^&gt; /.test(line)) {
      closeList();
      html += `<blockquote style="margin:8px 0;padding:6px 14px;border-left:3px solid #F26A1B;background:rgba(242,106,27,.07);border-radius:0 8px 8px 0;color:#C9C5BD">${inline(line.slice(5))}</blockquote>`;
    } else if (/^- \[( |x)\] /.test(line)) {
      if (list !== "ul") {
        closeList();
        html += '<ul style="margin:6px 0;padding-left:6px;list-style:none">';
        list = "ul";
      }
      const done = line[3] === "x";
      html += `<li style="margin:4px 0;display:flex;gap:8px;align-items:baseline"><span style="color:${done ? "#8FD6AC" : "#7C7972"}">${done ? "☑" : "☐"}</span><span${done ? ' style="color:#7C7972;text-decoration:line-through"' : ""}>${inline(line.slice(6))}</span></li>`;
    } else if (/^### /.test(line)) {
      closeList();
      html += `<h3 style="font-size:14px;font-weight:700;margin:14px 0 6px">${inline(line.slice(4))}</h3>`;
    } else if (/^## /.test(line)) {
      closeList();
      html += `<h2 style="font-size:15.5px;font-weight:700;margin:16px 0 7px">${inline(line.slice(3))}</h2>`;
    } else if (/^# /.test(line)) {
      closeList();
      html += `<h1 style="font-size:17px;font-weight:700;margin:16px 0 8px">${inline(line.slice(2))}</h1>`;
    } else if (/^- /.test(line)) {
      if (list !== "ul") {
        closeList();
        html += '<ul style="margin:6px 0;padding-left:22px">';
        list = "ul";
      }
      html += `<li style="margin:3px 0">${inline(line.slice(2))}</li>`;
    } else if (/^\d+\. /.test(line)) {
      if (list !== "ol") {
        closeList();
        html += '<ol style="margin:6px 0;padding-left:22px">';
        list = "ol";
      }
      html += `<li style="margin:3px 0">${inline(line.replace(/^\d+\. /, ""))}</li>`;
    } else if (line.trim() === "") {
      closeList();
    } else {
      closeList();
      html += `<p style="margin:7px 0">${inline(line)}</p>`;
    }
  }
  closeList();
  return html;
}

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
  t: TFunc;
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
        sx={{ bgcolor: "#141413", p: "3px" }}
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
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: "12px",
            overflow: "hidden",
            bgcolor: "#141413",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
              p: "7px 10px",
              borderBottom: "1px solid rgba(255,255,255,.07)",
              flexWrap: "wrap",
            }}
          >
            {TOOLS.map((tool, i) =>
              "divider" in tool ? (
                <Box
                  // biome-ignore lint/suspicious/noArrayIndexKey: static toolbar.
                  key={i}
                  sx={{
                    width: "1px",
                    height: 18,
                    bgcolor: "rgba(255,255,255,.1)",
                    mx: "5px",
                  }}
                />
              ) : (
                <IconButton
                  key={tool.title}
                  title={tool.title}
                  onClick={() =>
                    tool.wrap ? insertWrap(...tool.wrap) : tool.prefix && insertPrefix(tool.prefix)
                  }
                  sx={{
                    width: 29,
                    height: 29,
                    border: "none",
                    borderRadius: "7px",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {tool.icon ? <IconRenderer name={tool.icon} size={17} /> : tool.text}
                </IconButton>
              ),
            )}
            <Box sx={{ flex: 1 }} />
            <Box sx={{ fontSize: 11, color: "text.disabled" }}>
              {t("markdown.hint", "Markdown supported")}
            </Box>
          </Box>
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
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: "12px",
            bgcolor: "#141413",
            p: "16px 18px",
            minHeight: 180,
            fontSize: 13.5,
            lineHeight: 1.6,
            color: "#C9C5BD",
          }}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: input is escaped before rendering.
          dangerouslySetInnerHTML={{
            __html:
              markdownToHtml(value) ||
              `<p style="color:#7C7972">${esc(t("markdown.empty", "Nothing to preview yet — write some markdown first."))}</p>`,
          }}
        />
      )}
    </Box>
  );
}
