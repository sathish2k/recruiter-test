import type { FormLayoutProps, FormSection, JsonSchema } from "@recruit/shared";

export interface CandidateFormConfiguration {
  schema: JsonSchema;
  sections: FormSection[];
  sectionsContainer: FormLayoutProps;
  listRouteId: string;
}

export const CandidateFormConfiguration: CandidateFormConfiguration = {
  schema: {
    type: "object",
    properties: {
      // ── Basic info ──
      firstName: {
        type: "string",
        title: "fields.firstName",
        placeholder: "fields.firstNamePlaceholder",
        maxLength: 100,
        errorMessage: { maxLength: "fields.firstNameMax" },
        grid: { size: { xs: 12, md: 6 } },
      },
      lastName: {
        type: "string",
        title: "fields.lastName",
        placeholder: "fields.lastNamePlaceholder",
        maxLength: 100,
        grid: { size: { xs: 12, md: 6 } },
      },
      email: {
        type: "string",
        format: "email",
        title: "fields.email",
        placeholder: "fields.emailPlaceholder",
        maxLength: 255,
        errorMessage: { format: "fields.emailInvalid" },
        grid: { size: { xs: 12, md: 6 } },
      },
      secondaryEmail: {
        type: "string",
        format: "email",
        title: "fields.secondaryEmail",
        placeholder: "fields.secondaryEmailPlaceholder",
        maxLength: 255,
        errorMessage: { format: "fields.emailInvalid" },
        grid: { size: { xs: 12, md: 6 } },
      },
      phone: {
        type: "string",
        widget: "phone",
        title: "fields.phone",
        placeholder: "fields.phonePlaceholder",
        optionSource: { url: "/reference", path: "data.dialCodes" },
        errorMessage: { phone: "fields.phoneInvalid" },
        grid: { size: { xs: 12, md: 6 } },
      },
      mobile: {
        type: "string",
        widget: "phone",
        title: "fields.mobile",
        placeholder: "fields.mobilePlaceholder",
        optionSource: { url: "/reference", path: "data.dialCodes" },
        errorMessage: { phone: "fields.phoneInvalid" },
        grid: { size: { xs: 12, md: 6 } },
      },
      website: {
        type: "string",
        title: "fields.website",
        placeholder: "fields.websitePlaceholder",
        maxLength: 255,
        grid: { size: { xs: 12, md: 6 } },
      },
      // ── Address (plain fields) ──
      street: {
        type: "string",
        title: "address.street",
        placeholder: "address.street",
        grid: { size: { xs: 12, md: 6 } },
      },
      city: {
        type: "string",
        title: "address.city",
        placeholder: "address.city",
        grid: { size: { xs: 12, md: 6 } },
      },
      state: {
        type: "string",
        title: "address.state",
        placeholder: "address.state",
        grid: { size: { xs: 12, md: 6 } },
      },
      postalCode: {
        type: "string",
        title: "address.postalCode",
        placeholder: "address.postalCode",
        grid: { size: { xs: 12, md: 6 } },
      },
      country: {
        type: "string",
        title: "address.country",
        placeholder: "address.country",
        grid: { size: { xs: 12, md: 6 } },
      },
      // ── Professional details ──
      experienceYears: {
        type: "number",
        widget: "number",
        title: "fields.experienceYears",
        minimum: 0,
        maximum: 60,
        step: 0.5,
        grid: { size: { xs: 12, md: 6 } },
      },
      highestQualification: {
        type: "string",
        widget: "select",
        title: "fields.highestQualification",
        enum: ["high_school", "diploma", "bachelors", "masters", "phd"],
        grid: { size: { xs: 12, md: 6 } },
      },
      currentJobTitle: {
        type: "string",
        title: "fields.currentJobTitle",
        placeholder: "fields.currentJobTitlePlaceholder",
        maxLength: 150,
        grid: { size: { xs: 12, md: 6 } },
      },
      currentEmployer: {
        type: "string",
        title: "fields.currentEmployer",
        placeholder: "fields.currentEmployerPlaceholder",
        maxLength: 150,
        grid: { size: { xs: 12, md: 6 } },
      },
      currentSalary: {
        type: "number",
        widget: "number",
        title: "fields.currentSalary",
        unit: "fields.lpa",
        unitPosition: "end",
        minimum: 0,
        grid: { size: { xs: 12, md: 6 } },
      },
      expectedSalary: {
        type: "number",
        widget: "number",
        title: "fields.expectedSalary",
        unit: "fields.lpa",
        unitPosition: "end",
        minimum: 0,
        grid: { size: { xs: 12, md: 6 } },
      },
      skillSet: {
        type: "array",
        widget: "chips",
        title: "fields.skillSet",
        placeholder: "fields.skillSetPlaceholder",
        grid: { size: { xs: 12 } },
      },
      additionalInfo: {
        type: "string",
        widget: "textarea",
        rows: 4,
        title: "fields.additionalInfo",
        placeholder: "fields.additionalInfoPlaceholder",
        maxLength: 5000,
        grid: { size: { xs: 12 } },
      },
      // ── Social links ──
      linkedin: {
        type: "string",
        title: "fields.linkedin",
        placeholder: "fields.linkedinPlaceholder",
        maxLength: 255,
        grid: { size: { xs: 12, md: 6 } },
      },
      twitter: {
        type: "string",
        title: "fields.twitter",
        placeholder: "fields.twitterPlaceholder",
        maxLength: 100,
        grid: { size: { xs: 12, md: 6 } },
      },
      // ── Educational details (repeater) ──
      education: {
        type: "array",
        widget: "repeater",
        title: "sections.education",
        hideLabel: true,
        addLabel: "fields.addEducation",
        itemSchema: {
          degree: { type: "string", title: "fields.degree", grid: { size: { xs: 12, md: 6 } } },
          institution: {
            type: "string",
            title: "fields.institution",
            grid: { size: { xs: 12, md: 6 } },
          },
          fieldOfStudy: {
            type: "string",
            title: "fields.fieldOfStudy",
            grid: { size: { xs: 12, md: 6 } },
          },
          year: { type: "string", title: "fields.year", grid: { size: { xs: 12, md: 6 } } },
        },
        grid: { size: { xs: 12 } },
      },
      // ── Experience details (repeater) ──
      experience: {
        type: "array",
        widget: "repeater",
        title: "sections.experience",
        hideLabel: true,
        addLabel: "fields.addExperience",
        itemSchema: {
          company: { type: "string", title: "fields.company", grid: { size: { xs: 12, md: 6 } } },
          jobTitle: { type: "string", title: "fields.jobTitle", grid: { size: { xs: 12, md: 6 } } },
          from: {
            type: "string",
            widget: "date",
            title: "fields.from",
            grid: { size: { xs: 12, md: 6 } },
          },
          to: {
            type: "string",
            widget: "date",
            title: "fields.to",
            grid: { size: { xs: 12, md: 6 } },
          },
          current: {
            type: "boolean",
            widget: "checkbox",
            title: "fields.currentlyWorkHere",
            grid: { size: { xs: 12 } },
          },
        },
        grid: { size: { xs: 12 } },
      },
      // ── Attachments (others) ──
      attachments: {
        type: "array",
        widget: "attachments",
        title: "fields.others",
        uploadLabel: "fields.attachmentsBrowse",
        accept: "application/pdf,.doc,.docx,.xls,.xlsx,image/jpeg,image/png",
        maxSizeMb: 20,
        grid: { size: { xs: 12, md: 6 } },
      },
      // ── Upload resume (side, filled) ──
      resume: {
        type: "array",
        widget: "attachments",
        title: "fields.resume",
        uploadLabel: "fields.attachmentsBrowse",
        accept: "application/pdf,.doc,.docx",
        maxSizeMb: 20,
        grid: { size: { xs: 12 } },
      },
      // ── Associate to job (side) ──
      jobId: {
        type: "string",
        widget: "select",
        title: "fields.job",
        placeholder: "fields.jobPlaceholder",
        optionSource: { url: "/jobs", path: "data", valueKey: "id", labelKey: "title" },
        grid: { size: { xs: 12 } },
      },
      startingStage: {
        type: "string",
        widget: "select",
        title: "fields.startingStage",
        enum: ["sourced", "screening", "submitted", "interview", "offer"],
        condition: { field: "jobId", notEquals: "" },
        grid: { size: { xs: 12 } },
      },
      // ── Other info (side) ──
      status: {
        type: "string",
        widget: "select",
        title: "fields.status",
        enum: ["active", "placed", "on_hold", "rejected"],
        default: "active",
        grid: { size: { xs: 12 } },
      },
      ownerId: {
        type: "string",
        widget: "select",
        avatar: true,
        title: "fields.owner",
        placeholder: "fields.ownerPlaceholder",
        optionSource: { url: "/users", path: "data", valueKey: "id", labelKey: "name" },
        grid: { size: { xs: 12 } },
      },
      source: {
        type: "string",
        widget: "select",
        title: "fields.source",
        enum: ["added_by_user", "referral", "inbound", "outbound", "event"],
        grid: { size: { xs: 12 } },
      },
    },
    required: ["firstName"],
    errorMessage: { required: { firstName: "fields.firstNameRequired" } },
  },
  sections: [
    {
      grid: { size: { xs: 12, md: 8 } },
      sections: [
        {
          title: "sections.basicInfo",
          gridContainer: { columns: 12, spacing: 2 },
          fields: [
            "firstName",
            "lastName",
            "email",
            "secondaryEmail",
            "phone",
            "mobile",
            "website",
          ],
        },
        {
          title: "sections.address",
          gridContainer: { columns: 12, spacing: 2 },
          fields: ["street", "city", "state", "postalCode", "country"],
        },
        {
          title: "sections.professional",
          gridContainer: { columns: 12, spacing: 2 },
          fields: [
            "experienceYears",
            "highestQualification",
            "currentJobTitle",
            "currentEmployer",
            "currentSalary",
            "expectedSalary",
            "skillSet",
            "additionalInfo",
          ],
        },
        {
          title: "sections.social",
          gridContainer: { columns: 12, spacing: 2 },
          fields: ["linkedin", "twitter"],
        },
        {
          title: "sections.education",
          gridContainer: { columns: 12, spacing: 2 },
          fields: ["education"],
        },
        {
          title: "sections.experience",
          gridContainer: { columns: 12, spacing: 2 },
          fields: ["experience"],
        },
        {
          title: "sections.attachments",
          gridContainer: { columns: 12, spacing: 2 },
          fields: ["attachments"],
        },
      ],
    },
    {
      grid: { size: { xs: 12, md: 4 } },
      sticky: true,
      sections: [
        {
          title: "sections.uploadResume",
          variant: "filled",
          icon: "upload-file",
          gridContainer: { columns: 12, spacing: 2 },
          fields: ["resume"],
        },
        {
          title: "sections.associateJob",
          gridContainer: { columns: 12, spacing: 2 },
          fields: ["jobId", "startingStage"],
        },
        {
          title: "sections.otherInfo",
          gridContainer: { columns: 12, spacing: 2 },
          fields: ["status", "ownerId", "source"],
        },
      ],
    },
  ],
  sectionsContainer: { gridContainer: { columns: 12, spacing: 2 } },
  listRouteId: "Recruit.Candidates.Route",
};
