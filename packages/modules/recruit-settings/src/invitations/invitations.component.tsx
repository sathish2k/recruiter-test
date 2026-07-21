"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useRefresh, useTranslation } from "@recruit/sdk";
import {
  type TableFilterExportConfig,
  TableFilterExportRenderer,
  Toast,
  useToast,
} from "@recruit/shared";
import { useMemo } from "react";

interface Invitation {
  id: string;
  email: string;
}

export function SettingsInvitationsComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<TableFilterExportConfig>(id);
  const { data, mutation } = useFetch<Invitation[]>(id);
  const refresh = useRefresh(id);
  const { toast, show, clear } = useToast();

  // Status-cell labels are translation keys — resolve them before rendering.
  const tableConfig = useMemo<TableFilterExportConfig>(
    () => ({
      ...config,
      columns: (config.columns ?? []).map((column) =>
        column.value.type === "status" && "labels" in column.value
          ? {
              ...column,
              value: {
                ...column.value,
                labels: Object.fromEntries(
                  Object.entries(column.value.labels ?? {}).map(([k, v]) => [k, t(v)]),
                ),
              },
            }
          : column,
      ),
    }),
    [config, t],
  );

  // The design only surfaces this card when something is outstanding.
  if (!data || data.length === 0) return null;

  const resend = async (row: Invitation) => {
    await mutation.resend?.(row.id);
    await refresh();
    show(t("toast.resent"));
  };

  const cancel = async (row: Invitation) => {
    await mutation.delete?.(row.id);
    await refresh();
    show(t("toast.cancelled"));
  };

  return (
    <Box sx={{ maxWidth: 1040, display: "flex", flexDirection: "column", gap: "12px" }}>
      <Box>
        <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>{t("title")}</Typography>
        <Typography sx={{ fontSize: 11.5, color: "text.disabled", mt: "2px" }}>
          {t("subtitle")}
        </Typography>
      </Box>
      <TableFilterExportRenderer
        id={id}
        config={tableConfig}
        actionHandler={{
          resend: (row) => resend(row as unknown as Invitation),
          cancel: (row) => cancel(row as unknown as Invitation),
        }}
      />
      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
