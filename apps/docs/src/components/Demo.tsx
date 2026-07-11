"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { type ReactNode, useState } from "react";
import { MONO } from "../lib/theme";

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return { copied, copy };
}

const HL: Record<string, string> = {
  comment: "#7a7699",
  string: "#9ece6a",
  keyword: "#bb9af7",
  literal: "#ff9e64",
  number: "#ff9e64",
  key: "#7dcfff",
};
const KEYWORDS =
  "const|let|var|type|interface|enum|import|export|from|default|return|async|await|function|new|extends|implements|as|typeof|keyof|void|in|of|if|else|for";
const TOKEN = new RegExp(
  [
    "(//[^\\n]*|/\\*[\\s\\S]*?\\*/)",
    "(`(?:[^`\\\\]|\\\\.)*`|\"(?:[^\"\\\\]|\\\\.)*\"|'(?:[^'\\\\]|\\\\.)*')",
    `\\b(${KEYWORDS})\\b`,
    "\\b(true|false|null|undefined)\\b",
    "\\b(\\d+(?:\\.\\d+)?)\\b",
    "([A-Za-z_$][\\w$]*)(?=\\s*:)",
  ].join("|"),
  "g",
);

function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  TOKEN.lastIndex = 0;
  let m = TOKEN.exec(code);
  while (m !== null) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const color = m[1]
      ? HL.comment
      : m[2]
        ? HL.string
        : m[3]
          ? HL.keyword
          : m[4]
            ? HL.literal
            : m[5]
              ? HL.number
              : HL.key;
    out.push(
      <span key={`t${key}`} style={{ color }}>
        {m[0]}
      </span>,
    );
    key += 1;
    last = m.index + m[0].length;
    m = TOKEN.exec(code);
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export function CodeBlock({ code }: { code: string }) {
  const { copied, copy } = useCopy();
  return (
    <Box sx={{ position: "relative", my: 2 }}>
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 2,
          pr: 6,
          bgcolor: "#17141f",
          color: "#e9e6f7",
          borderRadius: 2,
          overflowX: "auto",
          fontFamily: MONO,
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        <code>{highlight(code)}</code>
      </Box>
      <Tooltip title={copied ? "Copied" : "Copy"}>
        <IconButton
          size="small"
          onClick={() => copy(code)}
          sx={{ position: "absolute", top: 8, right: 8, color: "#b8b2d6" }}
        >
          {copied ? (
            <CheckRoundedIcon fontSize="small" />
          ) : (
            <ContentCopyRoundedIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export function Demo({
  children,
  code,
  fill = false,
}: {
  children: ReactNode;
  code: string;
  fill?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { copied, copy } = useCopy();
  return (
    <Box
      sx={{
        my: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Box
        sx={
          fill
            ? { bgcolor: "#faf9fe" }
            : {
                p: 3,
                display: "flex",
                justifyContent: "center",
                bgcolor: "#faf9fe",
              }
        }
      >
        {children}
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 0.5,
          px: 1,
          py: 0.5,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Tooltip title={copied ? "Copied" : "Copy source"}>
          <IconButton size="small" onClick={() => copy(code)}>
            {copied ? (
              <CheckRoundedIcon fontSize="small" />
            ) : (
              <ContentCopyRoundedIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
        <Tooltip title={open ? "Hide source" : "Show source"}>
          <IconButton
            size="small"
            onClick={() => setOpen((v) => !v)}
            sx={{ color: open ? "primary.main" : undefined }}
          >
            <CodeRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Collapse in={open}>
        <Box
          component="pre"
          sx={{
            m: 0,
            p: 2,
            bgcolor: "#17141f",
            color: "#e9e6f7",
            overflowX: "auto",
            fontFamily: MONO,
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          <code>{highlight(code)}</code>
        </Box>
      </Collapse>
    </Box>
  );
}

function Chrome({ url }: { url: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.5,
        py: 1,
        bgcolor: "#edeaf6",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ display: "flex", gap: 0.5 }}>
        {["a", "b", "c"].map((d) => (
          <Box
            key={d}
            sx={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              bgcolor: "#cdc8e0",
            }}
          />
        ))}
      </Box>
      <Box
        sx={{
          flex: 1,
          fontFamily: MONO,
          fontSize: 11.5,
          color: "text.secondary",
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          px: 1,
          py: 0.25,
        }}
      >
        {url || "/"}
      </Box>
    </Box>
  );
}

export function EngineSwitcher({
  items,
  code,
  frame = false,
  height = 340,
}: {
  items: { url: string; node: ReactNode }[];
  code: string;
  frame?: boolean;
  height?: number;
}) {
  const [current, setCurrent] = useState(items[0]?.url ?? "/");
  const active = items.find((i) => i.url === current) ?? items[0];
  const node = active?.node ?? null;

  const preview = (
    <Box sx={{ width: "100%" }}>
      {items.length > 1 ? (
        <Stack
          direction="row"
          spacing={1}
          sx={{ flexWrap: "wrap", gap: 1, p: 1.5, pb: frame ? 0 : 1.5 }}
        >
          {items.map((i) => (
            <Chip
              key={i.url}
              label={i.url}
              onClick={() => setCurrent(i.url)}
              color={current === i.url ? "primary" : "default"}
              variant={current === i.url ? "filled" : "outlined"}
              sx={{ fontFamily: MONO, fontSize: 12.5 }}
            />
          ))}
        </Stack>
      ) : null}
      {frame ? (
        <Box
          sx={{
            m: 1.5,
            mt: items.length > 1 ? 0 : 1.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1.5,
            overflow: "hidden",
          }}
        >
          <Chrome url={current} />
          <Box
            sx={{
              height,
              overflow: "hidden",
              bgcolor: "background.paper",
              "& > .MuiBox-root": {
                height: `${height}px !important`,
                minHeight: "0 !important",
              },
            }}
          >
            {node}
          </Box>
        </Box>
      ) : (
        <Box sx={{ p: items.length > 1 ? 1.5 : 2 }}>{node}</Box>
      )}
    </Box>
  );

  return (
    <Demo code={code} fill>
      {preview}
    </Demo>
  );
}
