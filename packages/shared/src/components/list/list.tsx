"use client";

import Box from "@mui/material/Box";
import Card, { type CardProps } from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

export interface ListSectionItem {
  key: string;
  /** Leading icon or tile (session/calendar/token lists). */
  icon?: ReactNode;
  title: ReactNode;
  /** Secondary line under the title (description / meta / status). */
  description?: ReactNode;
  /** Inline nodes beside the title (badges/chips). */
  chips?: ReactNode;
  /** Right-hand control — a switch, button, segmented picker, etc. */
  action?: ReactNode;
  /** Full-width control rendered beneath the row (e.g. a segmented picker). */
  control?: ReactNode;
}

/** Shape of the skeleton rows — match it to the real row layout. */
export interface ListSkeletonShape {
  /** Leading icon/tile placeholder. */
  icon?: boolean;
  /** Second (description) text line. Default true. */
  description?: boolean;
  /** Right-hand control placeholder. Default "toggle". */
  action?: "toggle" | "button" | "none";
  /** Full-width control placeholder beneath the row. */
  control?: boolean;
}

export interface ListSectionProps {
  /** Header title (omit for a header-less list). */
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Leading icon in the header. */
  icon?: ReactNode;
  badge?: ReactNode;
  /** Right-hand slot in the header. */
  headerAction?: ReactNode;
  items?: ListSectionItem[];
  /** Muted note under the list. */
  footer?: ReactNode;
  /** Top divider between rows (and above the footer). Default true. */
  divided?: boolean;
  /** Renders skeleton rows (header/footer still render) instead of `items`. */
  isLoading?: boolean;
  /** Skeleton row count while `isLoading` (default 3). */
  skeletonRows?: number;
  /** Skeleton row layout — match it to the real rows. */
  skeletonShape?: ListSkeletonShape;
  sx?: CardProps["sx"];
}

function SkeletonRow({ shape, divided }: { shape: ListSkeletonShape; divided: boolean }) {
  const action = shape.action ?? "toggle";
  return (
    <Box sx={{ py: "13px", borderTop: divided ? "1px solid" : "none", borderColor: "divider" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "13px" }}>
        {shape.icon ? <Skeleton variant="rounded" width={34} height={34} /> : null}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="text" width="35%" height={16} />
          {shape.description !== false ? <Skeleton variant="text" width="55%" height={12} /> : null}
        </Box>
        {action === "toggle" ? (
          <Skeleton variant="rounded" width={44} height={24} sx={{ borderRadius: "999px" }} />
        ) : action === "button" ? (
          <Skeleton variant="rounded" width={92} height={32} sx={{ borderRadius: "999px" }} />
        ) : null}
      </Box>
      {shape.control ? (
        <Skeleton
          variant="rounded"
          width={240}
          height={38}
          sx={{ mt: "10px", borderRadius: "11px" }}
        />
      ) : null}
    </Box>
  );
}

/**
 * The one list primitive behind every settings/account section: a `SectionCard`
 * with an optional header and a configurable list of rows. Each row can carry a
 * leading icon, a description line, inline chips, a right-hand `action` and a
 * full-width `control` beneath it — so notification toggles, format pickers,
 * connected-calendar rows and session lists are all the same component, just
 * different `items`. Pass `isLoading` (+ `skeletonRows`/`skeletonShape`) to show
 * a skeleton whose row shape matches the real one.
 */
export function ListSection({
  title,
  subtitle,
  icon,
  badge,
  headerAction,
  items = [],
  footer,
  divided = true,
  isLoading = false,
  skeletonRows = 3,
  skeletonShape,
  sx,
}: ListSectionProps) {
  const hasHeader = title != null || subtitle != null || icon != null || headerAction != null;
  const shape = skeletonShape ?? {};
  return (
    <Card variant="base" sx={{ p: "20px 22px", borderRadius: "16px", ...sx }}>
      {hasHeader ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            mb: subtitle ? "14px" : "8px",
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {icon ? <Box sx={{ display: "flex" }}>{icon}</Box> : null}
              {title != null ? (
                <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>{title}</Typography>
              ) : null}
              {badge}
            </Box>
            {subtitle != null ? (
              <Typography sx={{ fontSize: 12, color: "text.disabled", mt: "2px" }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {headerAction}
        </Box>
      ) : null}

      {isLoading
        ? Array.from({ length: skeletonRows }, (_, index) => index).map((row) => (
            <SkeletonRow key={row} shape={shape} divided={divided} />
          ))
        : items.map((item) => (
            <Box
              key={item.key}
              sx={{
                py: "13px",
                borderTop: divided ? "1px solid" : "none",
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "13px" }}>
                {item.icon ? (
                  <Box sx={{ display: "flex", color: "text.disabled" }}>{item.icon}</Box>
                ) : null}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{item.title}</Typography>
                    {item.chips}
                  </Box>
                  {item.description != null ? (
                    <Box sx={{ fontSize: 11.5, color: "text.secondary", mt: "2px" }}>
                      {item.description}
                    </Box>
                  ) : null}
                </Box>
                {item.action}
              </Box>
              {item.control != null ? <Box sx={{ mt: "10px" }}>{item.control}</Box> : null}
            </Box>
          ))}

      {footer != null ? (
        <Box
          sx={{
            borderTop: divided ? "1px solid" : "none",
            borderColor: "divider",
            pt: "12px",
            mt: "1px",
            fontSize: 11,
            color: "text.disabled",
          }}
        >
          {footer}
        </Box>
      ) : null}
    </Card>
  );
}
