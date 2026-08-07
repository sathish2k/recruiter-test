"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { useAccess, useConfiguration, useFetch, useRefresh, useTranslation } from "@recruit/sdk";
import {
  ConfirmModal,
  IconRenderer,
  type TableFilterExportConfig,
  TableFilterExportRenderer,
  useToast,
} from "@recruit/shared";
import { useState } from "react";
import { ExpiryCell } from "./invitations.cells";

interface Invitation extends Record<string, unknown> {
  id: string;
  email: string;
}

const INVITE_TTL_DAYS = 7;

export function SettingsInvitationsComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<TableFilterExportConfig>(id);
  const { can } = useAccess();
  const { data, mutation } = useFetch<Invitation[]>(id);
  const refresh = useRefresh(id);
  const { show } = useToast();
  const [cancelling, setCancelling] = useState<Invitation | null>(null);

  const canManage = can({ resource: "members", action: ["invite"] });
  const pending = data ?? [];

  const resend = async (row: Invitation) => {
    await mutation.resend?.(row.id);
    await refresh();
    show(t("toast.resent"), t("toast.resentSub", { email: row.email, days: INVITE_TTL_DAYS }));
  };

  const cancel = async () => {
    if (!cancelling) return;
    await mutation.delete?.(cancelling.id);
    await refresh();
    show(t("toast.cancelled"), t("toast.cancelledSub", { email: cancelling.email }));
    setCancelling(null);
  };

  // Nothing outstanding is itself worth saying — the design keeps the card and
  // reports the quiet state rather than dropping it out of the page.
  if (!pending.length) {
    return (
      <Card variant="base" sx={{ p: "22px 24px" }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{t("title")}</Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            pt: "18px",
            pb: "26px",
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "surface.successSoftBg",
              color: "surface.successFg",
            }}
          >
            <IconRenderer name="mark-email-read" size={26} color="inherit" />
          </Box>
          <Typography sx={{ fontSize: 15, fontWeight: 700, mt: "14px" }}>
            {t("emptyState.title")}
          </Typography>
          <Typography
            sx={{
              fontSize: 12.5,
              lineHeight: 1.65,
              color: "text.disabled",
              mt: "6px",
              maxWidth: "42ch",
            }}
          >
            {t("emptyState.description")}
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <TableFilterExportRenderer
        id={id}
        config={{
          ...config,
          // Read-only viewers see who is outstanding, not the levers.
          actions: canManage ? config.actions : [],
        }}
        cells={{ expiry: (row) => ExpiryCell(row, t) }}
        actionHandler={{
          resend: (row) => resend(row as unknown as Invitation),
          cancel: (row) => setCancelling(row as unknown as Invitation),
        }}
      />

      {cancelling ? (
        <ConfirmModal
          open
          onClose={() => setCancelling(null)}
          onConfirm={cancel}
          icon="delete"
          tone="error"
          danger
          title={t("cancelInvite.title")}
          description={t("cancelInvite.description", { email: cancelling.email })}
          points={[
            { icon: "link-off", tone: "error", text: t("cancelInvite.points.link") },
            { icon: "person-add", tone: "primary", text: t("cancelInvite.points.again") },
          ]}
          confirmLabel={t("cancelInvite.submit")}
          cancelLabel={t("cancelInvite.keep")}
        />
      ) : null}
    </Box>
  );
}
