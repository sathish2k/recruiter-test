"use client";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import delve from "dlv";
import type { Translate } from "../forms/types";

/** One label/value row of a detail card. */
export interface DetailFieldConfig {
  key: string;
  /** Translation key for the label. */
  label: string;
  /** Data path for the value. */
  path: string;
  /** Renders the value as a link of this kind rather than plain text. */
  as?: "text" | "email" | "phone" | "url";
  /** Translation namespace for an enum value — `<translate>.<value>`. */
  translate?: string;
}

/**
 * The design's key/value rows: dim label left, value right, links where the
 * value is reachable. Used by every rail card that reads as a fact sheet —
 * the client's fee agreement and the contact's relationship details.
 */
export function FactRows({
  fields,
  data,
  t,
  size = "panel",
}: {
  fields: DetailFieldConfig[];
  data: Record<string, unknown>;
  t: Translate;
  /** `"panel"` is the standalone card; `"inset"` is the smaller nested block
   * behind a "more details" toggle. */
  size?: "panel" | "inset";
}) {
  const labelSize = size === "inset" ? 11.5 : 12;
  const valueSize = size === "inset" ? 11.5 : 12.5;
  return (
    <>
      {fields.map((field) => {
        const raw = delve(data, field.path);
        const text = raw === undefined || raw === null || raw === "" ? "" : String(raw);
        const label = field.translate && text ? t(`${field.translate}.${text}`, text) : text;
        const href =
          !text || !field.as || field.as === "text"
            ? undefined
            : field.as === "email"
              ? `mailto:${text}`
              : field.as === "phone"
                ? `tel:${text.replace(/\s+/g, "")}`
                : text.startsWith("http")
                  ? text
                  : `https://${text}`;

        return (
          <Box
            key={field.key}
            sx={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: "14px",
              py: size === "inset" ? "3px" : "7px",
            }}
          >
            <Typography sx={{ fontSize: labelSize, color: "text.disabled", flex: "none" }}>
              {t(field.label)}
            </Typography>
            {href ? (
              <Link
                href={href}
                sx={{
                  fontSize: valueSize,
                  textAlign: "right",
                  minWidth: 0,
                  wordBreak: "break-word",
                }}
              >
                {label}
              </Link>
            ) : (
              <Typography
                sx={{
                  fontSize: valueSize,
                  fontWeight: 600,
                  color: text ? "text.primary" : "text.disabled",
                  textAlign: "right",
                  minWidth: 0,
                  wordBreak: "break-word",
                }}
              >
                {label || "—"}
              </Typography>
            )}
          </Box>
        );
      })}
    </>
  );
}

/** Placeholder rows that keep a fact card's height while it loads. */
export function FactRowsSkeleton({ fields }: { fields: DetailFieldConfig[] }) {
  return (
    <>
      {fields.map((field) => (
        <Box
          key={field.key}
          sx={{ display: "flex", justifyContent: "space-between", gap: "14px", py: "7px" }}
        >
          <Skeleton variant="text" width={110} height={16} />
          <Skeleton variant="text" width={78} height={16} />
        </Box>
      ))}
    </>
  );
}
