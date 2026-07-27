"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, usePortalRouter, useTranslation } from "@recruit/sdk";
import {
  ClientCard,
  type ClientCardData,
  type ClientCardLabels,
  ClientCardSkeleton,
  IconRenderer,
  Modal,
  SearchField,
  StatCardRenderer,
  useFilters,
  useModal,
  useToast,
} from "@recruit/shared";
import { useEffect, useMemo, useState } from "react";
import type { ClientsConfiguration } from "./clients.configuration";

export function ClientsComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<ClientsConfiguration>(id);
  const router = usePortalRouter();
  const { show } = useToast();
  const { filters, setFilter, clearFilter } = useFilters();
  const del = useModal<ClientCardData>();

  const pageSize = config?.pageSize ?? 6;
  const status = (filters.status as string) ?? "all";
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState((filters.search as string) ?? "");

  // biome-ignore lint/correctness/useExhaustiveDependencies: debounce must fire only when the typed value changes, not on every useFilters identity churn.
  useEffect(() => {
    const handle = setTimeout(() => {
      if (search) setFilter("search", search);
      else clearFilter("search");
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [search]);

  const query = useMemo(() => ({ ...filters, page, pageSize }), [filters, page, pageSize]);
  const { data, totalCount, isLoading, mutation, mutate } = useFetch<ClientCardData[]>(id, {
    filters: query,
  });
  const clients = data ?? [];
  const total = totalCount ?? clients.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pickTab = (value: string) => {
    if (value === "all") clearFilter("status");
    else setFilter("status", value);
    setPage(1);
  };

  const labels = useMemo<ClientCardLabels>(
    () => ({
      requirements: t("card.requirements"),
      candidates: t("card.candidates"),
      placements: t("card.placements"),
      status: { hiring: t("status.hiring"), paused: t("status.paused") },
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
      delete: t("card.delete"),
    }),
    [t],
  );

  const openDetail = (c: ClientCardData) => router.push(config.detailRouteId, { id: c.id });
  const openEdit = (c: ClientCardData) => router.push(config.editRouteId, { id: c.id });

  const confirmDelete = async () => {
    const client = del.data;
    if (!client) return;
    const mut = mutation as { remove?: (id?: string) => Promise<unknown> };
    await mut.remove?.(client.id);
    await mutate();
    del.close();
    show(t("toast.deleted", { name: client.name }));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder={t("searchPlaceholder")}
            width={280}
          />
          <Box
            sx={{
              display: "flex",
              bgcolor: "surface.paper",
              border: "1px solid",
              borderColor: "surface.controlBorder",
              borderRadius: "999px",
              p: "4px",
            }}
          >
            {config.tabs.map((tab) => {
              const selected = status === tab.value;
              return (
                <Box
                  key={tab.value}
                  onClick={() => pickTab(tab.value)}
                  sx={{
                    px: "14px",
                    py: "7px",
                    borderRadius: "999px",
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    color: selected ? "text.primary" : "text.secondary",
                    bgcolor: selected ? "surface.hover" : "transparent",
                  }}
                >
                  {t(tab.label)}
                </Box>
              );
            })}
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: "8px" }}>
          <Button
            variant="outlined"
            startIcon={<IconRenderer name="download" size={16} />}
            onClick={() => show(t("toast.exportSoon"))}
          >
            {t("export")}
          </Button>
          <Button variant="contained" onClick={() => router.push(config.newRouteId)}>
            {t("addClient")}
          </Button>
        </Box>
      </Box>

      {/* Summary stats */}
      <StatCardRenderer id={config.statsComponentId} />

      {/* Card grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
          gap: "14px",
        }}
      >
        {isLoading
          ? Array.from({ length: pageSize }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length skeleton row
              <ClientCardSkeleton key={i} />
            ))
          : clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                labels={labels}
                onOpen={openDetail}
                onEdit={openEdit}
                onAddRole={() => router.push(config.addRoleRouteId)}
                onContacts={() => router.push(config.contactsRouteId)}
                onDelete={(c) => del.open(c)}
              />
            ))}
      </Box>

      {!isLoading && clients.length === 0 ? (
        <Typography sx={{ fontSize: 13, color: "text.secondary", textAlign: "center", py: "40px" }}>
          {t("empty")}
        </Typography>
      ) : null}

      {/* Pagination */}
      {total > pageSize ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 12,
            color: "text.disabled",
          }}
        >
          <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
            {t("pageInfo", { count: clients.length, total, page, pages: totalPages })}
          </Typography>
          <Box sx={{ display: "flex", gap: "6px" }}>
            <IconButton
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              sx={{ width: 28, height: 28, border: "1px solid", borderColor: "surface.border" }}
            >
              <IconRenderer name="chevron-left" size={14} />
            </IconButton>
            <IconButton
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              sx={{ width: 28, height: 28, border: "1px solid", borderColor: "surface.border" }}
            >
              <IconRenderer name="chevron-right" size={14} />
            </IconButton>
          </Box>
        </Box>
      ) : null}

      {/* Delete confirm */}
      <Modal
        open={del.isOpen}
        onClose={del.close}
        title={t("deleteTitle")}
        description={t("deleteBody", { name: del.data?.name ?? "" })}
        footer={
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "8px", mt: "20px" }}>
            <Button variant="outlined" onClick={del.close}>
              {t("cancel")}
            </Button>
            <Button variant="contained" color="error" onClick={confirmDelete}>
              {t("confirmDelete")}
            </Button>
          </Box>
        }
      />
    </Box>
  );
}
