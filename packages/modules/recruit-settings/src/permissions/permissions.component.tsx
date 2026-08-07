"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useAccess, useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import { IconRenderer, useModal, useToast } from "@recruit/shared";
import type { RecordScope } from "@recruit/types";
import { useEffect, useMemo, useState } from "react";
import { MembersSheet } from "./members-sheet";
import { type MatrixGroup, PermissionMatrix } from "./permission-matrix";
import { PermissionSummary, type SummaryStat } from "./permission-summary";
import type { PermissionsConfig } from "./permissions.configuration";
import {
  applyToggle,
  buildDrafts,
  cloneDraft,
  cloneDrafts,
  type DraftState,
  diffDraft,
  matrixResources,
  type RoleDraft,
  type RoleHolders,
  type RoleRecord,
  serialize,
  summarise,
} from "./permissions.model";
import { type RoleCardData, RoleCards } from "./role-cards";
import { DeleteRoleDialog, RoleFormDialog, SaveDialog } from "./role-dialogs";

const EMPTY_DRAFT: RoleDraft = { grants: {}, scope: {}, extras: {} };

export function PermissionsComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<PermissionsConfig>(id);
  const { data, meta, isLoading, mutation, mutate } = useFetch<RoleRecord[]>(id);
  const { show } = useToast();
  const { can } = useAccess();

  // Editing a role and minting one are separate authorities: an admin tunes the
  // matrix, only an owner adds or removes a role.
  const canManage = can(config.manageAccess);
  const canCreate = can(config.createAccess);

  const saveModal = useModal();
  const createModal = useModal<"create" | "duplicate">();
  const deleteModal = useModal();

  const records = useMemo(() => data ?? [], [data]);
  const holders = (meta?.holders as Record<string, RoleHolders>) ?? {};
  const resources = useMemo(() => matrixResources(config), [config]);

  const baseline = useMemo(() => buildDrafts(records, config), [records, config]);
  const [drafts, setDrafts] = useState<DraftState>(baseline);
  const [roleId, setRoleId] = useState("");
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [membersRole, setMembersRole] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", preset: "blank" });
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDrafts(cloneDrafts(baseline));
  }, [baseline]);

  // Land on the first role that can actually be edited — opening on a frozen
  // one reads as "this screen does nothing".
  const fallback =
    records.find((entry) => !config.lockedRoles.includes(entry.role))?.role ??
    records[0]?.role ??
    "";
  const selected = roleId && drafts[roleId] ? roleId : fallback;
  const record = records.find((entry) => entry.role === selected);
  const draft = drafts[selected] ?? EMPTY_DRAFT;
  const base = baseline[selected] ?? EMPTY_DRAFT;
  const locked = config.lockedRoles.includes(selected) || !canManage;

  const roleLabel = (role: string) => {
    const entry = records.find((item) => item.role === role);
    return entry?.label ?? t(`roles.labels.${role}`, role);
  };
  const roleDescription = (entry: RoleRecord) =>
    entry.description ?? t(`roles.descriptions.${entry.role}`, t("roles.descriptions.custom"));
  const resourceLabel = (resource: string) => t(`resources.${resource}`, resource);
  const columnLabel = (key: string) =>
    t(config.columns.find((column) => column.key === key)?.label ?? key);
  const scopeLabel = (scope: RecordScope) => t(`scopes.${scope}`);
  const memberCount = (role: string) => {
    const count = holders[role]?.count ?? 0;
    return t(count === 1 ? "members.member" : "members.members", { count });
  };

  const editRole = (apply: (next: RoleDraft) => void) => {
    if (locked) return;
    setDrafts((prev) => {
      const copy = cloneDraft(prev[selected] ?? EMPTY_DRAFT);
      apply(copy);
      return { ...prev, [selected]: copy };
    });
  };

  const needle = query.trim().toLowerCase();
  const visibleGroups: MatrixGroup[] = config.groups
    .map((group) => ({
      key: group.key,
      title: t(group.key),
      rows: group.rows
        .map((row) => ({
          ...row,
          name: resourceLabel(row.resource),
          hint: t(`hints.${row.resource}`, ""),
        }))
        .filter(
          (row) =>
            !needle ||
            row.name.toLowerCase().includes(needle) ||
            row.hint.toLowerCase().includes(needle),
        ),
    }))
    .filter((group) => group.rows.length > 0);

  const visible = visibleGroups.flatMap((group) => group.rows.map((row) => row.resource));

  const coverage = resources.map((resource) => {
    const granted = draft.grants[resource] ?? [];
    return {
      resource,
      name: resourceLabel(resource),
      on: granted.length > 0,
      letters: granted.map((key) => columnLabel(key).charAt(0)).join(""),
    };
  });

  const changes = diffDraft(base, draft, config, {
    resource: resourceLabel,
    column: columnLabel,
    scope: scopeLabel,
  });

  const totals = summarise(draft, config);
  const stats: SummaryStat[] = [
    {
      key: "reachable",
      value: totals.reachable.length,
      unit: t("summary.of", { total: totals.resources.length }),
      label: t("summary.reachable"),
      note: t("summary.reachableNote"),
    },
    {
      key: "enabled",
      value: totals.enabled,
      unit: t("summary.of", { total: totals.total }),
      label: t("summary.enabled"),
      note: t("summary.enabledNote"),
    },
    {
      key: "restricted",
      value: totals.restricted.length,
      unit: t(totals.restricted.length === 1 ? "summary.resource" : "summary.resources"),
      label: t("summary.restricted"),
      note: t("summary.restrictedNote"),
      tone: totals.restricted.length ? "default" : "success",
    },
    {
      key: "destructive",
      value: totals.destructive.length,
      unit: t(totals.destructive.length === 1 ? "summary.resource" : "summary.resources"),
      label: t("summary.destructive"),
      note: t("summary.destructiveNote"),
      tone: totals.destructive.length ? "warning" : "success",
    },
  ];

  const restricted = totals.restricted.map(resourceLabel);

  const cards: RoleCardData[] = records.map((entry) => ({
    role: entry.role,
    label: roleLabel(entry.role),
    description: roleDescription(entry),
    icon: entry.icon ?? config.roleIcons[entry.role] ?? config.customRoleIcon,
    system: entry.system,
    members: holders[entry.role]?.count ?? 0,
    edited: entry.updatedAt
      ? entry.updatedBy
        ? t("roles.editedBy", {
            date: new Date(entry.updatedAt).toLocaleDateString(),
            name: entry.updatedBy,
          })
        : t("roles.edited", { date: new Date(entry.updatedAt).toLocaleDateString() })
      : t("roles.neverEdited"),
  }));

  const presets = [
    { id: "blank", label: t("dialogs.create.blank"), detail: t("dialogs.create.blankDetail") },
    ...records.map((entry) => ({
      id: entry.role,
      label: roleLabel(entry.role),
      detail: t("dialogs.create.copyDetail", {
        count: summarise(drafts[entry.role] ?? EMPTY_DRAFT, config).enabled,
        role: roleLabel(entry.role),
      }),
    })),
  ];

  const nameTaken =
    !!form.name.trim() &&
    cards.some((card) => card.label.toLowerCase() === form.name.trim().toLowerCase());

  const failed = () => show(t("toast.failedTitle"), t("toast.failedSub"), "error");

  const save = async () => {
    setBusy(true);
    try {
      await mutation.update?.({ role: selected, ...serialize(draft, config) });
      await mutate();
      saveModal.close();
      show(
        t("toast.savedTitle"),
        t("toast.savedSub", { role: roleLabel(selected), members: memberCount(selected) }),
      );
    } catch {
      failed();
    } finally {
      setBusy(false);
    }
  };

  const createRole = async () => {
    const duplicate = createModal.data === "duplicate";
    setBusy(true);
    try {
      const created = (await mutation.create?.({
        label: form.name.trim(),
        from: duplicate ? selected : form.preset,
      })) as RoleRecord | undefined;
      await mutate();
      createModal.close();
      if (created) setRoleId(created.role);
      show(t("toast.createdTitle"), t("toast.createdSub", { role: form.name.trim() }));
    } catch {
      failed();
    } finally {
      setBusy(false);
    }
  };

  const removeRole = async () => {
    const label = roleLabel(selected);
    const members = memberCount(selected);
    setBusy(true);
    try {
      await mutation.remove?.({ role: selected, reassignTo: config.reassignTo });
      await mutate();
      deleteModal.close();
      setTyped("");
      setRoleId(config.reassignTo);
      show(
        t("toast.deletedTitle"),
        t("toast.deletedSub", { role: label, members, target: roleLabel(config.reassignTo) }),
      );
    } catch {
      failed();
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card variant="base" sx={{ p: "22px 24px" }}>
          <Skeleton variant="text" width={160} height={24} />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(236px,1fr))",
              gap: "12px",
              mt: "16px",
            }}
          >
            {[0, 1, 2, 3].map((card) => (
              <Skeleton key={card} variant="rounded" height={132} sx={{ borderRadius: "12px" }} />
            ))}
          </Box>
        </Card>
        <Card variant="base" sx={{ p: "22px 24px" }}>
          <Skeleton variant="text" width={200} height={24} />
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <Skeleton key={row} variant="text" height={38} />
          ))}
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <Card
        variant="base"
        sx={{ p: "22px 24px", display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{t("roles.title")}</Typography>
            <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: "3px" }}>
              {t("roles.note")}
            </Typography>
          </Box>
          {canCreate ? (
            <Box sx={{ display: "flex", gap: "8px" }}>
              <Button
                variant="outlined"
                startIcon={<IconRenderer name="content-copy" size={17} />}
                onClick={() => {
                  setForm({
                    name: t("dialogs.duplicate.copySuffix", { role: roleLabel(selected) }),
                    preset: selected,
                  });
                  createModal.open("duplicate");
                }}
              >
                {t("roles.duplicate", { role: roleLabel(selected) })}
              </Button>
              <Button
                variant="contained"
                startIcon={<IconRenderer name="add" size={17} />}
                onClick={() => {
                  setForm({ name: "", preset: "blank" });
                  createModal.open("create");
                }}
              >
                {t("roles.create")}
              </Button>
            </Box>
          ) : null}
        </Box>

        <RoleCards
          cards={cards}
          selected={selected}
          onSelect={(role) => {
            setRoleId(role);
            setQuery("");
          }}
          onViewMembers={setMembersRole}
          t={t}
        />
      </Card>

      <PermissionMatrix
        config={config}
        groups={visibleGroups}
        visible={visible}
        draft={draft}
        roleLabel={roleLabel(selected)}
        system={record?.system ?? true}
        locked={locked}
        note={
          locked
            ? t("matrix.ownerNote")
            : record?.system
              ? t("matrix.systemNote", { role: roleLabel(selected) })
              : ""
        }
        query={query}
        onQuery={setQuery}
        collapsed={collapsed}
        onToggleGroup={(key) => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))}
        onToggleCell={(resource, column, on) =>
          editRole((next) => {
            next.grants[resource] = applyToggle(
              next.grants[resource] ?? [],
              config.columns,
              column,
              on,
            );
          })
        }
        onToggleColumn={(column, on) =>
          editRole((next) => {
            for (const resource of visible) {
              next.grants[resource] = applyToggle(
                next.grants[resource] ?? [],
                config.columns,
                column,
                on,
              );
            }
          })
        }
        onCycleScope={(resource) =>
          editRole((next) => {
            const order = config.scopes;
            const at = order.indexOf(next.scope[resource] ?? "all");
            next.scope[resource] = order[(at + 1) % order.length] ?? "all";
          })
        }
        coverage={coverage}
        t={t}
      />

      <PermissionSummary
        roleLabel={roleLabel(selected)}
        stats={stats}
        restricted={restricted}
        custom={!!record && !record.system && canCreate}
        memberCount={memberCount(selected)}
        onDelete={() => {
          setTyped("");
          deleteModal.open();
        }}
        t={t}
      />

      {changes.length > 0 ? (
        <Box
          sx={{
            // Sticky, not fixed: the bar belongs to the content column, so it
            // never has to know how wide the side rail is.
            position: "sticky",
            bottom: 0,
            zIndex: (theme) => theme.zIndex.appBar,
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            p: "14px 28px",
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "var(--mui-palette-surface-menuShadow)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "11px",
              flex: 1,
              minWidth: 280,
              fontSize: 12.5,
              lineHeight: 1.5,
              color: "text.primary",
            }}
          >
            <IconRenderer
              name="warning"
              size={19}
              sx={{ flex: "none", color: "surface.warningFg" }}
            />
            <Box>
              {t("savebar.note", {
                changes: t(changes.length === 1 ? "savebar.change" : "savebar.changes", {
                  count: changes.length,
                }),
                role: roleLabel(selected),
                members: memberCount(selected),
              })}
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flex: "none" }}>
            <Button
              variant="outlined"
              onClick={() => setDrafts((prev) => ({ ...prev, [selected]: cloneDraft(base) }))}
            >
              {t("savebar.discard")}
            </Button>
            <Button variant="contained" onClick={() => saveModal.open()}>
              {t("savebar.review")}
            </Button>
          </Box>
        </Box>
      ) : null}

      <MembersSheet
        open={!!membersRole}
        onClose={() => setMembersRole(null)}
        roleLabel={membersRole ? roleLabel(membersRole) : ""}
        holders={membersRole ? holders[membersRole] : undefined}
        membersLink={config.membersLink}
        t={t}
      />

      <SaveDialog
        open={saveModal.isOpen}
        onClose={saveModal.close}
        onConfirm={save}
        changes={changes}
        roleLabel={roleLabel(selected)}
        memberCount={memberCount(selected)}
        busy={busy}
        t={t}
      />

      <RoleFormDialog
        open={createModal.isOpen}
        mode={createModal.data === "duplicate" ? "duplicate" : "create"}
        sourceLabel={roleLabel(selected)}
        value={form}
        onChange={setForm}
        presets={presets}
        nameTaken={nameTaken}
        onClose={createModal.close}
        onConfirm={createRole}
        busy={busy}
        t={t}
      />

      <DeleteRoleDialog
        open={deleteModal.isOpen}
        roleLabel={roleLabel(selected)}
        reassignLabel={roleLabel(config.reassignTo)}
        memberCount={memberCount(selected)}
        typed={typed}
        onTyped={setTyped}
        onClose={deleteModal.close}
        onConfirm={removeRole}
        busy={busy}
        t={t}
      />
    </Box>
  );
}
