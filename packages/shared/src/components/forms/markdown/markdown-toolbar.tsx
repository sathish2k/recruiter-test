"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { IconRenderer } from "../../renderers";
import type { Translate } from "../types";

type Tool =
  | { divider: true }
  | {
      /** Translation key for the tooltip. */
      title: string;
      /** English shown when the key has no translation. */
      fallback: string;
      icon?: string;
      /** Rendered instead of an icon (H1/H2/H3). */
      text?: string;
      wrap?: [string, string, string];
      prefix?: string;
    };

const TOOLS: Tool[] = [
  { title: "markdown.tools.h1", fallback: "Heading 1", text: "H1", prefix: "# " },
  { title: "markdown.tools.h2", fallback: "Heading 2", text: "H2", prefix: "## " },
  { title: "markdown.tools.h3", fallback: "Heading 3", text: "H3", prefix: "### " },
  { divider: true },
  { title: "markdown.tools.bold", fallback: "Bold", icon: "bold", wrap: ["**", "**", "bold text"] },
  {
    title: "markdown.tools.italic",
    fallback: "Italic",
    icon: "italic",
    wrap: ["*", "*", "italic text"],
  },
  {
    title: "markdown.tools.strikethrough",
    fallback: "Strikethrough",
    icon: "strikethrough",
    wrap: ["~~", "~~", "struck text"],
  },
  { divider: true },
  {
    title: "markdown.tools.bulletList",
    fallback: "Bulleted list",
    icon: "list-bulleted",
    prefix: "- ",
  },
  {
    title: "markdown.tools.numberList",
    fallback: "Numbered list",
    icon: "list-numbered",
    prefix: "1. ",
  },
  { title: "markdown.tools.taskList", fallback: "Task list", icon: "checklist", prefix: "- [ ] " },
  { divider: true },
  { title: "markdown.tools.quote", fallback: "Quote", icon: "quote", prefix: "> " },
  { title: "markdown.tools.code", fallback: "Inline code", icon: "code", wrap: ["`", "`", "code"] },
  {
    title: "markdown.tools.codeBlock",
    fallback: "Code block",
    icon: "code-block",
    wrap: ["\n```\n", "\n```\n", "code block"],
  },
  {
    title: "markdown.tools.link",
    fallback: "Link",
    icon: "link",
    wrap: ["[", "](https://)", "link text"],
  },
  {
    title: "markdown.tools.divider",
    fallback: "Divider",
    icon: "horizontal-rule",
    prefix: "\n---\n",
  },
];

export interface MarkdownToolbarProps {
  /** Wraps the selection (or `fallback` when nothing is selected). */
  onWrap: (before: string, after: string, fallback: string) => void;
  /** Prepends to the current line. */
  onPrefix: (prefix: string) => void;
  t: Translate;
}

/** The formatting strip above the editor. Purely presentational — it reports
 * intent and the editor owns the text. */
export function MarkdownToolbar({ onWrap, onPrefix, t }: MarkdownToolbarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "2px",
        p: "7px 10px",
        borderBottom: "1px solid",
        borderBottomColor: "surface.border",
        flexWrap: "wrap",
      }}
    >
      {TOOLS.map((tool, index) =>
        "divider" in tool ? (
          <Box
            // biome-ignore lint/suspicious/noArrayIndexKey: static toolbar.
            key={index}
            sx={{ width: "1px", height: 18, bgcolor: "surface.hover", mx: "5px" }}
          />
        ) : (
          <IconButton
            key={tool.title}
            title={t(tool.title, tool.fallback)}
            aria-label={t(tool.title, tool.fallback)}
            onClick={() =>
              tool.wrap ? onWrap(...tool.wrap) : tool.prefix && onPrefix(tool.prefix)
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
            {tool.icon ? <IconRenderer name={tool.icon} size={15} /> : tool.text}
          </IconButton>
        ),
      )}
    </Box>
  );
}
