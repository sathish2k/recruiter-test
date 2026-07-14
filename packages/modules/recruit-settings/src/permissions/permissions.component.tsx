"use client";

import CancelRounded from "@mui/icons-material/CancelRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import {
  type AccessAction,
  useConfiguration,
  useFetch,
  useTranslation,
} from "@recruit/sdk";
import { IconRenderer, Toast, useToast } from "@recruit/shared";
import { useEffect, useMemo, useState } from "react";
import type { PermissionsConfig } from "./permissions.configuration";

interface RolePermissions {
  role: string;
  permissions: { resource: string; actions: AccessAction[] }[];
}

type PermState = Record<string, Record<string, Set<AccessAction>>>;

interface CellMenuState {
  anchor: HTMLElement;
  role: string;
  resource: string;
}

function buildState(
  data: RolePermissions[],
  columns: string[],
  resources: string[],
): PermState {
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

function serializeRole(
  state: PermState,
  role: string,
  resources: string[],
): string {
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
  const { data, mutation, mutate } = useFetch<RolePermissions[]>(id);
  const { toast, show, clear } = useToast();

  const columns = config.columns ?? [];
  const resources = config.resources ?? [];
  const crudActions = config.crudActions ?? [];
  const lockedColumns = useMemo(
    () => config.lockedColumns ?? [],
    [config.lockedColumns],
  );

  const baseline = useMemo(
    () => buildState(data ?? [], columns, resources),
    [data, columns, resources],
  );
  const [editable, setEditable] = useState<PermState>(baseline);
  const [cellMenu, setCellMenu] = useState<CellMenuState | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEditable(cloneState(baseline));
  }, [baseline]);

  const roleLabelOf = (role: string) =>
    config.roles?.find((r) => r.value === role)?.label ?? role;
  const isLocked = (role: string) => lockedColumns.includes(role);

  const changedRoles = columns.filter(
    (role) =>
      !isLocked(role) &&
      serializeRole(editable, role, resources) !==
        serializeRole(baseline, role, resources),
  );
  const dirty = changedRoles.length > 0;

  const toggleAction = (
    role: string,
    resource: string,
    actions: AccessAction[],
  ) => {
    setEditable((prev) => {
      const next = cloneState(prev);
      const set = next[role][resource];
      const active = actions.some((a) => set.has(a));
      for (const a of actions) {
        if (active) set.delete(a);
        else set.add(a);
      }
      return next;
    });
  };

  const reset = () => {
    setCellMenu(null);
    setEditable(cloneState(baseline));
  };

  const save = async () => {
    setCellMenu(null);
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
        changedRoles.length === 1
          ? t("toast.savedRole", { role: labels[0] })
          : labels.join(" · "),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <TableContainer>
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "12px",
          mb: "14px",
        }}
      >
        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
          {t("title")}
        </Typography>
        <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
          {t("note")}
        </Typography>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t("permission")}</TableCell>
            {columns.map((column) => (
              <TableCell key={column} align="center">
                {t(roleLabelOf(column))}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {resources.map((resource) => (
            <TableRow key={resource}>
              <TableCell>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <IconRenderer
                    name={config.icons?.[resource]}
                    size={16}
                    sx={{ color: "text.disabled" }}
                  />
                  {t(`resources.${resource}`)}
                </Box>
              </TableCell>
              {columns.map((column) => {
                const actions = editable[column]?.[resource] ?? new Set();
                const canRead = actions.has("read");
                const locked = isLocked(column);
                const letters = crudActions
                  .filter((group) => group.actions.some((a) => actions.has(a)))
                  .map((group) => group.letter)
                  .join("");
                return (
                  <TableCell key={column} align="center">
                    <Box
                      onClick={
                        locked
                          ? undefined
                          : (e) =>
                              setCellMenu({
                                anchor: e.currentTarget,
                                role: column,
                                resource,
                              })
                      }
                      sx={{
                        display: "inline-flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "2px",
                        px: "8px",
                        py: "4px",
                        borderRadius: "9px",
                        cursor: locked ? "default" : "pointer",
                        opacity: locked ? 0.55 : 1,
                        transition: "background-color .15s ease",
                        "&:hover": locked
                          ? undefined
                          : { bgcolor: "action.hover" },
                      }}
                    >
                      {canRead ? (
                        <CheckCircleRounded
                          sx={{ fontSize: 19, color: "success.light" }}
                        />
                      ) : (
                        <CancelRounded
                          sx={{ fontSize: 19, color: "divider" }}
                        />
                      )}
                      {letters ? (
                        <Typography
                          sx={{
                            fontSize: 9.5,
                            fontWeight: 600,
                            letterSpacing: "0.12em",
                            color: "text.disabled",
                          }}
                        >
                          {letters}
                        </Typography>
                      ) : null}
                    </Box>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "8px",
          mt: "16px",
        }}
      >
        <Button variant="outlined" onClick={reset} disabled={!dirty || saving}>
          {t("buttons.reset")}
        </Button>
        <Button variant="contained" onClick={save} disabled={!dirty || saving}>
          {t("buttons.save")}
        </Button>
      </Box>

      <Menu
        open={Boolean(cellMenu)}
        anchorEl={cellMenu?.anchor}
        onClose={() => setCellMenu(null)}
      >
        {crudActions.map((group) => {
          const set = cellMenu
            ? (editable[cellMenu.role]?.[cellMenu.resource] ?? new Set())
            : new Set<AccessAction>();
          const active = group.actions.some((a) => set.has(a));
          return (
            <MenuItem
              key={group.key}
              selected={active}
              onClick={() =>
                cellMenu &&
                toggleAction(cellMenu.role, cellMenu.resource, group.actions)
              }
              sx={{
                minWidth: 168,
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              {t(group.label)}
              {active ? (
                <IconRenderer name="check" size={14} color="#FF9D57" />
              ) : null}
            </MenuItem>
          );
        })}
      </Menu>

      <Toast toast={toast} onClose={clear} />
    </TableContainer>
  );
}
