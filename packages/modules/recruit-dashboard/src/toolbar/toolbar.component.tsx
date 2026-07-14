"use client";

import Box from "@mui/material/Box";
import {
  useConfiguration,
  useFetch,
  usePortalRouter,
  useTranslation,
} from "@recruit/sdk";
import {
  type ExportConfig,
  Export,
  FormModal,
  type FormValues,
  IconRenderer,
  type JsonSchema,
  useModal,
} from "@recruit/shared";

interface ToolbarConfig {
  manageClientsRouteId?: string;
  export?: ExportConfig;
  addForm?: JsonSchema;
}

const pillSx = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  p: "9px 16px",
  borderRadius: "999px",
  fontSize: 13,
  cursor: "pointer",
};

export function ToolbarComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<ToolbarConfig>(id);
  const router = usePortalRouter();
  const { mutation, mutate } = useFetch(id);
  const addModal = useModal();

  const createJob = async (values: FormValues) => {
    await mutation.create?.(values);
    await mutate();
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {config?.manageClientsRouteId ? (
        <Box
          onClick={() =>
            config.manageClientsRouteId &&
            router.push(config.manageClientsRouteId)
          }
          sx={{
            ...pillSx,
            border: "1px solid rgba(255,255,255,.14)",
            color: "#ECEAE7",
            "&:hover": { background: "rgba(255,255,255,.06)" },
          }}
        >
          <IconRenderer name="domain" size={16} />
          {t("manageClients")}
        </Box>
      ) : null}
      {config?.export ? (
        <Export id={id} config={config.export} data={[]} filename="dashboard" />
      ) : null}
      <Box
        onClick={() => addModal.open()}
        sx={{
          ...pillSx,
          fontWeight: 600,
          background: "linear-gradient(135deg,#FF8A3C,#E4560F)",
          color: "#fff",
          "&:hover": { filter: "brightness(1.08)" },
        }}
      >
        <IconRenderer name="add" size={17} />
        {t("newJob")}
      </Box>
      {config?.addForm ? (
        <FormModal
          open={addModal.isOpen}
          onClose={addModal.close}
          id={id}
          title={t("addForm.title")}
          description={t("addForm.description")}
          schema={config.addForm}
          submitLabel="addForm.submit"
          cancelLabel="cancel"
          onSubmit={createJob}
        />
      ) : null}
    </Box>
  );
}
