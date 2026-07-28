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
    properties: {
      timezone: {
        type: "string",
        widget: "choice-chips",
        title: "basics.timezone.title",
        help: "basics.timezone.hint",
        helpPlacement: "above",
        choices: [
          { value: "Asia/Kolkata", label: "Asia/Kolkata", meta: "IST · UTC+5:30" },
          { value: "Asia/Dubai", label: "Asia/Dubai", meta: "UTC+4" },
          { value: "Europe/London", label: "Europe/London", meta: "UTC+1" },
          { value: "America/New_York", label: "New York", meta: "UTC−4" },
          { value: "Asia/Singapore", label: "Singapore", meta: "UTC+8" },
        ],
      },
      timezoneNote: {
        type: "string",
        widget: "callout",
        variant: "banner",
        hideLabel: true,
        tone: "info",
        help: "basics.timezone.more",
      },
      currency: {
        type: "string",
        widget: "choice-chips",
        title: "basics.currency.title",
        help: "basics.currency.hint",
        helpPlacement: "above",
        choices: [
          { value: "INR", label: "basics.currency.inr", symbol: "₹" },
          { value: "USD", label: "basics.currency.usd", symbol: "$" },
          { value: "GBP", label: "basics.currency.gbp", symbol: "£" },
          { value: "AED", label: "basics.currency.aed", symbol: "د.إ" },
        ],
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
        widget: "choice-chips",
        choiceLayout: "stacked",
        title: "basics.dateFormat.title",
        choices: [
          { value: "DD/MM/YYYY", label: "DD/MM/YYYY", meta: "22/06/2026" },
          { value: "MM/DD/YYYY", label: "MM/DD/YYYY", meta: "06/22/2026" },
          { value: "YYYY-MM-DD", label: "YYYY-MM-DD", meta: "2026-06-22" },
        ],
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
