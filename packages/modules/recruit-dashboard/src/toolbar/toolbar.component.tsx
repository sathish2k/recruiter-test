"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
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
        <Button
          variant="outlined"
          startIcon={<IconRenderer name="domain" size={16} />}
          sx={{ fontWeight: 400 }}
          onClick={() =>
            config.manageClientsRouteId &&
            router.push(config.manageClientsRouteId)
          }
        >
          {t("manageClients")}
        </Button>
      ) : null}
      {config?.export ? (
        <Export id={id} config={config.export} data={[]} filename="dashboard" />
      ) : null}
      <Button
        variant="contained"
        startIcon={<IconRenderer name="add" size={17} />}
        onClick={() => addModal.open()}
      >
        {t("newJob")}
      </Button>
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
