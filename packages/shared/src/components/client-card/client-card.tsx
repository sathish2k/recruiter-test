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
  accountManager: string;
  flow: Record<"sourced" | "screening" | "interviewing", string>;
  status: Record<string, string>;
  health: Record<string, string>;
  open: string;
  addRole: string;
  contacts: string;
  more: string;
  edit: string;
  delete: string;
}

export interface ClientCardHandlers {
  onOpen?: (client: ClientCardData) => void;
  onAddRole?: (client: ClientCardData) => void;
  onContacts?: (client: ClientCardData) => void;
  onEdit?: (client: ClientCardData) => void;
  onDelete?: (client: ClientCardData) => void;
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
  { key: "sourced" as const, color: "var(--mui-palette-surface-neutral)" },
  { key: "screening" as const, color: "var(--mui-palette-surface-infoFg)" },
  { key: "interviewing" as const, color: "var(--mui-palette-surface-accentBright)" },
];

// Health tone → themed foreground token (dot + label share it).
const HEALTH_FG: Record<string, string> = {
  healthy: "surface.successFg",
  attention: "surface.warningFg",
  at_risk: "surface.accentBright",
  dormant: "surface.textSecondary",
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
  width: 28,
  height: 28,
  border: "1px solid",
  borderColor: "surface.border",
  color: "text.secondary",
  "&:hover": { bgcolor: "surface.hover", color: "text.primary" },
} as const;

function CardChip({ icon, label, iconColor }: { icon: string; label: string; iconColor?: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        flex: "none",
        px: "10px",
        py: "4px",
        borderRadius: "999px",
        bgcolor: "surface.hoverSubtle",
        border: "1px solid",
        borderColor: "surface.divider",
        fontSize: 11,
        fontWeight: 600,
        color: "surface.textMuted",
      }}
    >
      <IconRenderer
        name={icon}
        size={13}
        color={iconColor ?? "var(--mui-palette-surface-textSecondary)"}
      />
      {label}
    </Box>
  );
}

export function ClientCardSkeleton() {
  return (
    <Card
      variant="interactive"
      sx={{
        p: "20px 18px 16px",
        borderRadius: "18px",
        minHeight: 270,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "11px" }}>
        <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: "13px" }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="40%" height={14} sx={{ mt: "3px" }} />
        </Box>
        <Skeleton variant="rounded" width={78} height={24} sx={{ borderRadius: "999px" }} />
      </Box>
      <Skeleton variant="text" width="45%" height={16} sx={{ mt: "12px" }} />
      <Box sx={{ mt: "15px" }}>
        <Skeleton variant="text" width="100%" height={12} />
        <Skeleton variant="rounded" height={8} sx={{ mt: "7px", borderRadius: "99px" }} />
        <Skeleton variant="text" width="80%" height={12} sx={{ mt: "7px" }} />
      </Box>
      <Box sx={{ display: "flex", gap: "7px", mt: "13px" }}>
        <Skeleton variant="rounded" width={78} height={24} sx={{ borderRadius: "999px" }} />
        <Skeleton variant="rounded" width={78} height={24} sx={{ borderRadius: "999px" }} />
      </Box>
      <Box sx={{ flex: 1 }} />
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "6px", mt: "15px", pt: "12px" }}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} variant="circular" width={28} height={28} />
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
  onDelete,
}: {
  client: ClientCardData;
  labels: ClientCardLabels;
} & ClientCardHandlers) {
  const [menuEl, setMenuEl] = useState<null | HTMLElement>(null);
  const logo = hue(client.name);
  const status = client.status ?? "paused";
  const health = client.health ?? "healthy";
  const healthFg = HEALTH_FG[health] ?? "surface.textSecondary";
  const isHiring = status === "hiring";
  const flow = client.flow ?? { sourced: 0, screening: 0, interviewing: 0 };
  const pipeline = flow.sourced + flow.screening + flow.interviewing;
  const lead = hue(client.accountLeadName ?? client.name);

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
      onClick={() => onOpen?.(client)}
      sx={{
        p: "20px 18px 16px",
        display: "flex",
        flexDirection: "column",
        borderRadius: "18px",
        minHeight: 270,
        cursor: "pointer",
        transition: "transform .15s, border-color .15s",
        "&:hover": { transform: "translateY(-2px)", borderColor: "surface.borderStrong" },
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
        <Box sx={{ display: "flex", alignItems: "center", gap: "11px", minWidth: 0 }}>
          <Avatar
            variant="rounded"
            sx={{
              width: 44,
              height: 44,
              borderRadius: "13px",
              bgcolor: logo.bg,
              color: logo.fg,
              fontSize: 16,
              fontWeight: 700,
              flex: "none",
            }}
          >
            {initials(client.name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <Typography noWrap sx={{ fontSize: 15, fontWeight: 700, letterSpacing: "-.01em" }}>
                {client.name}
              </Typography>
              <Box
                sx={{
                  flex: "none",
                  fontSize: 10,
                  fontWeight: 700,
                  px: "8px",
                  py: "2px",
                  borderRadius: "999px",
                  border: "1px solid",
                  color: isHiring ? "surface.successFg" : "surface.textMuted",
                  bgcolor: isHiring ? "surface.successSoftBg" : "surface.tint",
                  borderColor: isHiring ? "surface.successSoftBorder" : "surface.borderStrong",
                }}
              >
                {labels.status[status] ?? status}
              </Box>
            </Box>
            <Typography noWrap sx={{ fontSize: 11, color: "text.disabled", mt: "3px" }}>
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
            fontWeight: 600,
            color: healthFg,
            bgcolor: "surface.scrim",
            border: "1px solid",
            borderColor: "surface.border",
            px: "11px",
            py: "4px",
            borderRadius: "999px",
          }}
        >
          <Box sx={{ width: 5, height: 5, borderRadius: "999px", bgcolor: healthFg }} />
          {labels.health[health] ?? health}
        </Box>
      </Box>

      {/* Activity line (optional) */}
      {client.activity ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            mt: "7px",
            fontSize: 12,
            fontWeight: 600,
            color: healthFg,
          }}
        >
          <Box
            sx={{ width: 6, height: 6, borderRadius: "99px", bgcolor: healthFg, flex: "none" }}
          />
          {client.activity}
        </Box>
      ) : null}

      {/* Candidate flow */}
      <Box sx={{ mt: "15px" }}>
        <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <Box
            sx={{ fontSize: 10, letterSpacing: ".08em", color: "text.disabled", fontWeight: 700 }}
          >
            {labels.candidateFlow}
          </Box>
          <Box sx={{ fontSize: 11, color: "text.secondary" }}>
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
            mt: "7px",
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
            gap: "10px",
            mt: "7px",
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
      <Box sx={{ display: "flex", alignItems: "center", gap: "7px", mt: "13px" }}>
        <CardChip icon="work" label={`${client.openRoles ?? 0} ${labels.requirements}`} />
        <CardChip
          icon="handshake"
          iconColor="var(--mui-palette-surface-accentBright)"
          label={`${client.placements ?? 0} ${labels.placements}`}
        />
        {client.accountLeadName ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "3px",
              ml: "auto",
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                fontSize: 9,
                letterSpacing: ".09em",
                color: "surface.textFaint",
                fontWeight: 700,
              }}
            >
              {labels.accountManager}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "5px", minWidth: 0 }}>
              <Avatar
                sx={{
                  width: 18,
                  height: 18,
                  fontSize: 8.5,
                  fontWeight: 700,
                  bgcolor: lead.bg,
                  color: lead.fg,
                }}
              >
                {initials(client.accountLeadName)}
              </Avatar>
              <Typography noWrap sx={{ fontSize: 11, color: "text.secondary" }}>
                {client.accountLeadName}
              </Typography>
            </Box>
          </Box>
        ) : null}
      </Box>

      {/* AI insight (optional) */}
      {client.insightTitle ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: "9px",
            mt: "14px",
            pt: "13px",
            borderTop: "1px solid",
            borderColor: "surface.divider",
          }}
        >
          <Box sx={{ color: "surface.successFg", flex: "none", mt: "1px" }}>
            <IconRenderer name="sparkle" size={14} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{client.insightTitle}</Typography>
            {client.insightBody ? (
              <Typography sx={{ fontSize: 11, color: "text.secondary", mt: "1px" }}>
                {client.insightBody}
              </Typography>
            ) : null}
          </Box>
        </Box>
      ) : null}

      {/* Account lead */}
      {client.accountLeadName ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mt: "14px" }}>
          <Avatar
            sx={{
              width: 22,
              height: 22,
              fontSize: 8.5,
              fontWeight: 700,
              bgcolor: hue(client.accountLeadName).bg,
              color: hue(client.accountLeadName).fg,
            }}
          >
            {initials(client.accountLeadName)}
          </Avatar>
          <Typography sx={{ fontSize: 12, color: "text.muted" }}>
            {client.accountLeadName}
          </Typography>
        </Box>
      ) : null}

      <Box sx={{ flex: 1 }} />

      {/* Footer: event + actions */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "8px",
          mt: "15px",
          pt: "12px",
          borderTop: "1px solid",
          borderColor: "surface.divider",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          {client.eventText ? (
            <Typography
              sx={{
                fontSize: 12,
                color: "text.muted",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {client.eventText}
            </Typography>
          ) : null}
          {client.eventWhen ? (
            <Typography sx={{ fontSize: 11, color: "text.disabled", mt: "2px" }}>
              {client.eventWhen}
            </Typography>
          ) : null}
        </Box>
        <Box sx={{ display: "flex", gap: "6px", flex: "none" }}>
          <IconButton title={labels.open} onClick={run(onOpen)} sx={ACTION_BTN}>
            <IconRenderer name="open-in-new" size={14} />
          </IconButton>
          <IconButton
            title={labels.addRole}
            onClick={run(onAddRole)}
            sx={{
              width: 28,
              height: 28,
              border: "1px solid",
              borderColor: "surface.primarySoftBorder",
              bgcolor: "surface.primarySoftBg",
              color: "surface.accentBright",
              "&:hover": { bgcolor: "surface.primarySoftBorder", color: "surface.accentBright" },
            }}
          >
            <IconRenderer name="add" size={14} />
          </IconButton>
          <IconButton title={labels.contacts} onClick={run(onContacts)} sx={ACTION_BTN}>
            <IconRenderer name="contacts" size={14} />
          </IconButton>
          <IconButton title={labels.more} onClick={openMenu} sx={ACTION_BTN}>
            <IconRenderer name="more" size={14} />
          </IconButton>
          <Menu
            anchorEl={menuEl}
            open={Boolean(menuEl)}
            onClose={() => closeMenu()}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <MenuItem onClick={run(onEdit)} sx={{ fontSize: 12.5, gap: "9px" }}>
              <IconRenderer name="edit" size={14} />
              {labels.edit}
            </MenuItem>
            <MenuItem
              onClick={run(onDelete)}
              sx={{ fontSize: 12.5, gap: "9px", color: "surface.errorFg" }}
            >
              <IconRenderer name="delete" size={14} />
              {labels.delete}
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Card>
  );
}
