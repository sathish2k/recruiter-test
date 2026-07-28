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
  type DocumentExtractor,
  type FormValues,
  FormWithSectionsRenderer,
  GeneratedDocWidget,
  IconRenderer,
  ResumeAutofillWidget,
  TextWidget,
  useModal,
  useToast,
} from "@recruit/shared";
import { useCallback, useMemo, useState } from "react";
import type { CandidateFormConfiguration } from "./candidate-form.configuration";
import { type DuplicateMatch, DuplicateMergeDialog } from "./duplicate-merge.dialog";

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
  github: string;
  stackOverflow: string;
  noticePeriod: string;
  workAuthorization: string;
  preferredLocation: string;
  availability: string;
  tags: string[];
  doNotContact: boolean;
  salaryCurrency: string;
  openToRelocate: boolean;
  openToRemote: boolean;
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
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

/** "Today" / "Yesterday" / "5d ago", matching the detail screens. */
const relativeDays = (when: Date) => {
  const days = Math.floor((Date.now() - when.getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
};

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

  // Duplicate detection (TC-CAN-001) — the warning strip is raised on email
  // blur and again before a create; the merge dialog resolves it field by
  // field (TC-CAN-002).
  const [dupe, setDupe] = useState<{
    matches: DuplicateMatch[];
    values: Record<string, unknown>;
  } | null>(null);
  const [merging, setMerging] = useState(false);
  const mergeModal = useModal<{
    match: DuplicateMatch;
    incoming: Record<string, unknown>;
    payload?: Record<string, unknown>;
  }>();

  const checkDuplicates = useCallback(
    async (values: Record<string, unknown>) => {
      const mut = mutation as Record<
        string,
        ((query?: Record<string, unknown>) => Promise<unknown>) | undefined
      >;
      const result = (await mut.checkDuplicates?.({
        email: str(values.email),
        secondaryEmail: str(values.secondaryEmail),
        phone: str(values.phone),
        mobile: str(values.mobile),
        linkedin: str(values.linkedin),
        excludeId: candidateId,
      })) as { data?: DuplicateMatch[] } | undefined;
      const found = result?.data ?? [];
      setDupe(found.length ? { matches: found, values } : null);
      return found;
    },
    [mutation, candidateId],
  );

  const uploader = useMemo<AttachmentUploader>(() => {
    const mut = mutation as Record<string, ((...args: unknown[]) => Promise<unknown>) | undefined>;
    return (file, onProgress) => mut.uploadAsset?.(file, onProgress) as Promise<Attachment>;
  }, [mutation]);
  const extractor = useMemo<DocumentExtractor>(() => {
    const mut = mutation as Record<string, ((...args: unknown[]) => Promise<unknown>) | undefined>;
    return (file, fields) => mut.parseDocument?.(file, fields) as Promise<Record<string, unknown>>;
  }, [mutation]);
  // Reads the attached resume back through the extractor, asking only for
  // skills. Returns [] when there is no resume yet — the toast says why.
  const suggestSkills = useCallback(
    async (props: { control?: unknown }) => {
      const form = (props.control as { _formValues?: Record<string, unknown> })?._formValues ?? {};
      const attached = [
        ...((form.resume as { file?: File }[] | undefined) ?? []),
        ...((form.autofillCv as { file?: File }[] | undefined) ?? []),
      ];
      const file = attached.find((item) => item?.file)?.file;
      if (!file) {
        show(t("toast.noResume"));
        return [];
      }
      const parsed = await extractor(file, [
        {
          name: "skillSet",
          type: "array",
          itemType: "string",
          hint: "Individual technical and professional skills, one per item",
        },
      ]);
      const skills = parsed?.skillSet;
      return Array.isArray(skills) ? skills.map((entry) => String(entry)) : [];
    },
    [extractor, show, t],
  );

  // Builds the formatted CV from what the form already holds and stores it
  // through the same uploader every other attachment uses.
  const generateFormatted = useCallback(
    async (props: { control?: unknown }) => {
      const form = (props.control as { _formValues?: Record<string, unknown> })?._formValues ?? {};
      const value = (key: string) => str(form[key]);
      const rows = (key: string) =>
        Array.isArray(form[key]) ? (form[key] as Record<string, unknown>[]) : [];
      const name = [value("firstName"), value("lastName")].filter(Boolean).join(" ");
      if (!name) {
        show(t("toast.nameFirst"));
        return null;
      }

      const lines = [
        name.toUpperCase(),
        [value("currentJobTitle"), value("currentEmployer")].filter(Boolean).join(" · "),
        [value("email"), value("mobile") || value("phone"), value("linkedin")]
          .filter(Boolean)
          .join(" | "),
        "",
        ...(value("additionalInfo") ? [t("formatted.summary"), value("additionalInfo"), ""] : []),
        ...(rows("experience").length ? [t("formatted.experience")] : []),
        ...rows("experience")
          .filter((row) => str(row.jobTitle) || str(row.company))
          .flatMap((row) => [
            `- ${[str(row.jobTitle), str(row.company)].filter(Boolean).join(" — ")}`,
            ...(str(row.summary) ? [`  ${str(row.summary)}`] : []),
          ]),
        ...(rows("experience").length ? [""] : []),
        ...(rows("education").length ? [t("formatted.education")] : []),
        ...rows("education")
          .filter((row) => str(row.institution) || str(row.degree))
          .map((row) => `- ${[str(row.degree), str(row.institution)].filter(Boolean).join(", ")}`),
        ...(rows("education").length ? [""] : []),
        ...(Array.isArray(form.skillSet) && form.skillSet.length
          ? [t("formatted.skills"), (form.skillSet as string[]).join(", ")]
          : []),
      ];

      const file = new File([lines.join("\n")], `${name} - Formatted Resume.txt`, {
        type: "text/plain",
      });
      return (await uploader(file, () => {})) as Attachment;
    },
    [uploader, show, t],
  );

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
      // Skills can be read back out of the CV that is already attached, so the
      // design's "Suggest from resume" re-runs extraction for that one field.
      "generated-doc": (props: Parameters<typeof GeneratedDocWidget>[0]) => (
        <GeneratedDocWidget {...props} onGenerate={() => generateFormatted(props)} />
      ),
      chips: (props: Parameters<typeof ChipsWidget>[0]) =>
        props.name === "skillSet" ? (
          <ChipsWidget {...props} onSuggest={() => suggestSkills(props)} />
        ) : (
          <ChipsWidget {...props} />
        ),
      // Leaving the email field is the first moment we can tell the recruiter
      // they are about to re-add someone the workspace already holds.
      text: (props: Parameters<typeof TextWidget>[0]) =>
        props.name === "email" ? (
          <TextWidget
            {...props}
            field={{
              ...props.field,
              onBlur: () => {
                props.field.onBlur();
                const form =
                  (props.control as { _formValues?: Record<string, unknown> })?._formValues ?? {};
                if (str(form.email)) void checkDuplicates(form);
              },
            }}
          />
        ) : (
          <TextWidget {...props} />
        ),
    }),
    [uploader, extractor, config.schema, suggestSkills, generateFormatted, checkDuplicates],
  );

  if (!config.schema) return null;
  const loading = isEdit && (isLoading || !data);

  const cleanFiles = (raw: unknown) =>
    ((raw as Attachment[] | undefined) ?? [])
      .filter((item) => item.url)
      .map(({ name, url, size, type }) => ({ name, url, size, type }));

  /** Writes the kept values onto the record that survives, archiving this one
   * when it already exists. */
  const merge = async (match: DuplicateMatch, values: Record<string, string>) => {
    const mut = mutation as Record<string, ((body?: unknown) => Promise<unknown>) | undefined>;
    setMerging(true);
    try {
      await mut.merge?.({ id: match.id, sourceId: candidateId, values });
      mergeModal.close();
      show(t("toast.merged", { name: match.name }));
      router.push("Recruit.CandidateEdit.Route", { id: match.id });
    } finally {
      setMerging(false);
    }
  };

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

    // A create runs the check once more: the email may never have been blurred,
    // and a phone or LinkedIn match only shows up here.
    const found = await checkDuplicates(values);
    if (found.length) {
      mergeModal.open({ match: found[0], incoming: values, payload });
      return;
    }

    await create(payload, meta?.addAnother);
  };

  const create = async (payload: Record<string, unknown>, addAnother?: boolean) => {
    const mut = mutation as Record<string, ((body?: unknown) => Promise<unknown>) | undefined>;
    await mut.create?.(payload);
    show(t("toast.created"));
    if (!addAnother) router.push(config.listRouteId);
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
          github: data.github,
          stackOverflow: data.stackOverflow,
          noticePeriod: data.noticePeriod,
          workAuthorization: data.workAuthorization,
          preferredLocation: data.preferredLocation,
          availability: data.availability,
          tags: data.tags ?? [],
          doNotContact: data.doNotContact,
          salaryCurrency: data.salaryCurrency,
          openToRelocate: data.openToRelocate,
          openToRemote: data.openToRemote,
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
          createdByName: data.createdByName,
          createdLabel: data.createdAt
            ? new Date(data.createdAt).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "",
          lastActivityLabel: data.updatedAt ? relativeDays(new Date(data.updatedAt)) : "",
        }
      : {
          status: "new",
          // A record that does not exist yet still says what happens on save.
          createdLabel: t("audit.justNow"),
          lastActivityLabel: t("audit.onSave"),
        };

  const warning = dupe?.matches[0];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {warning ? (
        <Box
          data-testid="duplicate-warning"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            p: "12px 16px",
            borderRadius: "12px",
            border: "1px solid",
            borderColor: "surface.primarySoftBorder",
            bgcolor: "surface.primarySoftBg",
          }}
        >
          <Box sx={{ color: "surface.accentBright", display: "flex", flex: "none" }}>
            <IconRenderer name="warning" size={18} />
          </Box>
          <Typography sx={{ flex: 1, minWidth: 0, fontSize: 13 }}>
            {t("duplicate.warning", {
              name: warning.name,
              on: (warning.matchedOn ?? []).map((reason) => t(`duplicate.on.${reason}`)).join(", "),
            })}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            sx={{ flex: "none" }}
            onClick={() => mergeModal.open({ match: warning, incoming: dupe?.values ?? {} })}
          >
            {t("duplicate.review")}
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={{ flex: "none" }}
            onClick={() => setDupe(null)}
          >
            {t("duplicate.dismiss")}
          </Button>
        </Box>
      ) : null}

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

      {mergeModal.data ? (
        <DuplicateMergeDialog
          open={mergeModal.isOpen}
          onClose={mergeModal.close}
          t={t}
          schema={config.schema}
          match={mergeModal.data.match}
          incoming={mergeModal.data.incoming}
          busy={merging}
          onConfirm={(values) => merge(mergeModal.data?.match as DuplicateMatch, values)}
          onCreateAnyway={
            mergeModal.data.payload
              ? async () => {
                  const payload = mergeModal.data?.payload;
                  mergeModal.close();
                  setDupe(null);
                  if (payload) await create(payload);
                }
              : undefined
          }
          createAnywayLabel={t("duplicate.createAnyway")}
        />
      ) : null}
    </Box>
  );
}
