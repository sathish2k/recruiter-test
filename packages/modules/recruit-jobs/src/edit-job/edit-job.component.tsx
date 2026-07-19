"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import type { DatasourceInstance } from "@recruit/sdk";
import {
  useConfiguration,
  useFetch,
  usePortalRouter,
  useRouteParams,
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
import { useState } from "react";
import { EditJobPanel } from "./edit-job-panel";
import type { EditJobConfig } from "./edit-job.configuration";

interface EditJob {
  title: string;
  client: string;
  openings: number;
  empType: string;
  location: string;
  salaryMin: string;
  salaryMax: string;
  description: string;
  skills: string[];
  status: string;
  screeningOn: boolean;
  screeningThreshold: number;
}

function EditJobForm({
  id,
  config,
  job,
  jobId,
  mutation,
}: {
  id: string;
  config: EditJobConfig;
  job: EditJob;
  jobId: string;
  mutation: DatasourceInstance;
}) {
  const { t } = useTranslation(id);
  const router = usePortalRouter();
  const { toast, show, clear } = useToast();
  const discardModal = useModal();
  const deleteModal = useModal();
  const [screening, setScreening] = useState(job.screeningOn ?? true);
  const [threshold, setThreshold] = useState(job.screeningThreshold ?? 80);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [digest, setDigest] = useState(true);

  const defaultValues: FormValues = {
    title: job.title ?? "",
    client: job.client ?? "",
    openings: job.openings != null ? String(job.openings) : "",
    empType: job.empType ?? "Full-time",
    location: job.location ?? "",
    salaryMin: job.salaryMin ?? "",
    salaryMax: job.salaryMax ?? "",
    description: job.description ?? "",
    skills: job.skills ?? [],
  };

  const navigateBack = () => router.push(config.backRouteId, { id: jobId });

  const saveChanges = async (values: FormValues) => {
    await mutation.update?.(jobId, {
      ...values,
      openings: Number(values.openings) || 1,
      screeningOn: screening,
      screeningThreshold: threshold,
    });
    show(
      t("toast.saved"),
      t("toast.savedSub", {
        title: String(values.title ?? ""),
        client: String(values.client ?? ""),
      }),
    );
    setTimeout(navigateBack, 1200);
  };

  const deleteRole = async () => {
    deleteModal.close();
    await mutation.remove?.(jobId);
    show(
      t("toast.deleted"),
      t("toast.deletedSub", { title: job.title, client: job.client }),
    );
    setTimeout(() => router.push(config.deleteRedirectRouteId), 1200);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <LinkRenderer config={{ ...config.backLink, id }} data={{ id: jobId }}>
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
        defaultValues={defaultValues}
        title="title"
        description="description"
        submitLabel="save"
        submitIcon="check"
        cancelLabel="cancel"
        onCancel={() => discardModal.open()}
        onSubmit={saveChanges}
        sidePanel={
          <EditJobPanel
            id={id}
            config={config.panel}
            screening={screening}
            onScreeningChange={setScreening}
            threshold={threshold}
            onThresholdChange={setThreshold}
            autoAdvance={autoAdvance}
            onAutoAdvanceChange={setAutoAdvance}
            digest={digest}
            onDigestChange={setDigest}
          />
        }
      />

      <Card variant="base" sx={{ borderColor: "rgba(200,80,80,.28)" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "13px" }}>
            <Avatar
              variant="rounded"
              sx={{
                width: 38,
                height: 38,
                background: "rgba(200,80,80,.12)",
                border: "1px solid rgba(200,80,80,.32)",
                color: "#E89A9A",
              }}
            >
              <IconRenderer name="delete" size={20} />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                {t("danger.title")}
              </Typography>
              <Typography
                sx={{ fontSize: 12, color: "text.secondary", mt: "2px" }}
              >
                {t("danger.body")}
              </Typography>
            </Box>
          </Box>
          <Button
            onClick={() => deleteModal.open()}
            startIcon={<IconRenderer name="delete" size={15} />}
            sx={{
              background: "rgba(200,80,80,.12)",
              border: "1px solid rgba(200,80,80,.5)",
              color: "#E89A9A",
              fontWeight: 700,
              flex: "none",
            }}
          >
            {t("danger.action")}
          </Button>
        </Box>
      </Card>

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

      <Modal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        title={t("delete.title", { title: job.title })}
        description={t("delete.body", { client: job.client })}
        footer={
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <Button
              variant="outlined"
              onClick={deleteModal.close}
              sx={{ fontWeight: 400 }}
            >
              {t("delete.keep")}
            </Button>
            <Button
              onClick={deleteRole}
              sx={{
                background: "rgba(200,80,80,.9)",
                border: "1px solid rgba(200,80,80,.5)",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              {t("delete.confirm")}
            </Button>
          </Box>
        }
      />

      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}

export function EditJobComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<EditJobConfig>(id);
  const { id: jobId } = useRouteParams();
  const {
    data: job,
    error,
    isLoading,
    mutation,
  } = useFetch<EditJob>(id, { filters: { id: jobId } });

  if (!config || isLoading) return null;
  if (error || !job) {
    return (
      <Card variant="base">
        <Typography sx={{ fontSize: 13.5, color: "text.secondary" }}>
          {t("loadError")}
        </Typography>
      </Card>
    );
  }

  return (
    <EditJobForm
      id={id}
      config={config}
      job={job}
      jobId={jobId}
      mutation={mutation}
    />
  );
}
