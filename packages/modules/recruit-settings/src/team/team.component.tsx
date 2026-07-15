"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import {
  useAccess,
  useConfiguration,
  useFetch,
  useTranslation,
} from "@recruit/sdk";
import {
  type ActionHandler,
  FormModal,
  type FormValues,
  IconRenderer,
  Modal,
  TableRenderer,
  type TableRendererConfig,
  Toast,
  useModal,
  useToast,
} from "@recruit/shared";
import { useMemo } from "react";
import type { TeamConfiguration } from "./team.configuration";

type TeamConfig = typeof TeamConfiguration;

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  lastActive: string;
}

export function TeamComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<TeamConfig>(id);
  const { context } = useAccess();
  const currentUserId = context?.attributes.userId as string | undefined;
  const { data, mutation, mutate } = useFetch<Member[]>(id);
  const members = data ?? [];

  const inviteModal = useModal();
  const deactivateModal = useModal<Member>();
  const { toast, show, clear } = useToast();

  const roles = config.roles ?? [];
  const roleLabelOf = (value: string) =>
    roles.find((r) => r.value === value)?.label ?? value;

  const you = t("you");
  const rows = useMemo<Record<string, unknown>[] | undefined>(
    () =>
      data?.map((member) => ({
        ...member,
        displayName:
          member.id === currentUserId ? `${member.name} ${you}` : member.name,
      })),
    [data, currentUserId, you],
  );

  const tableConfig = useMemo<TableRendererConfig>(
    () => ({
      ...config.table,
      columns: config.table.columns.map((column) =>
        column.value.type === "status" && "labels" in column.value
          ? {
              ...column,
              value: {
                ...column.value,
                labels: Object.fromEntries(
                  Object.entries(column.value.labels ?? {}).map(([k, v]) => [
                    k,
                    t(v),
                  ]),
                ),
              },
            }
          : column,
      ),
    }),
    [config.table, t],
  );

  const inviteSchema = useMemo(() => {
    const schema = config.inviteForm;
    if (!schema) return undefined;
    const role = schema.properties.role;
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
  }, [config.inviteForm, t]);

  const invite = async (values: FormValues) => {
    await mutation.create?.(values);
    await mutate();
    show(t("toast.inviteSent"), String(values.email ?? ""));
  };

  const actionHandler: ActionHandler = {
    changeRole: async (row) => {
      const nextRole = String(row.role);
      await mutation.update?.({ id: row.id, role: nextRole });
      await mutate();
      show(
        t("toast.roleChanged"),
        `${String(row.name)} · ${t(roleLabelOf(nextRole))}`,
      );
    },
    resendInvite: (row) => show(t("toast.inviteResent"), String(row.email)),
    deactivate: (row) => deactivateModal.open(row as unknown as Member),
  };

  const confirmDeactivate = async (member?: Member) => {
    deactivateModal.close();
    if (!member) return;
    await mutation.deactivate?.(member.id);
    await mutate();
    show(t("toast.deactivated"), member.name);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
            {t("members.title")}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.secondary", mt: "2px" }}>
            {t("seatInfo", {
              count: members.length,
              limit: config.seatLimit ?? 5,
            })}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<IconRenderer name="person-add" size={16} />}
          onClick={() => inviteModal.open()}
        >
          {t("inviteMember")}
        </Button>
      </Box>

      {/* ponytail: the design's "Client access" column is omitted — the user
          model carries no client-access data yet; add the column once it does. */}
      <TableRenderer
        id={id}
        config={tableConfig}
        data={rows}
        actionHandler={actionHandler}
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

      <Modal
        open={deactivateModal.isOpen}
        onClose={deactivateModal.close}
        width={380}
        title={t("deactivateModal.title", {
          name: deactivateModal.data?.name ?? "",
        })}
        description={t("deactivateModal.description")}
        footer={
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              mt: "18px",
            }}
          >
            <Button variant="outlined" onClick={deactivateModal.close}>
              {t("cancel")}
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => confirmDeactivate(deactivateModal.data)}
            >
              {t("deactivateModal.confirm")}
            </Button>
          </Box>
        }
      />

      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
