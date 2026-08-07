"use client";

import Box from "@mui/material/Box";
import type { MouseEvent } from "react";
import { useToast } from "../toast/toast";
import { IconRenderer } from "./icon-renderer";

/** The copy-to-clipboard affordance used by the `copyable` text renderer.
 * Isolated as a client component so `TextRenderer` itself stays server-safe. */
export function CopyButton({ value, copiedLabel }: { value: string; copiedLabel?: string }) {
  const { show } = useToast();
  const copy = async (e: MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(value);
    show(copiedLabel ?? "Copied", value);
  };
  return (
    <Box
      component="span"
      onClick={copy}
      sx={{
        display: "inline-flex",
        cursor: "pointer",
        color: "text.disabled",
        flex: "none",
        "&:hover": { color: "warning.light" },
      }}
    >
      <IconRenderer name="content-copy" size={14} />
    </Box>
  );
}
