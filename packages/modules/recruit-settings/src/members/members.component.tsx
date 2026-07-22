"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useRefresh, useTranslation } from "@recruit/sdk";
import {
  FormModal,
  type FormValues,
  IconRenderer,
  type TableFilterExportConfig,
  TableFilterExportRenderer,
  Toast,
  useFilters,
  useModal,
  useToast,
} from "@recruit/shared";
import { useMemo } from "react";
import { ClientAccessCell, LastActiveCell, MfaCell } from "./members.cells";
import type { MembersConfiguration } from "./members.configuration";

type MembersConfig = typeof MembersConfiguration;

interface Member {
  id: string;
  displayName: string;
  email: string;
  role: string;
  status: string;
}

export function SettingsMembersComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<MembersConfig>(id);
  const { filters } = useFilters();
  const inviteModal = useModal();
  const { toast, show, clear } = useToast();
  const { meta, mutation } = useFetch<Member[]>(id, { filters });
  // Inviting writes to the sibling pending-invitations element (page config id).
  const refresh = useRefresh(id, "settings-invitations");

  const total = (meta?.totalCount as number) ?? 0;
  // Seat meter reads the plan's real allowance from the fetch meta; the old
  // hardcoded `config.seatLimit` is only a fallback for a cold cache.
  const seats = {
    used: (meta?.seatUsed as number) ?? total,
    total: (meta?.seatTotal as number) ?? config.seatLimit,
    percent: (meta?.seatPercent as number) ?? 0,
    full: (meta?.seatFull as boolean) ?? false,
  };

  // Status labels are translated here; the role cell resolves its own option
  // labels via useTranslation(<element id>), so bind it to this element's id.
  const tableConfig = useMemo<TableFilterExportConfig>(
    () => ({
      ...config,
      columns: (config.columns ?? []).map((column) => {
        if (column.value.type === "status" && "labels" in column.value) {
          return {
            ...column,
            value: {
              ...column.value,
              labels: Object.fromEntries(
                Object.entries(column.value.labels ?? {}).map(([k, v]) => [k, t(v)]),
              ),
            },
          };
        }
        if (column.value.type === "role") {
          return { ...column, value: { ...column.value, id } };
        }
        return column;
      }),
    }),
    [config, t, id],
  );

  const inviteSchema = useMemo(() => {
    const schema = config.addForm;
    if (!schema) return undefined;
    const role = schema.properties?.role;
    const clientAccess = schema.properties?.clientAccess;
    return {
      ...schema,
      properties: {
        ...schema.properties,
        role: {
          ...role,
          enumNames: (role?.enum ?? []).map((v) => t(`roles.${String(v)}`)),
        },
        clientAccess: {
          ...clientAccess,
          enumNames: (clientAccess?.enum ?? []).map((v) =>
            t(`inviteForm.clientAccessOptions.${String(v)}`),
          ),
        },
      },
    };
  }, [config.addForm, t]);

  const invite = async (values: FormValues) => {
    // One email per line in the design's textarea — commas and semicolons are
    // tolerated too, since people paste lists.
    const emails = String(values.emails ?? "")
      .split(/[\s,;]+/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.includes("@"));
    if (!emails.length) return;

    const role = String(values.role ?? "");
    const access = String(values.clientAccess ?? "");
    const result = (await mutation.create?.({ emails, role, clientAccess: access })) as
      | { data?: unknown[]; meta?: { skipped?: string[] } }
      | undefined;
    await refresh();

    const sent = result?.data?.length ?? emails.length;
    const skipped = result?.meta?.skipped?.length ?? 0;
    show(
      sent > 1 ? t("toast.invitedPlural") : t("toast.invited"),
      skipped
        ? t("toast.invitedSkipped", { skipped })
        : t("toast.invitedSub", {
            count: sent,
            role: t(`roles.${role}`),
            access: t(`inviteForm.clientAccessOptions.${access}`),
          }),
    );
  };

  const changeRole = async (row: Member) => {
    await mutation.update?.({ id: row.id, role: row.role });
    await refresh();
    show(t("toast.roleChanged"));
  };

  const suspend = async (row: Member) => {
    const next = row.status !== "suspended";
    await mutation.suspend?.({ id: row.id, suspended: next });
    await refresh();
    show(next ? t("toast.suspended") : t("toast.restored"));
  };

  const removeMember = async (row: Member) => {
    await mutation.remove?.(row.id);
    await refresh();
    show(t("toast.removed"));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <TableFilterExportRenderer
        id={id}
        config={tableConfig}
        headerExtra={
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mt: "7px" }}>
            <Typography sx={{ fontSize: 11.5, color: "text.disabled", whiteSpace: "nowrap" }}>
              {t("seats", { used: seats.used, total: seats.total })}
            </Typography>
            <Box
              sx={{
                width: 110,
                height: 6,
                borderRadius: "999px",
                bgcolor: "surface.inset",
                overflow: "hidden",
                flex: "none",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${seats.percent}%`,
                  borderRadius: "999px",
                  background: (theme) => theme.gradients.meter,
                }}
              />
            </Box>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: "text.secondary" }}>
              {seats.percent}%
            </Typography>
          </Box>
        }
        headerAction={
          <Button
            variant="contained"
            onClick={() => inviteModal.open()}
            startIcon={<IconRenderer name={seats.full ? "rocket" : "person-add"} size={15} />}
            sx={{ flex: "none" }}
          >
            {seats.full ? t("actions.upgrade") : t("actions.invite")}
          </Button>
        }
        onCta={(action) => {
          if (action === "add") inviteModal.open();
        }}
        cells={{
          clientAccess: (row) =>
            ClientAccessCell(row, t, (member) =>
              show(t("toast.accessSoon"), String(member.displayName ?? "")),
            ),
          mfa: (row) => MfaCell(row, t),
          lastActive: (row) => LastActiveCell(row),
        }}
        actionHandler={{
          changeRole: (row) => changeRole(row as unknown as Member),
          suspend: (row) => suspend(row as unknown as Member),
          remove: (row) => removeMember(row as unknown as Member),
          resendInvite: () => show(t("toast.invited")),
          viewProfile: () => show(t("toast.profileSoon")),
          resetPassword: () => show(t("toast.resetSent")),
        }}
      />

      {inviteSchema ? (
        <FormModal
          open={inviteModal.isOpen}
          onClose={inviteModal.close}
          id={id}
          width={400}
          title={t("inviteForm.title")}
          description={t("inviteForm.description")}
          schema={inviteSchema}
          gridContainer={{ spacing: 1.25 }}
          submitLabel="inviteForm.submit"
          cancelLabel="cancel"
          onSubmit={invite}
        />
      ) : null}

      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
