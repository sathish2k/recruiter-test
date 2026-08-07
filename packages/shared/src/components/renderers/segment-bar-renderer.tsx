import Box from "@mui/material/Box";
import delve from "dlv";

export interface BarSegment {
  /** Data path holding this segment's count. */
  path: string;
  /** Fill — a palette token or CSS colour. */
  color: string;
}

export interface SegmentBarRendererConfig {
  type: "segment-bar";
  segments: BarSegment[];
  /** Denominator. Defaults to the sum of the segments, which is what a
   * composition bar (the pipeline split) wants; set it for a progress bar
   * (filled of openings), where the remainder must stay empty track. */
  totalPath?: string;
  /** Swaps the single-segment fill once the total is reached. */
  completeColor?: string;
  height?: number;
  /** Hairline gap between segments, as the design draws the pipeline bar. */
  gap?: number;
}

const num = (data: Record<string, unknown>, path?: string) => {
  if (!path) return 0;
  const value = Number(delve(data, path) ?? 0);
  return Number.isFinite(value) ? Math.max(0, value) : 0;
};

/**
 * The design's two list bars: a multi-segment composition bar (sourced /
 * screened / interviewing) and a single-segment progress bar (filled of
 * openings). One renderer, because they differ only in their denominator.
 */
export function SegmentBarRenderer({
  config,
  data = {},
}: {
  config: SegmentBarRendererConfig;
  data?: Record<string, unknown>;
}) {
  const values = config.segments.map((segment) => num(data, segment.path));
  const sum = values.reduce((total, value) => total + value, 0);
  const total = config.totalPath ? num(data, config.totalPath) : sum;
  const complete = config.completeColor && total > 0 && sum >= total;

  return (
    <Box
      sx={{
        display: "flex",
        gap: `${config.gap ?? 2}px`,
        height: config.height ?? 6,
        borderRadius: "99px",
        overflow: "hidden",
        bgcolor: "surface.track",
      }}
    >
      {config.segments.map((segment, index) => {
        const width = total > 0 ? ((values[index] ?? 0) / total) * 100 : 0;
        if (width <= 0) return null;
        return (
          <Box
            key={segment.path}
            sx={{
              width: `${Math.min(100, width)}%`,
              borderRadius: config.segments.length === 1 ? "99px" : 0,
              background: complete ? config.completeColor : segment.color,
            }}
          />
        );
      })}
    </Box>
  );
}
