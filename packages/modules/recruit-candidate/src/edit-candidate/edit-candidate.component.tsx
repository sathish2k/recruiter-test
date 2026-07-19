"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
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
import { EditCandidatePanel } from "./edit-candidate-panel";
import type { EditCandidateConfig } from "./edit-candidate.configuration";

interface CandidateDetail {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  role?: string;
  client?: string;
  source?: string;
  exp?: number;
  skills?: string[];
  notes?: string;
}

export function EditCandidateComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<EditCandidateConfig>(id);
  const router = usePortalRouter();
  const { id: candidateId } = useRouteParams();
  const { data, isLoading, mutation } = useFetch<CandidateDetail>(id, {
    filters: { id: candidateId },
  });
  const { toast, show, clear } = useToast();
  const removeModal = useModal();

  if (!config || isLoading || !data) return null;

  const [firstName, ...rest] = (data.name ?? "").trim().split(/\s+/);
  const defaultValues: FormValues = {
    firstName: firstName ?? "",
    lastName: rest.join(" "),
    email: data.email ?? "",
    phone: data.phone ?? "",
    location: data.location ?? "",
    linkedin: data.linkedin ?? "",
    job: data.client
      ? `${data.role ?? ""} · ${data.client}`
      : (data.role ?? ""),
    source: data.source ?? "",
    currentTitle: data.role ?? "",
    years: data.exp != null ? String(data.exp) : "",
    skills: data.skills ?? [],
    notes: data.notes ?? "",
  };

  const backToDetail = () =>
    router.push(config.backRouteId, { id: candidateId });

  const saveCandidate = async (values: FormValues) => {
    await mutation.update?.(candidateId, {
      ...values,
      years: Number(values.years) || 0,
    });
    const name = [values.firstName, values.lastName].filter(Boolean).join(" ");
    show(t("toast.saved"), t("toast.savedSub", { name }));
    setTimeout(backToDetail, 1200);
  };

  const removeCandidate = async () => {
    removeModal.close();
    await mutation.remove?.(candidateId);
    show(t("toast.removed"), t("toast.removedSub", { name: data.name ?? "" }));
    setTimeout(() => router.push(config.candidatesRouteId), 1200);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <LinkRenderer
        config={{ ...config.backLink, id }}
        data={{ id: candidateId }}
      >
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
        onCancel={backToDetail}
        onSubmit={saveCandidate}
        sidePanel={<EditCandidatePanel id={id} />}
      />

      <Card variant="base" sx={{ borderColor: "rgba(200,80,80,.28)" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <Box sx={{ color: "#E89A9A", mt: "1px" }}>
              <IconRenderer name="delete" size={20} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                {t("danger.title")}
              </Typography>
              <Typography
                sx={{
                  fontSize: 12.5,
                  color: "text.secondary",
                  mt: "3px",
                  maxWidth: 460,
                }}
              >
                {t("danger.hint")}
              </Typography>
            </Box>
          </Box>
          <Button
            onClick={() => removeModal.open()}
            startIcon={<IconRenderer name="delete" size={16} />}
            sx={{
              flex: "none",
              background: "rgba(200,80,80,.2)",
              border: "1px solid rgba(200,80,80,.5)",
              color: "#E89A9A",
              fontWeight: 700,
            }}
          >
            {t("danger.remove")}
          </Button>
        </Box>
      </Card>

      <Modal
        open={removeModal.isOpen}
        onClose={removeModal.close}
        title={t("removeModal.title")}
        description={t("removeModal.body")}
        footer={
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <Button
              variant="outlined"
              onClick={removeModal.close}
              sx={{ fontWeight: 400 }}
            >
              {t("removeModal.keep")}
            </Button>
            <Button
              onClick={removeCandidate}
              sx={{
                background: "rgba(200,80,80,.2)",
                border: "1px solid rgba(200,80,80,.5)",
                color: "#E89A9A",
                fontWeight: 700,
              }}
            >
              {t("removeModal.confirm")}
            </Button>
          </Box>
        }
      />

      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
