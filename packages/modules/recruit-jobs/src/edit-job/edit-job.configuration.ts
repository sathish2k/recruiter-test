import type {
  FormSection,
  JsonSchema,
  LinkRendererConfig,
} from "@recruit/shared";

export interface EditJobPanelConfig {
  team: string[];
  leads: string[];
  channels: { key: string; label: string; on: boolean }[];
}

export interface EditJobConfig {
  schema: JsonSchema;
  sections: FormSection[];
  backRouteId: string;
  deleteRedirectRouteId: string;
  backLink: LinkRendererConfig;
  panel: EditJobPanelConfig;
}

const schema: JsonSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      minLength: 1,
      title: "fields.title",
      placeholder: "fields.titlePlaceholder",
    },
    client: {
      type: "string",
      title: "fields.client",
      enum: ["Nortech", "Fablio", "Vantor", "Corely", "Mistvale", "Orbex"],
    },
    openings: {
      type: "string",
      title: "fields.openings",
      placeholder: "fields.openingsPlaceholder",
    },
    empType: {
      type: "string",
      title: "fields.empType",
      widget: "segmented",
      enum: ["Full-time", "Contract", "Part-time"],
      default: "Full-time",
    },
    location: {
      type: "string",
      title: "fields.location",
      placeholder: "fields.locationPlaceholder",
    },
    salaryMin: {
      type: "string",
      title: "fields.salaryMin",
      placeholder: "fields.salaryMinPlaceholder",
    },
    salaryMax: {
      type: "string",
      title: "fields.salaryMax",
      placeholder: "fields.salaryMaxPlaceholder",
    },
    description: {
      type: "string",
      widget: "markdown",
      rows: 9,
      hideLabel: true,
      title: "fields.description",
      placeholder: "fields.descriptionPlaceholder",
    },
    skills: {
      type: "array",
      hideLabel: true,
      title: "fields.skills",
      placeholder: "fields.skillsPlaceholder",
    },
  },
  required: ["title"],
  errorMessage: { required: { title: "fields.titleRequired" } },
};

const sections: FormSection[] = [
  {
    title: "sections.basics",
    columns: 2,
    fields: [
      { name: "title", span: 2 },
      "client",
      "openings",
      "empType",
      "location",
      "salaryMin",
      "salaryMax",
    ],
  },
  {
    title: "sections.description",
    columns: 1,
    fields: ["description"],
  },
  {
    title: "sections.skills",
    columns: 1,
    fields: ["skills"],
  },
];

export const EditJobConfiguration: EditJobConfig = {
  schema,
  sections,
  backRouteId: "Recruit.JobDetail.Route",
  deleteRedirectRouteId: "Recruit.Jobs.Route",
  backLink: {
    label: { name: "back" },
    routeId: "Recruit.JobDetail.Route",
    params: { id: { type: "dynamic", path: "id" } },
  },
  panel: {
    team: ["Dev Shah", "Mira Joshi", "Riya Kapoor"],
    leads: ["Ana Novak", "Riya Kapoor"],
    channels: [
      { key: "careers", label: "panel.channels.careers", on: true },
      { key: "linkedin", label: "panel.channels.linkedin", on: true },
      { key: "indeed", label: "panel.channels.indeed", on: true },
      { key: "wellfound", label: "panel.channels.wellfound", on: false },
    ],
  },
};
