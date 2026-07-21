"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import {
  type FormValues,
  FormWithSectionsRenderer,
  IconRenderer,
  Toast,
  type UploadValue,
  useToast,
} from "@recruit/shared";
import type { WorkspaceConfiguration } from "./workspace.configuration";
import { WORKSPACE_WIDGETS } from "./workspace.widgets";

type WorkspaceConfig = typeof WorkspaceConfiguration;

type Organization = Record<string, unknown> & { id: string; name: string };

export function SettingsWorkspaceComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<WorkspaceConfig>(id);
  const { data: organization, mutation, mutate } = useFetch<Organization>(id);
  const { toast, show, clear } = useToast();

  const save = async (values: FormValues) => {
    // The logo field carries `{ url, file }`; only a freshly-picked file needs
    // uploading, and it never belongs in the organization payload.
    const { logo, ...rest } = values as FormValues & { logo?: UploadValue };
    if (logo?.file) await mutation.uploadLogo?.(logo.file);
    await mutation.update?.(rest);
    await mutate();
    show(t("toast.saved"), t("toast.savedSub"));
  };

  if (!organization || !config.profileForm) return null;

  // Every value comes from the API, which merges the org row over
  // WORKSPACE_DEFAULTS — the form invents nothing.
  const defaultValues: FormValues = {};
  defaultValues.logo = { url: (organization.logoUrl as string) ?? "" } as FormValues[string];
  for (const [key, value] of Object.entries(organization)) {
    if (key === "logo" || key === "logoUrl") continue;
    if (value !== null && value !== undefined && value !== "") {
      defaultValues[key] = value as FormValues[string];
    }
  }

  return (
    <Box sx={{ maxWidth: 1040 }}>
      <FormWithSectionsRenderer
        // Remount once the record loads so defaultValues seed correctly.
        key={organization.id}
        id={id}
        schema={config.profileForm}
        sections={config.sections}
        defaultValues={defaultValues}
        onSubmit={save}
        widgets={WORKSPACE_WIDGETS}
        actionsPlacement="footer"
        // The design only surfaces the actions once something has changed, in a
        // bar that sticks to the bottom of the viewport while you scroll.
        actions={({ isDirty, isSubmitting, submit, reset }) =>
          isDirty ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                position: "sticky",
                bottom: 0,
                zIndex: 20,
                mt: "-4px",
                py: "12px",
                px: "2px",
                borderTop: "1px solid",
                borderColor: "divider",
                backdropFilter: "blur(10px)",
                bgcolor: "var(--mui-palette-surface-scrim)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  mr: "auto",
                  color: "warning.light",
                }}
              >
                <Box
                  sx={{ width: 6, height: 6, borderRadius: "999px", bgcolor: "warning.light" }}
                />
                <Typography sx={{ fontSize: 12 }}>{t("unsaved")}</Typography>
              </Box>
              <Button variant="outlined" onClick={reset} sx={{ fontWeight: 400 }}>
                {t("cancel")}
              </Button>
              <Button
                variant="contained"
                onClick={submit}
                loading={isSubmitting}
                startIcon={<IconRenderer name="save" size={16} />}
              >
                {t("save")}
              </Button>
            </Box>
          ) : null
        }
      />
      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
