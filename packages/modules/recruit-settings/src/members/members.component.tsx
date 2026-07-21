"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useRefresh, useTranslation } from "@recruit/sdk";
import {
  FormModal,
  type FormValues,
  type TableFilterExportConfig,
  TableFilterExportRenderer,
  Toast,
  useFilters,
  useModal,
  useToast,
} from "@recruit/shared";
import { useMemo } from "react";
import type { MembersConfiguration } from "./members.configuration";

type MembersConfig = typeof MembersConfiguration;

interface Member {
  id: string;
  displayName: string;
  email: string;
  role: string;
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
    return {
      ...schema,
      properties: {
        ...schema.properties,
        role: {
          ...role,
          enumNames: (role?.enum ?? []).map((v) => t(`roles.${String(v)}`)),
        },
      },
    };
  }, [config.addForm, t]);

  const invite = async (values: FormValues) => {
    await mutation.create?.(values);
    await refresh();
    show(t("toast.invited"), t("toast.invitedSub", { email: String(values.email ?? "") }));
  };

  const changeRole = async (row: Member) => {
    await mutation.update?.({ id: row.id, role: row.role });
    await refresh();
    show(t("toast.roleChanged"));
  };

  const deactivate = async (row: Member) => {
    await mutation.deactivate?.(row.id);
    await refresh();
    show(t("toast.deactivated"));
  };

  return (
    <Box sx={{ maxWidth: 1040, display: "flex", flexDirection: "column", gap: "12px" }}>
      <Box>
        <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>{t("title")}</Typography>
        <Typography sx={{ fontSize: 11.5, color: "text.disabled", mt: "2px" }}>
          {t("seats", { used: total, total: config.seatLimit })}
        </Typography>
      </Box>

      <TableFilterExportRenderer
        id={id}
        config={tableConfig}
        onCta={(action) => {
          if (action === "add") inviteModal.open();
        }}
        actionHandler={{
          changeRole: (row) => changeRole(row as unknown as Member),
          deactivate: (row) => deactivate(row as unknown as Member),
          resendInvite: () => show(t("toast.invited")),
        }}
      />

      {inviteSchema ? (
        <FormModal
          open={inviteModal.isOpen}
          onClose={inviteModal.close}
          id={id}
          title={t("inviteForm.title")}
          description={t("inviteForm.description")}
          schema={inviteSchema}
          submitLabel="inviteForm.submit"
          cancelLabel="cancel"
          onSubmit={invite}
        />
      ) : null}

      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
