"use client";

import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import type { ReactNode } from "react";
import type { FieldGrid, FormLayoutProps } from "./types";

/**
 * A `size` of 0 at a breakpoint gives MUI a negative (clamped-to-0) width, but
 * the item stays in the flex flow and still eats a gap. Turn those breakpoints
 * into `display: none` so a spacer (`size: { xs: 0, md: 6 }`) truly leaves the
 * layout on small screens instead of leaving a blank line.
 */
function hiddenSx(grid?: FieldGrid) {
  const size = grid?.size;
  if (typeof size !== "object") return undefined;
  const display: Record<string, "none" | "block"> = {};
  let anyHidden = false;
  for (const [breakpoint, value] of Object.entries(size)) {
    display[breakpoint] = value === 0 ? "none" : "block";
    if (value === 0) anyHidden = true;
  }
  return anyHidden ? { display } : undefined;
}

/**
 * Lays fields out the way the engine lays out a page: `stackContainer` for a
 * vertical rhythm, `gridContainer` for columns with per-field `grid.size`.
 * Neither set means a plain stack, which is what most forms want.
 */
export function FormContainer({
  stackContainer,
  gridContainer,
  grids,
  children,
}: {
  stackContainer?: FormLayoutProps["stackContainer"];
  gridContainer?: FormLayoutProps["gridContainer"];
  grids: (FieldGrid | undefined)[];
  children: ReactNode[];
}) {
  if (gridContainer) {
    return (
      <Grid
        container
        spacing={gridContainer.spacing ?? 2}
        direction={gridContainer.direction}
        columns={gridContainer.columns}
      >
        {children.map((child, index) => (
          <Grid
            // biome-ignore lint/suspicious/noArrayIndexKey: positional, mirrors `grids`.
            key={index}
            // Default to a full row, in whatever column count the container uses.
            size={grids[index]?.size ?? gridContainer.columns ?? 12}
            offset={grids[index]?.offset}
            sx={hiddenSx(grids[index])}
          >
            {child}
          </Grid>
        ))}
      </Grid>
    );
  }
  return (
    <Stack spacing={stackContainer?.spacing ?? 1.5} direction={stackContainer?.direction}>
      {children}
    </Stack>
  );
}
