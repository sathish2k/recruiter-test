"use client";

import Box from "@mui/material/Box";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import delve from "dlv";
import { seedRows } from "../../utils/seed-data";
import { TONE_BG, TONE_FG } from "./tones";

/** Chip tones. The dot and the label share one colour — the chip says its
 * state once. */
export type ChipTone = "success" | "warning" | "error" | "info" | "primary" | "violet";

export interface StatusChipsRendererConfig {
  /** Data paths on each row. Both default to the obvious field name. */
  paths?: { label?: string; tone?: string };
}

/**
 * The one-line health readout under the KPI row — "Revenue on plan",
 * "3 SLAs breached". Each chip is a whole sentence about one thing, so the
 * strip reads as the desk's status at a glance without opening anything.
 *
 * Which chips appear is the API's call: it returns only the statements that
 * are true right now, scoped to the caller.
 */
export function StatusChipsRenderer({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<StatusChipsRendererConfig>(id);
  const { data } = useFetch<Record<string, unknown>[]>(id, {
    data: seedRows<Record<string, unknown>>(undefined),
  });
  const rows = Array.isArray(data) ? data : [];
  if (!rows.length) return null;

  const labelPath = config?.paths?.label ?? "label";
  const tonePath = config?.paths?.tone ?? "tone";

  return (
    <Box
      data-testid={`status-chips-${id}`}
      sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", py: "2px" }}
    >
      {rows.map((row) => {
        const tone = (delve(row, tonePath) ?? "primary") as ChipTone;
        const label = String(delve(row, labelPath) ?? "");
        return (
          <Box
            key={label}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              height: 28,
              px: "12px",
              borderRadius: "999px",
              bgcolor: TONE_BG[tone],
              color: TONE_FG[tone],
              fontSize: 11.5,
              fontWeight: 700,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                flex: "none",
                borderRadius: "999px",
                bgcolor: "currentColor",
              }}
            />
            {t(label, row)}
          </Box>
        );
      })}
    </Box>
  );
}
