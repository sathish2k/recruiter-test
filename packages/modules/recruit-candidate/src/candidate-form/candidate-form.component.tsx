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
import type { CandidateFormConfiguration } from "./candidate-form.configuration";

interface CandidateAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}
interface Education {
  degree?: string;
  institution?: string;
  fieldOfStudy?: string;
  year?: string;
}
interface Experience {
  company?: string;
  jobTitle?: string;
  from?: string;
  to?: string;
  current?: boolean;
}

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  secondaryEmail: string;
  phone: string;
  mobile: string;
  website: string;
  address: CandidateAddress | null;
  experienceYears: string;
  highestQualification: string;
  currentJobTitle: string;
  currentEmployer: string;
  currentSalary: string;
  expectedSalary: string;
  skillSet: string[];
  additionalInfo: string;
  linkedin: string;
  twitter: string;
  education: Education[];
  experience: Experience[];
  resume: Attachment[];
  attachments: Attachment[];
  jobId: string;
  startingStage: string;
  status: string;
  ownerId: string;
  source: string;
}

const QUALIFICATIONS = ["high_school", "diploma", "bachelors", "masters", "phd"];
const STAGES = ["sourced", "screening", "submitted", "interview", "offer"];
const STATUS = ["active", "placed", "on_hold", "rejected"];
const SOURCES = ["added_by_user", "referral", "inbound", "outbound", "event"];
const str = (v: unknown) => (typeof v === "string" ? v : "");

export function CandidateFormComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<CandidateFormConfiguration>(id);
  const { show } = useToast();
  const router = usePortalRouter();
  const params = useRouteParams();
  const candidateId = params.id;
  const isEdit = Boolean(candidateId);

  const { data, isLoading, mutation } = useFetch<Candidate>(id, { filters: { id: candidateId } });

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
        highestQualification: {
          ...p.highestQualification,
          enumNames: QUALIFICATIONS.map((q) => t(`qualification.${q}`)),
        },
        startingStage: { ...p.startingStage, enumNames: STAGES.map((s) => t(`stage.${s}`)) },
        status: { ...p.status, enumNames: STATUS.map((s) => t(`status.${s}`)) },
        source: { ...p.source, enumNames: SOURCES.map((s) => t(`source.${s}`)) },
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
      street,
      city,
      state,
      postalCode,
      country,
      resume: rawResume,
      attachments: rawAttachments,
      ...rest
    } = values;
    const payload = {
      ...rest,
      address: {
        street: str(street),
        city: str(city),
        state: str(state),
        postalCode: str(postalCode),
        country: str(country),
      },
      resume: cleanFiles(rawResume),
      attachments: cleanFiles(rawAttachments),
    };

    if (isEdit) {
      await mut.update?.({ id: candidateId, ...payload });
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
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          secondaryEmail: data.secondaryEmail,
          phone: data.phone,
          mobile: data.mobile,
          website: data.website,
          street: data.address?.street ?? "",
          city: data.address?.city ?? "",
          state: data.address?.state ?? "",
          postalCode: data.address?.postalCode ?? "",
          country: data.address?.country ?? "",
          experienceYears: data.experienceYears,
          highestQualification: data.highestQualification,
          currentJobTitle: data.currentJobTitle,
          currentEmployer: data.currentEmployer,
          currentSalary: data.currentSalary,
          expectedSalary: data.expectedSalary,
          skillSet: data.skillSet ?? [],
          additionalInfo: data.additionalInfo,
          linkedin: data.linkedin,
          twitter: data.twitter,
          education: data.education ?? [],
          experience: data.experience ?? [],
          resume: data.resume ?? [],
          attachments: data.attachments ?? [],
          jobId: data.jobId,
          startingStage: data.startingStage,
          status: data.status,
          ownerId: data.ownerId,
          source: data.source,
        }
      : { status: "active" };

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
        key={candidateId ?? "new"}
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
        submitIcon={isEdit ? "check" : "person-add"}
        cancelLabel="actions.cancel"
        onCancel={() => router.push(config.listRouteId)}
        addAnotherLabel={isEdit ? undefined : "actions.saveAnother"}
      />
    </Box>
  );
}
