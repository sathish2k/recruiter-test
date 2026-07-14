import type {
  FormSection,
  JsonSchema,
  LinkRendererConfig,
} from "@recruit/shared";

export interface AddCandidateConfig {
  schema: JsonSchema;
  sections: FormSection[];
  backRouteId: string;
  backLink: LinkRendererConfig;
}

const schema: JsonSchema = {
  type: "object",
  properties: {
    firstName: {
      type: "string",
      minLength: 1,
      title: "fields.firstName",
      placeholder: "fields.firstNamePlaceholder",
    },
    lastName: {
      type: "string",
      title: "fields.lastName",
      placeholder: "fields.lastNamePlaceholder",
    },
    email: {
      type: "string",
      format: "email",
      title: "fields.email",
      placeholder: "fields.emailPlaceholder",
    },
    phone: {
      type: "string",
      title: "fields.phone",
      placeholder: "fields.phonePlaceholder",
    },
    location: {
      type: "string",
      title: "fields.location",
      placeholder: "fields.locationPlaceholder",
    },
    linkedin: {
      type: "string",
      title: "fields.linkedin",
      placeholder: "fields.linkedinPlaceholder",
    },
    job: {
      type: "string",
      title: "fields.job",
      enum: [
        "Senior Backend Engineer · Nortech",
        "Product Designer · Fablio",
        "Data Scientist · Vantor",
        "ML Engineer · Vantor",
        "Frontend Engineer · Fablio",
        "Product Manager · Corely",
      ],
    },
    source: {
      type: "string",
      title: "fields.source",
      enum: ["LinkedIn", "Referral", "Indeed", "Careers page"],
      default: "LinkedIn",
    },
    currentTitle: {
      type: "string",
      title: "fields.currentTitle",
      placeholder: "fields.currentTitlePlaceholder",
    },
    years: {
      type: "string",
      title: "fields.years",
      placeholder: "fields.yearsPlaceholder",
    },
    skills: {
      type: "array",
      hideLabel: true,
      title: "fields.skills",
      placeholder: "fields.skillsPlaceholder",
    },
    notes: {
      type: "string",
      widget: "textarea",
      rows: 3,
      title: "fields.notes",
      placeholder: "fields.notesPlaceholder",
    },
  },
  required: ["firstName"],
  errorMessage: { required: { firstName: "fields.firstNameRequired" } },
};

const sections: FormSection[] = [
  {
    title: "sections.personal",
    columns: 2,
    fields: ["firstName", "lastName", "email", "phone", "location", "linkedin"],
  },
  {
    title: "sections.position",
    columns: 2,
    fields: ["job", "source", "currentTitle", "years"],
  },
  {
    title: "sections.skills",
    columns: 1,
    fields: ["skills", "notes"],
  },
];

export const AddCandidateConfiguration: AddCandidateConfig = {
  schema,
  sections,
  backRouteId: "Recruit.Candidates.Route",
  backLink: { label: { name: "back" }, routeId: "Recruit.Candidates.Route" },
};
