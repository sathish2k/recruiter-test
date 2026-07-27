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
  /** Right-hand pill after the title block (the design's interview time). */
  trailing?: ReactNode;
  /** Wraps the row — pass a LinkRenderer to make the whole row clickable. */
  wrap?: (row: ReactNode) => ReactNode;
}

/**
 * Row shape. `divided` is the settings-screen default (a hairline between
 * rows); `inset` renders each row as its own inset card; `timeline` draws a dot
 * and a connector down the left edge.
 */
export type ListVariant = "divided" | "inset" | "timeline";

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
  variant?: ListVariant;
  /** Tightens rows to the dashboard's compact rhythm (design: 10px rows). */
  dense?: boolean;
  /** Space under the header. The design varies it per list (8 / 12 / 14px). */
  headerGap?: string;
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

function ListRow({
  item,
  variant,
  dense,
  divided,
  isLast,
}: {
  item: ListSectionItem;
  variant: ListVariant;
  dense: boolean;
  divided: boolean;
  isLast: boolean;
}) {
  // Timeline: dot + connector down the left, text stacked beside it.
  if (variant === "timeline") {
    const row = (
      <Box sx={{ display: "flex", gap: "11px", py: "8px" }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
          <Box sx={{ mt: "4px", display: "flex" }}>{item.icon}</Box>
          {isLast ? null : <Box sx={{ flex: 1, width: "1px", bgcolor: "surface.divider" }} />}
        </Box>
        <Box sx={{ minWidth: 0, pb: "2px" }}>
          <Box sx={{ fontSize: 12.5, color: "surface.textMuted", lineHeight: 1.45 }}>
            {item.title}
          </Box>
          {item.description != null ? (
            <Box sx={{ fontSize: 11, color: "text.disabled", mt: "2px" }}>{item.description}</Box>
          ) : null}
        </Box>
      </Box>
    );
    return item.wrap ? <>{item.wrap(row)}</> : row;
  }

  // Inset: each row is its own card, stacked with a gap by the parent.
  if (variant === "inset") {
    const row = (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          bgcolor: "surface.inset",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "12px",
          p: "12px 14px",
        }}
      >
        {item.icon}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ fontSize: 13.5, fontWeight: 600 }}>{item.title}</Box>
          {item.description != null ? (
            <Box sx={{ fontSize: 12, color: "text.secondary", mt: "1px" }}>{item.description}</Box>
          ) : null}
        </Box>
        {item.trailing}
        {item.action}
      </Box>
    );
    return item.wrap ? <>{item.wrap(row)}</> : row;
  }

  const row = (
    <Box
      sx={
        dense
          ? {
              display: "flex",
              alignItems: "center",
              gap: "11px",
              p: "10px",
              mx: "-10px",
              borderRadius: "10px",
              "&:hover": { bgcolor: "surface.hoverSubtle" },
            }
          : { display: "flex", alignItems: "center", gap: "13px" }
      }
    >
      {item.icon ? (
        <Box sx={{ display: "flex", color: dense ? "inherit" : "text.disabled", flex: "none" }}>
          {item.icon}
        </Box>
      ) : null}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={
            dense
              ? { fontSize: 12.5, lineHeight: 1.45 }
              : { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }
          }
        >
          {dense ? (
            item.title
          ) : (
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{item.title}</Typography>
          )}
          {dense ? null : item.chips}
        </Box>
        {item.description != null ? (
          <Box sx={{ fontSize: 11.5, color: "text.secondary", mt: "2px" }}>{item.description}</Box>
        ) : null}
      </Box>
      {dense ? item.chips : null}
      {item.trailing}
      {item.action}
    </Box>
  );

  const wrapped = item.wrap ? item.wrap(row) : row;
  return (
    <Box
      sx={{
        py: dense ? 0 : "13px",
        borderTop: divided ? "1px solid" : "none",
        borderColor: "divider",
      }}
    >
      {wrapped}
      {item.control != null ? <Box sx={{ mt: "10px" }}>{item.control}</Box> : null}
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
  variant = "divided",
  dense = false,
  headerGap,
  isLoading = false,
  skeletonRows = 3,
  skeletonShape,
  sx,
}: ListSectionProps) {
  const hasHeader = title != null || subtitle != null || icon != null || headerAction != null;
  const shape = skeletonShape ?? {};
  return (
    <Card
      variant="base"
      sx={{
        p: variant === "divided" && !dense ? "20px 22px" : "18px 20px",
        borderRadius: "16px",
        ...sx,
      }}
    >
      {hasHeader ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            mb: headerGap ?? (subtitle ? "14px" : "8px"),
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {icon ? <Box sx={{ display: "flex" }}>{icon}</Box> : null}
              {title != null ? (
                <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>{title}</Typography>
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

      <Box
        sx={
          variant === "inset"
            ? { display: "flex", flexDirection: "column", gap: "10px" }
            : { display: "flex", flexDirection: "column" }
        }
      >
        {isLoading
          ? Array.from({ length: skeletonRows }, (_, index) => index).map((row) => (
              <SkeletonRow key={row} shape={shape} divided={divided} />
            ))
          : items.map((item, index) => (
              <ListRow
                key={item.key}
                item={item}
                variant={variant}
                dense={dense}
                divided={divided}
                isLast={index === items.length - 1}
              />
            ))}
      </Box>

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
