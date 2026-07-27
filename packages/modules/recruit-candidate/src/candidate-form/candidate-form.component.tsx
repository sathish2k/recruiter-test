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
  type DocumentExtractor,
  type FormValues,
  FormWithSectionsRenderer,
  ResumeAutofillWidget,
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
  salutation: string;
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
  formattedResume: Attachment[];
  coverLetter: Attachment[];
  offer: Attachment[];
  contracts: Attachment[];
  attachments: Attachment[];
  jobId: string;
  startingStage: string;
  status: string;
  ownerId: string;
  source: string;
  emailOptOut: boolean;
}

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
  const extractor = useMemo<DocumentExtractor>(() => {
    const mut = mutation as Record<string, ((...args: unknown[]) => Promise<unknown>) | undefined>;
    return (file, fields) => mut.parseDocument?.(file, fields) as Promise<Record<string, unknown>>;
  }, [mutation]);
  const widgets = useMemo(
    () => ({
      attachments: (props: Parameters<typeof AttachmentsWidget>[0]) => (
        <AttachmentsWidget {...props} uploader={uploader} />
      ),
      resumeAutofill: (props: Parameters<typeof ResumeAutofillWidget>[0]) => (
        <ResumeAutofillWidget
          {...props}
          uploader={uploader}
          extractor={extractor}
          schema={config.schema}
        />
      ),
    }),
    [uploader, extractor, config.schema],
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
      street,
      city,
      state,
      postalCode,
      country,
      resume: rawResume,
      formattedResume: rawFormatted,
      coverLetter: rawCover,
      offer: rawOffer,
      contracts: rawContracts,
      others: rawOthers,
      // Display-only parse dropzone — not persisted (it seeds `resume`).
      autofillCv: _autofillCv,
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
      formattedResume: cleanFiles(rawFormatted),
      coverLetter: cleanFiles(rawCover),
      offer: cleanFiles(rawOffer),
      contracts: cleanFiles(rawContracts),
      // The "Others" slot maps to the backend `attachments` column.
      attachments: cleanFiles(rawOthers),
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
          salutation: data.salutation,
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
          formattedResume: data.formattedResume ?? [],
          coverLetter: data.coverLetter ?? [],
          offer: data.offer ?? [],
          contracts: data.contracts ?? [],
          others: data.attachments ?? [],
          jobId: data.jobId,
          startingStage: data.startingStage,
          status: data.status,
          ownerId: data.ownerId,
          source: data.source,
          emailOptOut: data.emailOptOut,
        }
      : { status: "new" };

  return (
    <FormWithSectionsRenderer
      key={candidateId ?? "new"}
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
      submitIcon={isEdit ? "check" : "person-add"}
      cancelLabel="actions.cancel"
      onCancel={() => router.push(config.listRouteId)}
      addAnotherLabel={isEdit ? undefined : "actions.saveAnother"}
    />
  );
}
