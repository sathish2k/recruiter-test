"use client";

import AddRounded from "@mui/icons-material/AddRounded";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import Box from "@mui/material/Box";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import {
  ClientCard,
  type ClientCardConfig,
  type ClientCardData,
  type FilterConfig,
  Filters,
  FormModal,
  type FormValues,
  type JsonSchema,
  StatCardRenderer,
  type StatCardRendererConfig,
  useFilters,
  useModal,
} from "@recruit/shared";

interface ClientsConfig {
  filters?: FilterConfig[];
  stats?: StatCardRendererConfig[];
  card?: ClientCardConfig;
  addForm?: JsonSchema;
}

export function ClientsComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<ClientsConfig>(id);
  const { filters } = useFilters();
  const addModal = useModal();

  // Filters go straight to the API — it filters + counts server-side (and
  // treats `status: "all"` / empty search as no filter).
  const { data, meta, mutation, mutate } = useFetch<ClientCardData[]>(id, {
    filters,
  });
  const clients = data ?? [];
  const counts = (meta?.counts ?? {}) as Record<string, number>;
  const summary = (meta?.summary ?? {}) as Record<string, number>;

  const createClient = async (values: FormValues) => {
    await mutation.create?.(values);
    await mutate();
  };

  // Resolve the config's translation keys + inject the backend status counts.
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
        <Filters options={filterOptions} />
        <Box sx={{ display: "flex", gap: "8px" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              px: "16px",
              py: "9px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,.14)",
              fontSize: 13,
              cursor: "pointer",
              "&:hover": { background: "rgba(255,255,255,.06)" },
            }}
          >
            <FileDownloadOutlined sx={{ fontSize: 18 }} />
            {t("export")}
          </Box>
          <Box
            onClick={() => addModal.open()}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              px: "16px",
              py: "9px",
              borderRadius: "999px",
              background: "linear-gradient(135deg,#FF8A3C,#E4560F)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              "&:hover": { filter: "brightness(1.08)" },
            }}
          >
            <AddRounded sx={{ fontSize: 18 }} />
            {t("addClient")}
          </Box>
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

      {/* Summary */}
      <StatCardRenderer id={id} config={config.stats} data={summary} />

      {/* Client cards */}
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
    </Box>
  );
}
