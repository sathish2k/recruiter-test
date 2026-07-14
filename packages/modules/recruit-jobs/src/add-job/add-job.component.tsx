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
  type FormValues,
  FormWithSectionsRenderer,
  IconRenderer,
  LinkRenderer,
  Modal,
  Toast,
  useModal,
  useToast,
} from "@recruit/shared";
import { AddJobPanel } from "./add-job-panel";
import type { AddJobConfig } from "./add-job.configuration";

export function AddJobComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<AddJobConfig>(id);
  const router = usePortalRouter();
  const { mutation } = useFetch(id);
  const { toast, show, clear } = useToast();
  const discardModal = useModal();

  if (!config) return null;

  const navigateBack = () => router.push(config.backRouteId);

  const createJob = async (values: FormValues) => {
    await mutation.create?.({
      ...values,
      openings: Number(values.openings) || 1,
    });
    show(
      t("toast.published"),
      t("toast.publishedSub", {
        title: String(values.title ?? ""),
        client: String(values.client ?? ""),
      }),
    );
    setTimeout(navigateBack, 1200);
  };

  const saveDraft = async (values: FormValues) => {
    await mutation.create?.({
      ...values,
      openings: Number(values.openings) || 1,
      status: "Draft",
    });
    show(
      t("toast.draftSaved"),
      t("toast.draftSavedSub", { title: String(values.title ?? "") }),
    );
    setTimeout(navigateBack, 1200);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <LinkRenderer config={{ ...config.backLink, id }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            fontSize: 12.5,
            color: "text.secondary",
            fontWeight: 600,
            width: "fit-content",
          }}
        >
          <IconRenderer name="arrow-back" size={15} />
          {config.backLink.label ? t(config.backLink.label.name) : ""}
        </Box>
      </LinkRenderer>
      <FormWithSectionsRenderer
        id={id}
        schema={config.schema}
        sections={config.sections}
        title="title"
        description="description"
        submitLabel="publish"
        submitIcon="rocket"
        cancelLabel="cancel"
        onCancel={() => discardModal.open()}
        draftLabel="saveDraft"
        onSaveDraft={saveDraft}
        onSubmit={createJob}
        sidePanel={<AddJobPanel id={id} config={config.panel} />}
      />

      <Modal
        open={discardModal.isOpen}
        onClose={discardModal.close}
        title={t("discard.title")}
        description={t("discard.body")}
        footer={
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <Button
              variant="outlined"
              onClick={discardModal.close}
              sx={{ fontWeight: 400 }}
            >
              {t("discard.keep")}
            </Button>
            <Button
              onClick={navigateBack}
              sx={{
                background: "rgba(200,80,80,.2)",
                border: "1px solid rgba(200,80,80,.5)",
                color: "#E89A9A",
                fontWeight: 700,
              }}
            >
              {t("discard.confirm")}
            </Button>
          </Box>
        }
      />

      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
