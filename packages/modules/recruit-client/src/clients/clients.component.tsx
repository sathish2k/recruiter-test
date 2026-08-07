"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import {
  useConfiguration,
  useFetch,
  usePortalRouter,
  useRefresh,
  useTranslation,
} from "@recruit/sdk";
import {
  ClientCard,
  type ClientCardData,
  type ClientCardLabels,
  ClientCardSkeleton,
  Modal,
  TableFilterExportRenderer,
  useModal,
  useToast,
} from "@recruit/shared";
import { useMemo } from "react";
import type { ClientsConfiguration } from "./clients.configuration";

/**
 * The clients screen: summary stats over a card grid. The toolbar (search,
 * status tabs, health filter, export menu, Add-client CTA) and the pager come
 * from `TableFilterExportRenderer` — the cards are just its item renderer, so
 * this screen and the table screens share one filter/paging implementation.
 */
export function ClientsComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<ClientsConfiguration>(id);
  const router = usePortalRouter();
  const { show } = useToast();
  const refresh = useRefresh(id);
  const del = useModal<ClientCardData>();
  // Seeded with [] so this never fetches — it is here only for the datasource
  // mutations; the rows themselves are fetched inside the collection renderer.
  const { mutation } = useFetch<ClientCardData[]>(id, { data: [] });

  const labels = useMemo<ClientCardLabels>(
    () => ({
      requirements: t("card.requirements"),
      candidates: t("card.candidates"),
      placements: t("card.placements"),
      candidateFlow: t("card.candidateFlow"),
      inPipeline: t("card.inPipeline"),
      lastActivity: t("card.lastActivity"),
      flow: {
        sourced: t("card.flow.sourced"),
        screening: t("card.flow.screening"),
        interviewing: t("card.flow.interviewing"),
      },
      status: {
        hiring: t("status.hiring"),
        active: t("status.active"),
        prospect: t("status.prospect"),
        paused: t("status.paused"),
        inactive: t("status.inactive"),
        blacklisted: t("status.blacklisted"),
      },
      health: {
        healthy: t("health.healthy"),
        attention: t("health.attention"),
        at_risk: t("health.at_risk"),
        dormant: t("health.dormant"),
      },
      open: t("card.open"),
      addRole: t("card.addRole"),
      contacts: t("card.contacts"),
      more: t("card.more"),
      edit: t("card.edit"),
      archive: t("card.archive"),
    }),
    [t],
  );

  const confirmArchive = async () => {
    const client = del.data;
    if (!client) return;
    const mut = mutation as { archive?: (id?: string) => Promise<unknown> };
    await mut.archive?.(client.id);
    await refresh();
    del.close();
    show(t("toast.archived", { name: client.name }));
  };

  if (!config) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <TableFilterExportRenderer
        id={id}
        config={config.table}
        itemMinWidth={config.cardMinWidth}
        renderSkeleton={() => <ClientCardSkeleton />}
        renderItem={(row) => {
          const client = row as unknown as ClientCardData;
          return (
            <ClientCard
              key={client.id}
              client={client}
              labels={labels}
              onOpen={(c) => router.push(config.detailRouteId, { id: c.id })}
              onEdit={(c) => router.push(config.editRouteId, { id: c.id })}
              onAddRole={() => router.push(config.addRoleRouteId)}
              onContacts={() => router.push(config.contactsRouteId)}
              onArchive={(c) => del.open(c)}
            />
          );
        }}
      />

      <Modal
        open={del.isOpen}
        onClose={del.close}
        title={t("archive.title")}
        footer={
          <>
            <Button variant="outlined" onClick={del.close}>
              {t("archive.cancel")}
            </Button>
            <Button variant="contained" color="warning" onClick={confirmArchive}>
              {t("archive.confirm")}
            </Button>
          </>
        }
      >
        <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
          {t("archive.body", { name: del.data?.name ?? "" })}
        </Typography>
      </Modal>
    </Box>
  );
}
