"use client";

// The 46px logo swatch below uses a fixed rotation of hues to tell clients
// apart at a glance — that's identity, not chrome, so it doesn't follow the
// colour scheme. Everything else reads from the theme's surface tokens.
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { type MouseEvent, useState } from "react";
import { IconRenderer } from "../renderers";
import { TONE_BG, TONE_FG, type Tone } from "../renderers/tones";

export interface ClientCardData {
  id: string;
  name: string;
  industry?: string;
  status?: string;
  health?: string;
  openRoles?: number;
  candidates?: number;
  placements?: number;
  accountLeadName?: string;
  /** Candidate-flow split behind the pipeline bar. */
  flow?: { sourced: number; screening: number; interviewing: number };
  /** Optional narrative flourishes — rendered only when present. */
  activity?: string;
  insightTitle?: string;
  insightBody?: string;
  eventText?: string;
  eventWhen?: string;
}

/** Every visible string, already translated by the owning module. */
export interface ClientCardLabels {
  requirements: string;
  candidates: string;
  placements: string;
  candidateFlow: string;
  inPipeline: string;
  lastActivity: string;
  flow: Record<"sourced" | "screening" | "interviewing", string>;
  status: Record<string, string>;
  health: Record<string, string>;
  open: string;
  addRole: string;
  contacts: string;
  more: string;
  edit: string;
  archive: string;
}

export interface ClientCardHandlers {
  onOpen?: (client: ClientCardData) => void;
  onAddRole?: (client: ClientCardData) => void;
  onContacts?: (client: ClientCardData) => void;
  onEdit?: (client: ClientCardData) => void;
  onArchive?: (client: ClientCardData) => void;
}

const LOGO_PALETTE = [
  { bg: "#3A4A5B", fg: "#CFE3F5" },
  { bg: "#4A3A5B", fg: "#E3CFF5" },
  { bg: "#3A5B4A", fg: "#CFF5E0" },
  { bg: "#5B3A3A", fg: "#F5CFCF" },
  { bg: "#5B4A3A", fg: "#FFD9BC" },
  { bg: "#4A5B3A", fg: "#E0F5CF" },
] as const;

/** Pipeline bar segments, in board order — the design's stage hues. */
const FLOW_SEGMENTS = [
  { key: "sourced" as const, color: "var(--mui-palette-surface-textFaint)" },
  { key: "screening" as const, color: "var(--mui-palette-surface-infoFg)" },
  { key: "interviewing" as const, color: "var(--mui-palette-surface-accentBright)" },
];

// Health → tone. The amber `accentBright` is `secondary` and never a semantic
// state, so "at risk" reads on the error ramp, not the pilot amber.
const HEALTH_TONE: Record<string, Tone> = {
  healthy: "success",
  attention: "warning",
  at_risk: "error",
  dormant: "muted",
};

function hue(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return LOGO_PALETTE[hash % LOGO_PALETTE.length] ?? LOGO_PALETTE[0];
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const ACTION_BTN = {
  width: 30,
  height: 30,
  borderRadius: "8px",
  border: "1px solid",
  borderColor: "surface.border",
  color: "surface.textSecondary",
  "&:hover": { bgcolor: "surface.hover", color: "text.primary" },
} as const;

function CardChip({ icon, label }: { icon: string; label: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        flex: "none",
        px: "10px",
        py: "4px",
        borderRadius: "6px",
        bgcolor: "surface.inset",
        fontSize: 11,
        fontWeight: 700,
        color: "surface.textMuted",
      }}
    >
      <IconRenderer name={icon} size={14} color="var(--mui-palette-surface-textSecondary)" />
      {label}
    </Box>
  );
}

export function ClientCardSkeleton() {
  return (
    <Card
      variant="interactive"
      sx={{
        p: "20px",
        borderRadius: "16px",
        minHeight: 300,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: "12px" }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="40%" height={14} sx={{ mt: "2px" }} />
        </Box>
        <Skeleton variant="rounded" width={78} height={24} sx={{ borderRadius: "6px" }} />
      </Box>
      <Skeleton variant="text" width="45%" height={16} sx={{ mt: "14px" }} />
      <Box sx={{ mt: "16px" }}>
        <Skeleton variant="text" width="100%" height={12} />
        <Skeleton variant="rounded" height={8} sx={{ mt: "8px", borderRadius: "99px" }} />
        <Skeleton variant="text" width="80%" height={12} sx={{ mt: "8px" }} />
      </Box>
      <Box sx={{ display: "flex", gap: "8px", mt: "16px" }}>
        <Skeleton variant="rounded" width={78} height={24} sx={{ borderRadius: "6px" }} />
        <Skeleton variant="rounded" width={78} height={24} sx={{ borderRadius: "6px" }} />
      </Box>
      <Box sx={{ flex: 1, minHeight: "14px" }} />
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "6px", pt: "14px" }}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} variant="rounded" width={30} height={30} sx={{ borderRadius: "8px" }} />
        ))}
      </Box>
    </Card>
  );
}

export function ClientCard({
  client,
  labels,
  onOpen,
  onAddRole,
  onContacts,
  onEdit,
  onArchive,
}: {
  client: ClientCardData;
  labels: ClientCardLabels;
} & ClientCardHandlers) {
  const [menuEl, setMenuEl] = useState<null | HTMLElement>(null);
  const logo = hue(client.name);
  const status = client.status ?? "paused";
  const health = client.health ?? "healthy";
  const healthTone = HEALTH_TONE[health] ?? "muted";
  const healthFg = TONE_FG[healthTone];
  const isHiring = status === "hiring";
  const flow = client.flow ?? { sourced: 0, screening: 0, interviewing: 0 };
  const pipeline = flow.sourced + flow.screening + flow.interviewing;

  const openMenu = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuEl(e.currentTarget);
  };
  const closeMenu = (e?: MouseEvent<HTMLElement>) => {
    e?.stopPropagation();
    setMenuEl(null);
  };
  const run = (handler?: (c: ClientCardData) => void) => (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    closeMenu();
    handler?.(client);
  };

  return (
    <Card
      variant="interactive"
      data-testid="client-card"
      onClick={() => onOpen?.(client)}
      sx={{
        p: "20px",
        display: "flex",
        flexDirection: "column",
        borderRadius: "16px",
        minHeight: 300,
        cursor: "pointer",
        transition: "transform 200ms cubic-bezier(.4,0,.2,1)",
        "&:hover": { transform: "translateY(-2px)" },
      }}
    >
      {/* Logo + health */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
          <Avatar
            variant="rounded"
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              bgcolor: logo.bg,
              color: logo.fg,
              fontFamily: "var(--font-grotesk), 'Space Grotesk', system-ui, sans-serif",
              fontSize: 17,
              fontWeight: 700,
              flex: "none",
            }}
          >
            {initials(client.name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Typography noWrap sx={{ fontSize: 15, fontWeight: 700, letterSpacing: "-.01em" }}>
                {client.name}
              </Typography>
              <Box
                sx={{
                  flex: "none",
                  fontSize: 10.5,
                  fontWeight: 700,
                  px: "8px",
                  py: "2px",
                  borderRadius: "6px",
                  color: isHiring ? TONE_FG.success : "surface.textMuted",
                  bgcolor: isHiring ? TONE_BG.success : "surface.inset",
                }}
              >
                {labels.status[status] ?? status}
              </Box>
            </Box>
            <Typography noWrap sx={{ fontSize: 11.5, color: "surface.textSecondary", mt: "2px" }}>
              {client.industry}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flex: "none",
            fontSize: 11,
            fontWeight: 700,
            color: healthFg,
            bgcolor: TONE_BG[healthTone],
            px: "9px",
            py: "3px",
            borderRadius: "6px",
          }}
        >
          <Box sx={{ width: 7, height: 7, borderRadius: "999px", bgcolor: healthFg }} />
          {labels.health[health] ?? health}
        </Box>
      </Box>

      {/* Next-action line (optional) */}
      {client.activity ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            mt: "14px",
            fontSize: 12.5,
            fontWeight: 700,
            color: healthFg,
          }}
        >
          <IconRenderer name="event" size={16} color="inherit" />
          <Box
            component="span"
            sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {client.activity}
          </Box>
        </Box>
      ) : null}

      {/* Candidate flow */}
      <Box sx={{ mt: "16px" }}>
        <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <Box
            sx={{
              fontSize: 10.5,
              letterSpacing: ".08em",
              color: "surface.textSecondary",
              fontWeight: 700,
            }}
          >
            {labels.candidateFlow}
          </Box>
          <Box sx={{ fontSize: 11.5, color: "surface.textSecondary" }}>
            <Box component="b" sx={{ color: "text.primary", fontSize: 12.5 }}>
              {pipeline}
            </Box>{" "}
            {labels.inPipeline}
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: "2px",
            height: 8,
            borderRadius: "99px",
            overflow: "hidden",
            bgcolor: "surface.inset",
            mt: "8px",
          }}
        >
          {FLOW_SEGMENTS.map((segment) => (
            <Box
              key={segment.key}
              title={labels.flow[segment.key]}
              sx={{
                width: pipeline ? `${Math.round((flow[segment.key] / pipeline) * 100)}%` : "0%",
                background: segment.color,
                ...(segment.key === "interviewing" ? { minWidth: pipeline ? 4 : 0 } : {}),
              }}
            />
          ))}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            mt: "8px",
            fontSize: 10.5,
            color: "surface.textSecondary",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {FLOW_SEGMENTS.map((segment) => (
            <Box key={segment.key} sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "99px",
                  background: segment.color,
                  flex: "none",
                }}
              />
              {flow[segment.key]} {labels.flow[segment.key]}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Roles / placed chips + account manager */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mt: "16px" }}>
        <CardChip icon="work" label={`${client.openRoles ?? 0} ${labels.requirements}`} />
        <CardChip icon="handshake" label={`${client.placements ?? 0} ${labels.placements}`} />
        {client.accountLeadName ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px", ml: "auto", minWidth: 0 }}>
            <Avatar
              sx={{
                width: 20,
                height: 20,
                fontSize: 9,
                fontWeight: 700,
                bgcolor: "surface.inset",
                color: "surface.textMuted",
              }}
            >
              {initials(client.accountLeadName)}
            </Avatar>
            <Typography noWrap sx={{ fontSize: 11.5, color: "surface.textSecondary" }}>
              {client.accountLeadName}
            </Typography>
          </Box>
        ) : null}
      </Box>

      {/* AI insight (optional) */}
      {client.insightTitle ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            mt: "16px",
            pt: "14px",
            borderTop: "1px dashed",
            borderColor: "surface.divider",
          }}
        >
          <Box sx={{ color: "surface.successFg", flex: "none", lineHeight: 1.4 }}>
            <IconRenderer name="auto-awesome" size={16} color="inherit" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>{client.insightTitle}</Typography>
            {client.insightBody ? (
              <Typography sx={{ fontSize: 11.5, color: "surface.textSecondary", mt: "1px" }}>
                {client.insightBody}
              </Typography>
            ) : null}
          </Box>
        </Box>
      ) : null}

      <Box sx={{ flex: 1, minHeight: "14px" }} />

      {/* Footer: event + actions */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "10px",
          pt: "14px",
          borderTop: "1px dashed",
          borderColor: "surface.divider",
        }}
      >
        {/* A bare caption over nothing reads as a broken row, so the whole
            block waits until there is an activity to label. */}
        <Box sx={{ minWidth: 0 }}>
          {client.eventText ? (
            <>
              <Box
                sx={{
                  fontSize: 10,
                  letterSpacing: ".08em",
                  fontWeight: 700,
                  color: "surface.textSecondary",
                }}
              >
                {labels.lastActivity}
              </Box>
              <Typography noWrap sx={{ fontSize: 12.5, color: "surface.textMuted", mt: "3px" }}>
                {client.eventText}
              </Typography>
              {client.eventWhen ? (
                <Typography sx={{ fontSize: 11, color: "surface.textSecondary", mt: "1px" }}>
                  {client.eventWhen}
                </Typography>
              ) : null}
            </>
          ) : null}
        </Box>
        <Box sx={{ display: "flex", gap: "6px", flex: "none" }}>
          <IconButton title={labels.open} onClick={run(onOpen)} sx={ACTION_BTN}>
            <IconRenderer name="open-in-new" size={16} />
          </IconButton>
          <IconButton title={labels.edit} onClick={run(onEdit)} sx={ACTION_BTN}>
            <IconRenderer name="edit" size={16} />
          </IconButton>
          <IconButton title={labels.more} onClick={openMenu} sx={ACTION_BTN}>
            <IconRenderer name="more" size={16} />
          </IconButton>
          <Menu
            anchorEl={menuEl}
            open={Boolean(menuEl)}
            onClose={() => closeMenu()}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <MenuItem onClick={run(onAddRole)} sx={{ fontSize: 12.5, gap: "10px" }}>
              <IconRenderer name="add-box" size={16} />
              {labels.addRole}
            </MenuItem>
            <MenuItem onClick={run(onContacts)} sx={{ fontSize: 12.5, gap: "10px" }}>
              <IconRenderer name="contacts" size={16} />
              {labels.contacts}
            </MenuItem>
            <MenuItem
              onClick={run(onArchive)}
              sx={{ fontSize: 12.5, gap: "10px", color: "surface.warningFg" }}
            >
              <IconRenderer name="archive" size={16} />
              {labels.archive}
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Card>
  );
}
