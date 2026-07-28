"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
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
  ChipsWidget,
  type FormValues,
  FormWithSectionsRenderer,
  IconRenderer,
  MarkdownPreview,
  MarkdownWidget,
  Modal,
  useModal,
  useToast,
} from "@recruit/shared";
import { useCallback, useMemo } from "react";
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
  niceToHaveSkills: string[];
  salaryCurrency: string;
  remote: boolean;
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

/** The brief so far — what both AI actions read. */
const briefOf = (form: Record<string, unknown>) =>
  [
    str(form.title),
    str(form.employmentType),
    str(form.workExperience),
    str(form.description),
    str(form.requirements),
  ]
    .filter(Boolean)
    .join("\n\n");

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
  const parseText = useCallback(
    async (text: string, fields: unknown) => {
      const mut = mutation as Record<
        string,
        ((text?: string, fields?: unknown) => Promise<unknown>) | undefined
      >;
      return ((await mut.parseText?.(text, fields)) ?? {}) as Record<string, unknown>;
    },
    [mutation],
  );

  const suggestSkills = useCallback(
    async (props: { control?: unknown }) => {
      const form = (props.control as { _formValues?: Record<string, unknown> })?._formValues ?? {};
      if (!str(form.title)) {
        show(t("toast.titleFirst"));
        return [];
      }
      const parsed = await parseText(briefOf(form), [
        {
          name: "skills",
          type: "array",
          itemType: "string",
          hint: "Individual must-have technical skills for this role, one per item",
        },
      ]);
      return Array.isArray(parsed.skills) ? parsed.skills.map(String) : [];
    },
    [parseText, show, t],
  );

  const review = useModal<Record<string, unknown>>();

  const listTemplates = useCallback(
    async (section: string) => {
      const mut = mutation as Record<string, (() => Promise<unknown>) | undefined>;
      const rows = ((await mut.listTemplates?.()) ?? []) as Record<string, unknown>[];
      return rows
        .filter((row) => str(row[section]))
        .map((row) => ({ label: str(row.title), body: str(row[section]) }));
    },
    [mutation],
  );

  const widgets = useMemo(
    () => ({
      attachments: (props: Parameters<typeof AttachmentsWidget>[0]) => (
        <AttachmentsWidget {...props} uploader={uploader} />
      ),
      aiScreening: (props: Parameters<typeof AiScreeningWidget>[0]) => (
        <AiScreeningWidget {...props} />
      ),
      chips: (props: Parameters<typeof ChipsWidget>[0]) =>
        props.name === "skills" ? (
          <ChipsWidget {...props} onSuggest={() => suggestSkills(props)} />
        ) : (
          <ChipsWidget {...props} />
        ),
      // The design's Templates / Generate with AI row sits above the editor.
      markdown: (props: Parameters<typeof MarkdownWidget>[0]) => (
        <MarkdownWidget
          {...props}
          onTemplates={() => listTemplates(props.name)}
          onGenerate={async () => {
            const form =
              (props.control as { _formValues?: Record<string, unknown> })?._formValues ?? {};
            if (!str(form.title)) {
              show(t("toast.titleFirst"));
              return null;
            }
            const parsed = await parseText(briefOf(form), [
              {
                name: props.name,
                type: "string",
                hint: t(`generate.${props.name}`, "Write this section of the job post"),
              },
            ]);
            return typeof parsed[props.name] === "string" ? (parsed[props.name] as string) : null;
          }}
        />
      ),
    }),
    [uploader, suggestSkills, parseText, listTemplates, show, t],
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
      id: _id,
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
          id: data.id,
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
          niceToHaveSkills: data.niceToHaveSkills ?? [],
          salaryCurrency: data.salaryCurrency,
          remote: data.remote,
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
    <>
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
        actions={(state) => (
          <Box sx={{ display: "flex", gap: "8px", flex: "none" }}>
            <Button
              variant="outlined"
              onClick={() => router.push(config.listRouteId)}
              disabled={state.isSubmitting}
              sx={{ fontWeight: 400 }}
            >
              {t("actions.cancel")}
            </Button>
            <Button
              variant="outlined"
              onClick={() => save({ ...state.values, status: "draft" })}
              disabled={state.isSubmitting}
              sx={{ fontWeight: 400 }}
            >
              {t("actions.saveDraft")}
            </Button>
            <Button
              variant="outlined"
              onClick={() => review.open(state.values as Record<string, unknown>)}
              startIcon={<IconRenderer name="visibility" size={15} />}
              sx={{ fontWeight: 400 }}
            >
              {t("actions.review")}
            </Button>
            <Button
              variant="contained"
              loading={state.isSubmitting}
              onClick={state.submit}
              startIcon={<IconRenderer name={isEdit ? "check" : "rocket"} size={16} />}
            >
              {t(isEdit ? "actions.save" : "actions.create")}
            </Button>
          </Box>
        )}
        draftLabel="actions.saveDraft"
        onSaveDraft={(values) => save({ ...values, status: "draft" })}
      />
      <Modal
        open={review.isOpen}
        onClose={review.close}
        title={t("review.title")}
        description={t("review.description")}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Typography sx={{ fontSize: 19, fontWeight: 700 }}>
            {str(review.data?.title) || t("review.untitled")}
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: "text.disabled" }}>
            {[
              str(review.data?.employmentType),
              review.data?.remote ? t("review.remote") : str(review.data?.city),
              str(review.data?.salaryMin) && str(review.data?.salaryMax)
                ? `${str(review.data?.salaryCurrency)} ${str(review.data?.salaryMin)}–${str(review.data?.salaryMax)}`
                : "",
            ]
              .filter(Boolean)
              .join(" · ")}
          </Typography>
          {(["description", "requirements", "benefits"] as const).map((section) =>
            str(review.data?.[section]) ? (
              <Box key={section}>
                <Typography
                  sx={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".1em", mb: "6px" }}
                >
                  {t(`review.section.${section}`)}
                </Typography>
                <MarkdownPreview value={str(review.data?.[section])} />
              </Box>
            ) : null,
          )}
        </Box>
      </Modal>
    </>
  );
}
