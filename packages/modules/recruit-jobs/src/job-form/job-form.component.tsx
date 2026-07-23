"use client";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import {
  useConfiguration,
  useFetch,
  usePortalRouter,
  useRouteParams,
  useTranslation,
} from "@recruit/sdk";
import {
  type Attachment,
  AttachmentsWidget,
  type AttachmentUploader,
  type FormValues,
  FormWithSectionsRenderer,
  IconRenderer,
  useToast,
} from "@recruit/shared";
import { useMemo } from "react";
import type { JobFormConfiguration } from "./job-form.configuration";

interface JobAddress {
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

interface Job {
  id: string;
  title: string;
  clientId: string;
  clientContactId: string;
  dateOpened: string;
  targetDate: string;
  employmentType: string;
  workExperience: string;
  industry: string;
  openings: number;
  salaryMin: string;
  salaryMax: string;
  status: string;
  address: JobAddress | null;
  revenuePerPosition: string;
  actualRevenue: string;
  missedRevenue: string;
  jobSummary: Attachment[];
  attachments: Attachment[];
  aiScreening: boolean;
  screeningCriteria: string;
  sourcerId: string;
  profileLeadId: string;
  dailyInviteTarget: number;
  publishChannels: string[];
}

const EMPLOYMENT = ["full_time", "part_time", "contract", "temporary", "internship"];
const EXPERIENCE = ["lt1", "1_3", "3_5", "5_8", "8plus"];
const STATUS = ["open", "on_hold", "filled", "closed"];
const CHANNELS = ["website", "linkedin", "naukri", "indeed"];
const str = (v: unknown) => (typeof v === "string" ? v : "");

export function JobFormComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<JobFormConfiguration>(id);
  const { show } = useToast();
  const router = usePortalRouter();
  const params = useRouteParams();
  const jobId = params.id;
  const isEdit = Boolean(jobId);

  const { data, isLoading, mutation } = useFetch<Job>(id, { filters: { id: jobId } });

  const uploader = useMemo<AttachmentUploader>(() => {
    const mut = mutation as Record<string, ((...args: unknown[]) => Promise<unknown>) | undefined>;
    return (file, onProgress) => mut.uploadAsset?.(file, onProgress) as Promise<Attachment>;
  }, [mutation]);
  const widgets = useMemo(
    () => ({
      attachments: (props: Parameters<typeof AttachmentsWidget>[0]) => (
        <AttachmentsWidget {...props} uploader={uploader} />
      ),
    }),
    [uploader],
  );

  const schema = useMemo(() => {
    if (!config.schema) return config.schema;
    const p = config.schema.properties;
    return {
      ...config.schema,
      properties: {
        ...p,
        employmentType: {
          ...p.employmentType,
          enumNames: EMPLOYMENT.map((e) => t(`employmentType.${e}`)),
        },
        workExperience: {
          ...p.workExperience,
          enumNames: EXPERIENCE.map((e) => t(`workExperience.${e}`)),
        },
        status: { ...p.status, enumNames: STATUS.map((s) => t(`status.${s}`)) },
        publishChannels: {
          ...p.publishChannels,
          enumNames: CHANNELS.map((c) => t(`channels.${c}`)),
        },
      },
    };
  }, [config.schema, t]);

  if (!config.schema) return null;
  const loading = isEdit && (isLoading || !data);

  const cleanFiles = (raw: unknown) =>
    ((raw as Attachment[] | undefined) ?? [])
      .filter((item) => item.url)
      .map(({ name, url, size, type }) => ({ name, url, size, type }));

  const save = async (values: FormValues, meta?: { addAnother?: boolean }) => {
    const mut = mutation as Record<string, ((body?: unknown) => Promise<unknown>) | undefined>;
    const {
      city,
      state,
      country,
      postalCode,
      jobSummary: rawSummary,
      attachments: rawAttachments,
      // Server computes this — never sent.
      expectedRevenue: _expectedRevenue,
      ...rest
    } = values;
    const payload = {
      ...rest,
      address: {
        city: str(city),
        state: str(state),
        country: str(country),
        postalCode: str(postalCode),
      },
      jobSummary: cleanFiles(rawSummary),
      attachments: cleanFiles(rawAttachments),
    };

    if (isEdit) {
      await mut.update?.({ id: jobId, ...payload });
      show(t("toast.updated"));
      router.push(config.listRouteId);
      return;
    }
    await mut.create?.(payload);
    show(t("toast.created"));
    if (!meta?.addAnother) router.push(config.listRouteId);
  };

  const defaultValues: FormValues =
    isEdit && data
      ? {
          title: data.title,
          clientId: data.clientId,
          clientContactId: data.clientContactId,
          dateOpened: data.dateOpened,
          targetDate: data.targetDate,
          employmentType: data.employmentType,
          workExperience: data.workExperience,
          industry: data.industry,
          openings: data.openings,
          salaryMin: data.salaryMin,
          salaryMax: data.salaryMax,
          status: data.status,
          city: data.address?.city ?? "",
          state: data.address?.state ?? "",
          country: data.address?.country ?? "",
          postalCode: data.address?.postalCode ?? "",
          revenuePerPosition: data.revenuePerPosition,
          actualRevenue: data.actualRevenue,
          missedRevenue: data.missedRevenue,
          jobSummary: data.jobSummary ?? [],
          attachments: data.attachments ?? [],
          aiScreening: data.aiScreening,
          screeningCriteria: data.screeningCriteria,
          sourcerId: data.sourcerId,
          profileLeadId: data.profileLeadId,
          dailyInviteTarget: data.dailyInviteTarget,
          publishChannels: data.publishChannels ?? [],
        }
      : { status: "open", openings: 1, aiScreening: false };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Link
        component="button"
        type="button"
        onClick={() => router.push(config.listRouteId)}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: 12.5,
          fontWeight: 600,
          color: "text.secondary",
          alignSelf: "flex-start",
        }}
      >
        <IconRenderer name="arrow-back" size={15} />
        {t("back")}
      </Link>
      <FormWithSectionsRenderer
        key={jobId ?? "new"}
        id={id}
        title={isEdit ? "editTitle" : "newTitle"}
        description={isEdit ? "editDescription" : "newDescription"}
        schema={schema}
        sections={config.sections}
        sectionsContainer={config.sectionsContainer}
        defaultValues={defaultValues}
        onSubmit={save}
        isLoading={loading}
        actionsPlacement="header"
        widgets={widgets}
        submitLabel={isEdit ? "actions.save" : "actions.create"}
        submitIcon={isEdit ? "check" : "send"}
        cancelLabel="actions.cancel"
        onCancel={() => router.push(config.listRouteId)}
        addAnotherLabel={isEdit ? undefined : "actions.saveAnother"}
      />
    </Box>
  );
}
