import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import delve from "dlv";

export interface EntityRendererConfig {
  type: "entity";
  /** "square" (logo tile) or "circle" (avatar). */
  shape?: "square" | "circle";
  size?: number;
  /** Background — a literal color or a data path. */
  bg?: string;
  bgPath?: string;
  fg?: string;
  fgPath?: string;
  /** The tile/avatar text (initial or initials) — literal or data path. */
  text?: string;
  textPath?: string;
  /** Data path for the primary title. */
  title: string;
  /** Data path for the secondary subtitle. */
  subtitle?: string;
}

const read = (data: Record<string, unknown>, path?: string, literal?: string) =>
  path ? String(delve(data, path) ?? "") : (literal ?? "");

export function EntityRenderer({
  config,
  data = {},
}: {
  config: EntityRendererConfig;
  data?: Record<string, unknown>;
}) {
  const circle = config.shape === "circle";
  const size = config.size ?? 34;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "11px" }}>
      <Avatar
        variant={circle ? "circular" : "rounded"}
        sx={{
          width: size,
          height: size,
          bgcolor: read(data, config.bgPath, config.bg) || "#3A4A5B",
          color: read(data, config.fgPath, config.fg) || "#CFE3F5",
          fontSize: circle ? 12 : 13,
          fontWeight: circle ? 600 : 700,
        }}
      >
        {read(data, config.textPath, config.text)}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ fontWeight: 600 }}>{read(data, config.title)}</Box>
        {config.subtitle ? (
          <Box sx={{ fontSize: 11.5, color: "text.disabled" }}>{read(data, config.subtitle)}</Box>
        ) : null}
      </Box>
    </Box>
  );
}
