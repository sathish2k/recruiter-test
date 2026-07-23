"use client";

import CancelRounded from "@mui/icons-material/CancelRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { type AccessAction, useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import { IconRenderer, useToast } from "@recruit/shared";
import { useEffect, useMemo, useState } from "react";
import type { PermissionsConfig } from "./permissions.configuration";
import { RoleCards, type RoleHolders } from "./role-cards";

interface RolePermissions {
  role: string;
  permissions: { resource: string; actions: AccessAction[] }[];
}

type PermState = Record<string, Record<string, Set<AccessAction>>>;

function buildState(data: RolePermissions[], columns: string[], resources: string[]): PermState {
  const state: PermState = {};
  for (const role of columns) {
    const entry = data.find((d) => d.role === role);
    const wildcard = entry?.permissions.find((p) => p.resource === "*");
    const map: Record<string, Set<AccessAction>> = {};
    for (const resource of resources) {
      if (wildcard) {
        map[resource] = new Set(wildcard.actions);
      } else {
        const perm = entry?.permissions.find((p) => p.resource === resource);
        map[resource] = new Set(perm?.actions ?? []);
      }
    }
    state[role] = map;
  }
  return state;
}

function serializeRole(state: PermState, role: string, resources: string[]): string {
  return resources
    .map((resource) => [...(state[role]?.[resource] ?? [])].sort().join(","))
    .join("|");
}

function cloneState(state: PermState): PermState {
  const next: PermState = {};
  for (const role of Object.keys(state)) {
    next[role] = {};
    for (const resource of Object.keys(state[role])) {
      next[role][resource] = new Set(state[role][resource]);
    }
  }
  return next;
}

export function PermissionsComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<PermissionsConfig>(id);
  const { data, meta, isLoading, mutation, mutate } = useFetch<RolePermissions[]>(id);
  const { show } = useToast();

  const columns = config.columns ?? [];
  const resources = config.resources ?? [];
  const crudActions = config.crudActions ?? [];
  const lockedColumns = useMemo(() => config.lockedColumns ?? [], [config.lockedColumns]);

  const baseline = useMemo(
    () => buildState(data ?? [], columns, resources),
    [data, columns, resources],
  );
  const [editable, setEditable] = useState<PermState>(baseline);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEditable(cloneState(baseline));
  }, [baseline]);

  // Counts and names come from the same endpoint as the matrix, so the cards
  // can't drift from the roles they describe.
  const holders = (meta?.holders as Record<string, RoleHolders>) ?? {};

  const roleLabelOf = (role: string) => config.roles?.find((r) => r.value === role)?.label ?? role;
  const isLocked = (role: string) => lockedColumns.includes(role);

  const changedRoles = columns.filter(
    (role) =>
      !isLocked(role) &&
      serializeRole(editable, role, resources) !== serializeRole(baseline, role, resources),
  );
  const dirty = changedRoles.length > 0;

  /** Every granular action, so a binary "on" grants the whole row. */
  const allActions = useMemo(
    () => [...new Set(crudActions.flatMap((group) => group.actions))],
    [crudActions],
  );

  /** The design's cell is a single yes/no — granting means the full set. */
  const toggleCell = (role: string, resource: string) => {
    setEditable((prev) => {
      const next = cloneState(prev);
      const set = next[role][resource];
      if (set.size > 0) set.clear();
      else for (const a of allActions) set.add(a);
      return next;
    });
  };

  const reset = () => {
    setEditable(cloneState(baseline));
  };

  const save = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      for (const role of changedRoles) {
        const permissions = resources
          .map((resource) => ({
            resource,
            actions: [...editable[role][resource]],
          }))
          .filter((p) => p.actions.length > 0);
        await mutation.update?.({ role, permissions });
      }
      const labels = changedRoles.map((role) => t(roleLabelOf(role)));
      await mutate();
      show(
        t("toast.savedTitle"),
        changedRoles.length === 1 ? t("toast.savedRole", { role: labels[0] }) : labels.join(" · "),
      );
    } finally {
      setSaving(false);
    }
  };

  const GRID = "2.4fr 1fr 1fr 1fr";

  /** Mirrors the real layout so the swap to content doesn't shift anything. */
  const skeleton = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
          gap: "16px",
        }}
      >
        {[0, 1, 2].map((card) => (
          <Box
            key={card}
            sx={{
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "16px",
              p: "18px 20px",
            }}
          >
            <Skeleton variant="rounded" width={92} height={24} sx={{ borderRadius: "999px" }} />
            <Skeleton variant="text" width="100%" sx={{ mt: "12px" }} />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width={110} sx={{ mt: "9px" }} />
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "16px",
          p: "20px 22px",
        }}
      >
        <Skeleton variant="text" width={180} height={22} />
        <Skeleton variant="text" width={340} />
        <Skeleton variant="rounded" height={38} sx={{ mt: "14px", borderRadius: "10px" }} />
        {[0, 1, 2, 3, 4, 5].map((row) => (
          <Box
            key={row}
            sx={{
              display: "grid",
              gridTemplateColumns: GRID,
              gap: "10px",
              alignItems: "center",
              p: "11px 14px",
            }}
          >
            <Skeleton variant="text" width="70%" />
            {[0, 1, 2].map((cell) => (
              <Skeleton key={cell} variant="circular" width={19} height={19} sx={{ mx: "auto" }} />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );

  if (isLoading) return skeleton;

  /** One yes/no glyph. The owner column is fixed on and reads dimmed. */
  const cell = (resource: string, role: string) => {
    const on = (editable[role]?.[resource]?.size ?? 0) > 0;
    const locked = isLocked(role);
    return (
      <Box
        key={role}
        onClick={locked ? undefined : () => toggleCell(role, resource)}
        sx={{
          display: "flex",
          justifyContent: "center",
          cursor: locked ? "default" : "pointer",
          opacity: locked ? 0.55 : 1,
        }}
      >
        {on || locked ? (
          <CheckCircleRounded sx={{ fontSize: 19, color: "surface.successFg" }} />
        ) : (
          <CancelRounded sx={{ fontSize: 19, color: "rgba(255,255,255,.22)" }} />
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <RoleCards cards={config.cards ?? []} holders={holders} t={t} />

      <Box
        sx={{
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "16px",
          p: "20px 22px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: "14px",
            gap: "12px",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>{t("title")}</Typography>
            <Typography sx={{ fontSize: 12, color: "text.disabled", mt: "2px" }}>
              {t("note")}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<IconRenderer name="tune" size={15} />}
            sx={{ flex: "none" }}
          >
            {t("manageMembers")}
          </Button>
        </Box>

        {/* Column header strip */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: GRID,
            gap: "10px",
            p: "10px 14px",
            bgcolor: "var(--mui-palette-surface-headBg)",
            borderRadius: "10px",
            fontSize: 12,
            color: "text.secondary",
          }}
        >
          <Box>{t("permission")}</Box>
          {columns.map((role) => (
            <Box key={role} sx={{ textAlign: "center" }}>
              {t(roleLabelOf(role))}
            </Box>
          ))}
        </Box>

        {(config.groups ?? []).map((group) => (
          <Box key={group.label}>
            <Typography
              sx={{
                fontSize: 10.5,
                letterSpacing: ".1em",
                fontWeight: 700,
                color: "text.disabled",
                p: "16px 14px 7px",
              }}
            >
              {t(group.label)}
            </Typography>
            {group.resources.map((resource) => (
              <Box
                key={resource}
                sx={{
                  display: "grid",
                  gridTemplateColumns: GRID,
                  gap: "10px",
                  alignItems: "center",
                  p: "11px 14px",
                  borderBottom: "1px solid rgba(255,255,255,.05)",
                  fontSize: 13,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    color: "surface.textMuted",
                  }}
                >
                  <IconRenderer
                    name={config.icons?.[resource] ?? "settings"}
                    size={16}
                    sx={{ color: "text.disabled" }}
                  />
                  {t(`resources.${resource}`)}
                  <Tooltip title={t(`tips.${resource}`, "")} placement="top">
                    <Box component="span" sx={{ display: "inline-flex", cursor: "help" }}>
                      <IconRenderer name="help" size={14} sx={{ color: "#5A5852" }} />
                    </Box>
                  </Tooltip>
                </Box>
                {columns.map((role) => cell(resource, role))}
              </Box>
            ))}
          </Box>
        ))}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            pt: "14px",
          }}
        >
          <Typography
            sx={{ fontSize: 11.5, color: "text.disabled", maxWidth: 520, lineHeight: 1.5 }}
          >
            {t("footerNote")}
          </Typography>
          <Box sx={{ display: "flex", gap: "8px", flex: "none" }}>
            <Button variant="outlined" onClick={reset} disabled={!dirty}>
              {t("buttons.reset")}
            </Button>
            <Button variant="contained" onClick={save} loading={saving} disabled={!dirty}>
              {t("buttons.save")}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
