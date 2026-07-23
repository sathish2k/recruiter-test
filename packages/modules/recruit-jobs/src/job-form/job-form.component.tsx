"use client";

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
  useToast,
} from "@recruit/shared";
import { useMemo } from "react";
import { AiScreeningWidget } from "./ai-screening.widget";
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
  description: string;
  requirements: string;
  benefits: string;
  skills: string[];
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
  matchThreshold: number;
  autoAdvance: boolean;
  knockoutCount: number;
  dailyDigest: boolean;
  sourcerId: string;
  profileLeadId: string;
  dailyInviteTarget: number;
  publishChannels: string[];
}

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
      aiScreening: (props: Parameters<typeof AiScreeningWidget>[0]) => (
        <AiScreeningWidget {...props} />
      ),
    }),
    [uploader],
  );

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
          description: data.description,
          requirements: data.requirements,
          benefits: data.benefits,
          skills: data.skills ?? [],
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
          matchThreshold: data.matchThreshold,
          autoAdvance: data.autoAdvance,
          knockoutCount: data.knockoutCount,
          dailyDigest: data.dailyDigest,
          sourcerId: data.sourcerId,
          profileLeadId: data.profileLeadId,
          dailyInviteTarget: data.dailyInviteTarget,
          publishChannels: data.publishChannels ?? [],
        }
      : { status: "open", openings: 1, aiScreening: true };

  return (
    <FormWithSectionsRenderer
      key={jobId ?? "new"}
      id={id}
      title={isEdit ? "editTitle" : "newTitle"}
      description={isEdit ? "editDescription" : "newDescription"}
      schema={config.schema}
      sections={config.sections}
      sectionsContainer={config.sectionsContainer}
      defaultValues={defaultValues}
      onSubmit={save}
      isLoading={loading}
      actionsPlacement="header"
      widgets={widgets}
      submitLabel={isEdit ? "actions.save" : "actions.create"}
      submitIcon={isEdit ? "check" : "rocket"}
      cancelLabel="actions.cancel"
      onCancel={() => router.push(config.listRouteId)}
      addAnotherLabel={isEdit ? undefined : "actions.saveAnother"}
    />
  );
}
