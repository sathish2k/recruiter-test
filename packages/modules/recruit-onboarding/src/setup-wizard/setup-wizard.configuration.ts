import type { JsonSchema, LinkRendererConfig } from "@recruit/shared";

/**
 * One schema per editable step. The wizard renders each with a FormRenderer,
 * so the fields, their validation and their widgets are configuration — the
 * component only owns the rail, the copy and where the buttons sit.
 *
 * The review step has no schema: it renders what the other four saved.
 */
const steps: Record<string, JsonSchema> = {
  basics: {
    type: "object",
    // Same controls, same catalogues as Settings → Workspace. Anything the
    // wizard offers here has to round-trip through that screen afterwards, so
    // a shorter bespoke list would only invent values Settings cannot show.
    properties: {
      timezone: {
        type: "string",
        widget: "select",
        title: "basics.timezone.title",
        help: "basics.timezone.hint",
        helpPlacement: "above",
        optionSource: { url: "/reference", path: "data.timezones" },
      },
      currency: {
        type: "string",
        widget: "select",
        title: "basics.currency.title",
        help: "basics.currency.hint",
        helpPlacement: "above",
        optionSource: { url: "/reference", path: "data.currencies" },
      },
      currencyNote: {
        type: "string",
        widget: "callout",
        variant: "banner",
        hideLabel: true,
        tone: "warning",
        icon: "info",
        help: "basics.currency.warning",
      },
      dateFormat: {
        type: "string",
        title: "basics.dateFormat.title",
        enum: ["DD MMM YYYY", "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"],
        grid: { size: { xs: 12, md: 6 } },
      },
      timeFormat: {
        type: "string",
        title: "basics.timeFormat.title",
        enum: ["12-hour (2:30 PM)", "24-hour (14:30)"],
        grid: { size: { xs: 12, md: 6 } },
      },
    },
  },

  stages: {
    type: "object",
    properties: {
      stages: {
        type: "array",
        widget: "stage-list",
        title: "stages.heading",
        labelHint: "stages.eyeHint",
        placeholder: "stages.namePlaceholder",
        addLabel: "stages.add",
      },
      stagesNote: {
        type: "string",
        widget: "callout",
        variant: "banner",
        hideLabel: true,
        tone: "info",
        icon: "info",
        help: "stages.fixedNote",
      },
    },
  },

  reasons: {
    type: "object",
    properties: {
      reasonsCount: {
        type: "string",
        widget: "selection-count",
        title: "reasons.active",
        labelHint: "reasons.untick",
        countFields: ["reasonsClient", "reasonsCandidate", "reasonsInternal", "reasonsCustom"],
      },
      reasonsClient: {
        type: "array",
        widget: "choice-chips",
        icon: "domain",
        title: "reasons.groups.client.label",
        labelHint: "reasons.groups.client.hint",
        enum: [
          "Skills gap",
          "Budget mismatch",
          "Wants more domain experience",
          "Position on hold",
          "Filled internally",
        ],
      },
      reasonsCandidate: {
        type: "array",
        widget: "choice-chips",
        icon: "person",
        iconColor: "surface.successFg",
        title: "reasons.groups.candidate.label",
        labelHint: "reasons.groups.candidate.hint",
        enum: [
          "Counter-offer accepted",
          "Compensation too low",
          "Location or commute",
          "Took another offer",
          "Lost interest",
        ],
      },
      reasonsInternal: {
        type: "array",
        widget: "choice-chips",
        icon: "filter",
        iconColor: "surface.infoFg",
        title: "reasons.groups.internal.label",
        labelHint: "reasons.groups.internal.hint",
        enum: [
          "Unrealistic expectations",
          "Notice period too long",
          "Communication",
          "Off-limits / non-solicit",
        ],
      },
      reasonsCustom: {
        type: "array",
        widget: "chips",
        title: "reasons.addOwn",
        help: "reasons.why",
        placeholder: "reasons.placeholder",
      },
    },
  },

  team: {
    type: "object",
    properties: {
      invites: {
        type: "array",
        widget: "invite-list",
        title: "team.heading",
        labelHint: "team.seats",
        placeholder: "team.emailPlaceholder",
        addLabel: "team.addAnother",
        choices: [
          { value: "Admin", label: "Admin" },
          { value: "Profile lead", label: "Profile lead" },
          { value: "Sourcer", label: "Sourcer" },
          { value: "Finance", label: "Finance" },
        ],
      },
    },
  },
};

const links: Record<string, LinkRendererConfig> = {
  dashboard: { routeId: "Recruit.Root", underline: "none" },
};

/** The roles an invite can carry, in the order the picker offers them. */
const roles = ["Admin", "Profile lead", "Sourcer", "Finance"];

export const SetupWizardConfiguration = { steps, links, roles };
