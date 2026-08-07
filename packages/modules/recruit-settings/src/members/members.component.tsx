"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { useAccess, useConfiguration, useFetch, useRefresh, useTranslation } from "@recruit/sdk";
import {
  ConfirmModal,
  type ConfirmPoint,
  type FilterConfig,
  FormModal,
  type FormValues,
  IconRenderer,
  TableFilterExportRenderer,
  useFilters,
  useModal,
  useToast,
} from "@recruit/shared";
import { useCallback, useMemo, useState } from "react";
import { Meter } from "../ui";
import { LastActiveCell, MemberCell } from "./members.cells";
import type { MembersConfig } from "./members.configuration";

interface Member extends Record<string, unknown> {
  id: string;
  displayName: string;
  email: string;
  role: string;
  team: string;
  status: string;
  isCurrentUser: boolean;
  isOwner: boolean;
  isInactive: boolean;
}

/** The confirmations this screen can raise, each a different consequence. */
type Confirm = "deactivate" | "activate" | "resetPassword" | "bulkDeactivate";

const INVITE_TTL_DAYS = 7;

export function SettingsMembersComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<MembersConfig>(id);
  const { filters } = useFilters();
  const { can } = useAccess();
  const inviteModal = useModal();
  const { show } = useToast();
  const { meta, mutation } = useFetch<Member[]>(id, { filters });
  // Inviting writes to the sibling pending-invitations element (page config id).
  const refresh = useRefresh(id, "settings-invitations");

  const [editing, setEditing] = useState<Member | null>(null);
  const [confirm, setConfirm] = useState<{ kind: Confirm; rows: Member[] } | null>(null);
  const [busy, setBusy] = useState(false);

  // Managing people is a permission, not a role — the banner and every gated
  // control read the same two rules.
  const canManage = can({ resource: "members", action: ["manage"] });
  const canInvite = can({ resource: "members", action: ["invite"] });
  const canGrantKeys = can({ resource: "roles", action: ["manage"] });

  const seats = {
    used: (meta?.seatUsed as number) ?? 0,
    total: (meta?.seatTotal as number) ?? config.seatLimit,
    percent: (meta?.seatPercent as number) ?? 0,
    full: (meta?.seatFull as boolean) ?? false,
  };
  const statusCounts = (meta?.statusCounts as Record<string, number>) ?? {};
  const teams = (meta?.teams as string[]) ?? [];
  const inactiveCount = (meta?.inactiveCount as number) ?? 0;

  // Two things the config can't know: how many rows sit behind each status
  // segment, and which desks this workspace actually uses.
  const tableConfig = useMemo(() => {
    const withOptions = (config.filters ?? []).map((filter): FilterConfig => {
      if (filter.key === "status" && filter.type === "segmented") {
        return {
          ...filter,
          options: filter.options.map((option) => ({
            ...option,
            count: option.value ? (statusCounts[option.value] ?? 0) : (statusCounts.all ?? 0),
          })),
        };
      }
      if (filter.key === "team" && filter.type === "select") {
        return { ...filter, options: teams.map((team) => ({ value: team, label: team })) };
      }
      return filter;
    });
    return { ...config, filters: withOptions };
  }, [config, statusCounts, teams]);

  /** Owner and admin are the workspace's keys — only someone who can manage
   * roles hands them out, and the picker says so rather than hiding them. */
  const roleForm = useCallback(
    (schema: MembersConfig["addForm"]) => {
      if (!schema) return undefined;
      const role = schema.properties?.role;
      if (!role || canGrantKeys) return schema;
      return {
        ...schema,
        properties: {
          ...schema.properties,
          role: {
            ...role,
            optionLocked: Object.fromEntries(
              config.ownerOnlyRoles.map((value) => [value, "roleLockedHint"]),
            ),
          },
        },
      };
    },
    [canGrantKeys, config.ownerOnlyRoles],
  );

  const inviteSchema = useMemo(() => roleForm(config.addForm), [config.addForm, roleForm]);
  const editSchema = useMemo(() => roleForm(config.editForm), [config.editForm, roleForm]);

  const invite = async (values: FormValues) => {
    const email = String(values.email ?? "").trim();
    const role = String(values.role ?? "");
    if (!email) return;
    await mutation.create?.({ emails: [email], role });
    await refresh();
    show(t("toast.invited"), t("toast.invitedSub", { email, days: INVITE_TTL_DAYS }));
  };

  const saveEdit = async (values: FormValues) => {
    if (!editing) return;
    await mutation.update?.({
      id: editing.id,
      name: String(values.displayName ?? "").trim(),
      role: String(values.role ?? ""),
      team: String(values.team ?? "").trim(),
    });
    await refresh();
    setEditing(null);
    show(t("toast.updated"), t("toast.updatedSub", { name: values.displayName }));
  };

  const runConfirm = async () => {
    if (!confirm) return;
    const { kind, rows } = confirm;
    setBusy(true);
    try {
      if (kind === "resetPassword") {
        await mutation.resetPassword?.(rows[0]?.id);
        show(t("toast.resetSent"), t("toast.resetSentSub", { email: rows[0]?.email }));
      } else if (kind === "activate") {
        await mutation.activate?.(rows[0]?.id);
        show(t("toast.activated"), t("toast.activatedSub", { name: rows[0]?.displayName }));
      } else {
        // Bulk and single deactivation are the same call, run per member — the
        // API decides each one on its own (last owner, already off).
        await Promise.all(rows.map((row) => mutation.deactivate?.(row.id)));
        show(
          rows.length > 1
            ? t("toast.deactivatedPlural", { count: rows.length })
            : t("toast.deactivated"),
          t("toast.deactivatedSub", { count: rows.length }),
        );
      }
      await refresh();
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  /** Why this confirmation cannot be confirmed, if it can't. The API refuses
   * the same cases; saying so here means nobody clicks into an error. */
  const blockedReason = (() => {
    if (!confirm) return undefined;
    const { kind, rows } = confirm;
    if (kind === "activate" && seats.full) return t("blocked.noSeats", { total: seats.total });
    if (kind !== "deactivate" && kind !== "bulkDeactivate") return undefined;
    if (rows.some((row) => row.isCurrentUser)) return t("blocked.self");
    // Switching off every remaining owner would leave the workspace with
    // nobody who can manage billing or ownership.
    const owners = (meta?.roleCounts as Record<string, number> | undefined)?.owner ?? 0;
    const selectedOwners = rows.filter((row) => row.isOwner && !row.isInactive).length;
    if (selectedOwners > 0 && selectedOwners >= owners) return t("blocked.lastOwner");
    return undefined;
  })();

  const point = (icon: string, tone: ConfirmPoint["tone"], text: string): ConfirmPoint => ({
    icon,
    tone,
    text,
  });

  const dialog = (() => {
    if (!confirm) return null;
    const { kind, rows } = confirm;
    const target = rows[0];
    const count = rows.length;
    if (kind === "resetPassword") {
      return {
        icon: "lock-reset",
        tone: "warning" as const,
        title: t("resetPassword.title", { name: target?.displayName }),
        description: t("resetPassword.description"),
        confirmLabel: t("resetPassword.submit"),
        points: [
          point("mail", "info", t("resetPassword.points.link", { email: target?.email })),
          point("key-off", "warning", t("resetPassword.points.current")),
          point("shield", "primary", t("resetPassword.points.compromised")),
        ],
      };
    }
    if (kind === "activate") {
      return {
        icon: "person-check",
        tone: "success" as const,
        title: t("activate.title", { name: target?.displayName }),
        description: t("activate.description"),
        confirmLabel: t("activate.submit"),
        points: [
          point(
            "badge",
            "success",
            t("activate.points.role", { role: t(`roles.${target?.role}`) }),
          ),
          point("mail", "info", t("activate.points.email")),
          point("credit-card", "primary", t("activate.points.seat")),
        ],
      };
    }
    return {
      icon: "person-off",
      tone: "error" as const,
      danger: true,
      title:
        count > 1
          ? t("deactivate.titlePlural", { count })
          : t("deactivate.title", { name: target?.displayName }),
      description:
        count > 1 ? rows.map((row) => row.displayName).join(", ") : t("deactivate.description"),
      confirmLabel: count > 1 ? t("deactivate.submitPlural", { count }) : t("deactivate.submit"),
      points: [
        point("logout", "error", t("deactivate.points.sessions", { count })),
        point("inventory", "primary", t("deactivate.points.records")),
        point("undo", "success", t("deactivate.points.reversible")),
      ],
    };
  })();

  const openConfirm = (kind: Confirm) => (row: Record<string, unknown>) =>
    setConfirm({ kind, rows: [row as unknown as Member] });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {canManage ? null : (
        <Card
          role="status"
          variant="base"
          sx={{
            display: "flex",
            gap: "11px",
            p: "13px 16px",
            boxShadow: "none",
            bgcolor: "surface.warningSoftBg",
          }}
        >
          <Box sx={{ flex: "none", lineHeight: 1.3, color: "surface.warningFg" }}>
            <IconRenderer name="visibility" size={18} color="inherit" />
          </Box>
          <Typography sx={{ fontSize: 12.5, lineHeight: 1.6, color: "text.secondary" }}>
            {t("readOnly")}
          </Typography>
        </Card>
      )}

      <TableFilterExportRenderer
        id={id}
        config={tableConfig}
        headerExtra={
          <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", mt: "3px" }}>
            <Typography sx={{ fontSize: 12.5, color: "text.disabled" }}>
              {t("seatLine", { used: seats.used, total: seats.total })}
            </Typography>
            {seats.full ? (
              <Card
                role="status"
                variant="base"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  flexWrap: "wrap",
                  p: "14px 16px",
                  boxShadow: "none",
                  bgcolor: "surface.warningSoftBg",
                }}
              >
                <Box sx={{ flex: "none", lineHeight: 1.2, color: "surface.warningFg" }}>
                  <IconRenderer name="event-seat" size={20} color="inherit" />
                </Box>
                <Box sx={{ flex: 1, minWidth: 240 }}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>
                    {t("seatsFull.title", { total: seats.total })}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 12, lineHeight: 1.6, color: "text.secondary", mt: "2px" }}
                  >
                    {inactiveCount
                      ? t("seatsFull.withInactive", { count: inactiveCount })
                      : t("seatsFull.body")}
                  </Typography>
                </Box>
              </Card>
            ) : null}
            <Box sx={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <Box sx={{ flex: 1, maxWidth: 320 }}>
                <Meter percent={seats.percent} />
              </Box>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  fontVariantNumeric: "tabular-nums",
                  color: seats.full ? "surface.warningFg" : "text.secondary",
                }}
              >
                {t("seatsShort", { used: seats.used, total: seats.total })}
              </Typography>
            </Box>
          </Box>
        }
        headerAction={
          canInvite ? (
            <Button
              variant="contained"
              onClick={() => inviteModal.open()}
              startIcon={<IconRenderer name="person-add" size={15} />}
              sx={{ flex: "none" }}
            >
              {t("actions.invite")}
            </Button>
          ) : undefined
        }
        onCta={(action) => {
          if (action === "add") inviteModal.open();
        }}
        cells={{
          member: (row) => MemberCell(row, t),
          lastActive: (row) => LastActiveCell(row, t),
        }}
        actionHandler={{
          edit: (row) => setEditing(row as unknown as Member),
          deactivate: openConfirm("deactivate"),
          activate: openConfirm("activate"),
          resetPassword: openConfirm("resetPassword"),
          viewProfile: () => show(t("toast.profileSoon")),
        }}
        bulkHandler={{
          deactivate: (rows) =>
            setConfirm({ kind: "bulkDeactivate", rows: rows as unknown as Member[] }),
          export: (rows) => show(t("toast.exported", { count: rows.length })),
        }}
      />

      {inviteSchema ? (
        <FormModal
          open={inviteModal.isOpen}
          onClose={inviteModal.close}
          id={id}
          width={560}
          title={t("inviteForm.title")}
          description={t("inviteForm.description", { days: INVITE_TTL_DAYS })}
          schema={inviteSchema}
          submitLabel="inviteForm.submit"
          cancelLabel="cancel"
          onSubmit={invite}
        />
      ) : null}

      {editSchema && editing ? (
        <FormModal
          open
          onClose={() => setEditing(null)}
          id={id}
          width={560}
          title={t("editForm.title", { name: editing.displayName })}
          description={t("editForm.description")}
          schema={editSchema}
          defaultValues={{
            displayName: editing.displayName,
            email: editing.email,
            team: editing.team,
            role: editing.role,
          }}
          submitLabel="editForm.submit"
          cancelLabel="cancel"
          onSubmit={saveEdit}
        />
      ) : null}

      {dialog ? (
        <ConfirmModal
          open
          onClose={() => setConfirm(null)}
          onConfirm={runConfirm}
          busy={busy}
          icon={dialog.icon}
          tone={dialog.tone}
          danger={"danger" in dialog ? dialog.danger : undefined}
          title={dialog.title}
          description={dialog.description}
          points={dialog.points}
          blockedReason={blockedReason}
          confirmLabel={dialog.confirmLabel}
          cancelLabel={t("cancel")}
        />
      ) : null}
    </Box>
  );
}
