"use client";

import Box from "@mui/material/Box";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import { type FormValues, FormWithSectionsRenderer, Toast, useToast } from "@recruit/shared";
import type { WorkspaceConfiguration } from "./workspace.configuration";

type WorkspaceConfig = typeof WorkspaceConfiguration;

type Organization = Record<string, unknown> & { id: string; name: string };

const DEFAULTS: FormValues = {
  timezone: "IST (GMT+5:30)",
  language: "English (India)",
  currency: "₹ INR — Indian Rupee",
  noticePeriod: "30 days",
  defaultOwner: "Round-robin (auto)",
  jobVisibility: "Everyone",
  firstDayOfWeek: "Monday",
  dateFormat: "DD MMM YYYY",
  timeFormat: "12-hour (2:30 PM)",
  businessHours: "9:30 AM – 6:30 PM",
  workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  duplicateDetection: true,
  whiteLabel: true,
  accentColor: "#E4560F",
  candidatePrefix: "CAND-",
  jobPrefix: "JOB-",
  clientPrefix: "CLI-",
  invoicePrefix: "INV-",
};

export function SettingsWorkspaceComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<WorkspaceConfig>(id);
  const { data: organization, mutation, mutate } = useFetch<Organization>(id);
  const { toast, show, clear } = useToast();

  const save = async (values: FormValues) => {
    await mutation.update?.(values);
    await mutate();
    show(t("toast.saved"), t("toast.savedSub"));
  };

  if (!organization || !config.profileForm) return null;

  // Seed unset settings with the design's defaults so the form is never blank.
  const defaultValues: FormValues = { ...DEFAULTS };
  for (const [key, value] of Object.entries(organization)) {
    if (value !== null && value !== undefined && value !== "") {
      defaultValues[key] = value as FormValues[string];
    }
  }
  // A stored value that isn't one of the field's options would render an empty
  // select — fall back to the default in that case.
  for (const [key, property] of Object.entries(config.profileForm.properties ?? {})) {
    const options = property?.enum;
    const value = defaultValues[key];
    if (Array.isArray(options) && typeof value === "string" && !options.includes(value)) {
      defaultValues[key] = (DEFAULTS[key] ?? options[0]) as FormValues[string];
    }
  }

  return (
    <Box sx={{ maxWidth: 1100 }}>
      <FormWithSectionsRenderer
        // Remount once the record loads so defaultValues seed correctly.
        key={organization.id}
        id={id}
        schema={config.profileForm}
        sections={config.sections}
        defaultValues={defaultValues}
        onSubmit={save}
        submitLabel="save"
        cancelLabel="cancel"
        submitIcon="save"
      />
      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
