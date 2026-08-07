import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import delve from "dlv";
import { GenericRenderer, type GenericRendererConfig } from "./generic-renderer";

export interface StackItem {
  /** Any value config — cells, cards and stacks share one vocabulary. */
  value: GenericRendererConfig;
  /** Drop the item (and its separator) when this data path is empty. */
  showPath?: string;
  sx?: SxProps<Theme>;
}

export interface StackRendererConfig {
  type: "stack";
  direction?: "column" | "row";
  /** Drawn between row items — the design's " · " meta lines. */
  separator?: string;
  gap?: number | string;
  align?: "flex-start" | "center" | "baseline";
  items: StackItem[];
  sx?: SxProps<Theme>;
}

/**
 * Keys are taken from the item's position in the *config*, not in the rendered
 * list — the config never reorders, so a key stays with its item even when a
 * `showPath` drops one of its neighbours.
 */
const keyed = (items: StackItem[]) =>
  items.map((item, position) => ({ item, key: `${item.value.type}:${position}` }));

const filled = (data: Record<string, unknown>, path?: string) => {
  if (!path) return true;
  const value = delve(data, path);
  return value !== undefined && value !== null && value !== "" && value !== 0;
};

/**
 * A cell that stacks several values — the design's two-line table cells (role
 * over its meta line, bar over its caption) and its inline meta rows. The
 * stack owns only the layout; every value still goes through GenericRenderer,
 * so nothing here needs to know what a status chip or a bar looks like.
 */
export function StackRenderer({
  config,
  data = {},
}: {
  config: StackRendererConfig;
  data?: Record<string, unknown>;
}) {
  const row = config.direction === "row";
  const items = keyed(config.items).filter(({ item }) => filled(data, item.showPath));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: row ? "row" : "column",
        alignItems: config.align ?? (row ? "center" : "stretch"),
        gap: config.gap ?? (row ? "6px" : "3px"),
        minWidth: 0,
        ...config.sx,
      }}
    >
      {items.map(({ item, key }, index) => (
        <Box key={key} sx={{ display: "flex", alignItems: "center", minWidth: 0, ...item.sx }}>
          {config.separator && index > 0 ? (
            <Typography
              component="span"
              sx={{ color: "text.disabled", fontSize: "inherit", mr: config.gap ?? "6px" }}
            >
              {config.separator}
            </Typography>
          ) : null}
          <GenericRenderer config={item.value} data={data} />
        </Box>
      ))}
    </Box>
  );
}
