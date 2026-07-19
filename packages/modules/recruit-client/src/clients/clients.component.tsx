"use client";

import AddRounded from "@mui/icons-material/AddRounded";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import {
  ClientCard,
  type ClientCardConfig,
  type ClientCardData,
  type EmptyStateConfig,
  EmptyStateRenderer,
  type FilterConfig,
  Filters,
  FormModal,
  type FormValues,
  type JsonSchema,
  StatCardRenderer,
  type StatCardRendererConfig,
  Toast,
  useFilters,
  useModal,
  useToast,
} from "@recruit/shared";

interface ClientsConfig {
  filters?: FilterConfig[];
  stats?: StatCardRendererConfig[];
  card?: ClientCardConfig;
  addForm?: JsonSchema;
  emptyState?: EmptyStateConfig;
}

export function ClientsComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<ClientsConfig>(id);
  const { filters } = useFilters();
  const addModal = useModal();
  const { toast, show, clear } = useToast();

  const { data, meta, mutation, mutate } = useFetch<ClientCardData[]>(id, {
    filters,
  });
  const clients = data ?? [];
  const counts = (meta?.counts ?? {}) as Record<string, number>;
  const summary = (meta?.summary ?? {}) as Record<string, number>;

  const createClient = async (values: FormValues) => {
    await mutation.create?.(values);
    await mutate();
    show(
      t("toast.created"),
      t("toast.createdSub", { name: String(values.name ?? "") }),
    );
  };

  const filterOptions: FilterConfig[] = (config.filters ?? []).map((f) => {
    if ("options" in f) {
      return {
        ...f,
        options: f.options.map((o) => ({
          ...o,
          label: t(o.label),
          count: f.key === "status" ? counts[o.value] : o.count,
        })),
      };
    }
    if (f.type === "search") {
      return {
        ...f,
        placeholder: f.placeholder ? t(f.placeholder) : undefined,
      };
    }
    return f;
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <Filters options={filterOptions} />
        <Box sx={{ display: "flex", gap: "8px" }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadOutlined sx={{ fontSize: 18 }} />}
            sx={{ fontWeight: 400 }}
          >
            {t("export")}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRounded sx={{ fontSize: 18 }} />}
            onClick={() => addModal.open()}
          >
            {t("addClient")}
          </Button>
        </Box>
      </Box>

      {config.addForm ? (
        <FormModal
          open={addModal.isOpen}
          onClose={addModal.close}
          id={id}
          title={t("addForm.title")}
          description={t("addForm.description")}
          schema={config.addForm}
          submitLabel="addForm.submit"
          cancelLabel="cancel"
          onSubmit={createClient}
        />
      ) : null}

      <StatCardRenderer id={id} config={config.stats} data={summary} />

      {clients.length === 0 && !hasActiveFilter && config.emptyState ? (
        <Card variant="base">
          <EmptyStateRenderer
            config={config.emptyState}
            t={t}
            onAction={(action) => {
              if (action === "add") addModal.open();
            }}
          />
        </Card>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "14px",
          }}
        >
          {clients.map((client, i) => (
            <ClientCard
              key={client.id}
              id={id}
              client={client}
              index={i}
              config={config.card}
            />
          ))}
        </Box>
      )}

      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
