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
  if (score >= threshold) return "var(--mui-palette-success-light)";
  if (score >= 60) return "var(--mui-palette-warning-light)";
  return "var(--mui-palette-text-secondary)";
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
          background: "var(--mui-palette-divider)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${clamped}%`,
            height: "100%",
            borderRadius: "999px",
            background: (theme) => theme.gradients.bar,
          }}
        />
      </Box>
    </Box>
  );
}
