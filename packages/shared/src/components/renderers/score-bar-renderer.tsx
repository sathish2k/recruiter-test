import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import delve from "dlv";

export interface ScoreBarRendererConfig {
  type: "score-bar";
  path: string;
  suffix?: string;
  /** Strong-score cutoff for the color band (default 80). */
  threshold?: number;
}

function bandColor(score: number, threshold: number): string {
  if (score >= threshold) return "#8FD6AC";
  if (score >= 60) return "#F0C27C";
  return "#9A968E";
}

export function ScoreBarRenderer({
  config,
  data = {},
}: {
  config: ScoreBarRendererConfig;
  data?: Record<string, unknown>;
}) {
  const score = Number(delve(data, config.path) ?? 0);
  const clamped = Math.min(100, Math.max(0, score));
  const threshold = config.threshold ?? 80;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 700,
          width: 34,
          color: bandColor(score, threshold),
        }}
      >
        {score}
        {config.suffix ?? "%"}
      </Typography>
      <Box
        sx={{
          flex: 1,
          height: 6,
          borderRadius: "999px",
          background: "rgba(255,255,255,.08)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${clamped}%`,
            height: "100%",
            borderRadius: "999px",
            background: "linear-gradient(90deg,#FF8A3C,#C24509)",
          }}
        />
      </Box>
    </Box>
  );
}
