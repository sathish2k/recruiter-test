"use client";

import Box from "@mui/material/Box";
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
  Toast,
  useToast,
} from "@recruit/shared";
import { AddCandidatePanel } from "./add-candidate-panel";
import type { AddCandidateConfig } from "./add-candidate.configuration";

export function AddCandidateComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<AddCandidateConfig>(id);
  const router = usePortalRouter();
  const { mutation } = useFetch(id);
  const { toast, show, clear } = useToast();

  if (!config) return null;

  const createCandidate = async (values: FormValues) => {
    await mutation.create?.({
      ...values,
      years: Number(values.years) || 0,
    });
    const name = [values.firstName, values.lastName].filter(Boolean).join(" ");
    show(t("toast.saved"), t("toast.savedSub", { name }));
    setTimeout(() => router.push(config.backRouteId), 1200);
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
        submitLabel="save"
        submitIcon="person-add"
        cancelLabel="cancel"
        onCancel={() => router.push(config.backRouteId)}
        onSubmit={createCandidate}
        sidePanel={<AddCandidatePanel id={id} />}
      />

      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
