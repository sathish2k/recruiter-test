export interface IntegrationItem {
  /** Stable key — this is what the API stores as `provider`. */
  key: string;
  name: string;
  /** Square logo tile text from the design. */
  mark: string;
  /** Translation key for the "not connected" blurb. */
  description: string;
  /** Default sync direction applied when connecting. */
  direction: "two-way" | "pull" | "push";
}

export interface IntegrationGroup {
  key: string;
  label: string;
  icon: string;
  badge?: string;
  items: IntegrationItem[];
}

export interface IntegrationsConfig {
  groups: IntegrationGroup[];
  /** Account the connect flow attributes the link to. */
  connectHint: string;
}

/** The catalogue: names, marks, blurbs and grouping. Connection state comes
 * from the API and is merged onto this by the component. */
export const IntegrationsConfiguration: IntegrationsConfig = {
  connectHint: "detail.connectHint",
  groups: [
    {
      key: "sourcing",
      label: "groups.sourcing",
      icon: "person-search",
      items: [
        {
          key: "linkedin",
          name: "LinkedIn Recruiter",
          mark: "in",
          description: "descriptions.linkedin",
          direction: "two-way",
        },
        {
          key: "naukri",
          name: "Naukri",
          mark: "n.",
          description: "descriptions.naukri",
          direction: "pull",
        },
        {
          key: "indeed",
          name: "Indeed",
          mark: "id",
          description: "descriptions.indeed",
          direction: "pull",
        },
        {
          key: "monster",
          name: "Monster",
          mark: "M",
          description: "descriptions.monster",
          direction: "pull",
        },
      ],
    },
    {
      key: "communication",
      label: "groups.communication",
      icon: "mail",
      items: [
        {
          key: "gmail",
          name: "Gmail",
          mark: "M",
          description: "descriptions.gmail",
          direction: "two-way",
        },
        {
          key: "outlook",
          name: "Outlook",
          mark: "O",
          description: "descriptions.outlook",
          direction: "two-way",
        },
        {
          key: "mailjet",
          name: "Mailjet",
          mark: "MJ",
          description: "descriptions.mailjet",
          direction: "push",
        },
        {
          key: "slack",
          name: "Slack",
          mark: "S",
          description: "descriptions.slack",
          direction: "push",
        },
      ],
    },
    {
      key: "meetings",
      label: "groups.meetings",
      icon: "event",
      items: [
        {
          key: "google-calendar",
          name: "Google Calendar",
          mark: "G",
          description: "descriptions.googleCalendar",
          direction: "two-way",
        },
        {
          key: "outlook-calendar",
          name: "Outlook Calendar",
          mark: "OC",
          description: "descriptions.outlookCalendar",
          direction: "two-way",
        },
        {
          key: "zoom",
          name: "Zoom",
          mark: "Z",
          description: "descriptions.zoom",
          direction: "push",
        },
        {
          key: "teams",
          name: "Microsoft Teams",
          mark: "T",
          description: "descriptions.teams",
          direction: "push",
        },
      ],
    },
    {
      key: "ai",
      label: "groups.ai",
      icon: "sparkle",
      items: [
        {
          key: "openrouter",
          name: "OpenRouter",
          mark: "OR",
          description: "descriptions.openrouter",
          direction: "push",
        },
        {
          key: "openai",
          name: "OpenAI",
          mark: "AI",
          description: "descriptions.openai",
          direction: "push",
        },
        {
          key: "anthropic",
          name: "Anthropic",
          mark: "A",
          description: "descriptions.anthropic",
          direction: "push",
        },
        {
          key: "gemini",
          name: "Gemini",
          mark: "Ge",
          description: "descriptions.gemini",
          direction: "push",
        },
      ],
    },
    {
      key: "storage",
      label: "groups.storage",
      icon: "folder",
      items: [
        {
          key: "google-drive",
          name: "Google Drive",
          mark: "D",
          description: "descriptions.googleDrive",
          direction: "push",
        },
        {
          key: "onedrive",
          name: "OneDrive",
          mark: "OD",
          description: "descriptions.onedrive",
          direction: "push",
        },
      ],
    },
    {
      key: "hris",
      label: "groups.hris",
      icon: "corporate-fare",
      badge: "badges.enterprise",
      items: [
        {
          key: "workday",
          name: "Workday",
          mark: "W",
          description: "descriptions.workday",
          direction: "push",
        },
        {
          key: "greenhouse",
          name: "Greenhouse",
          mark: "GH",
          description: "descriptions.greenhouse",
          direction: "push",
        },
        {
          key: "lever",
          name: "Lever",
          mark: "L",
          description: "descriptions.lever",
          direction: "push",
        },
      ],
    },
    {
      key: "developer",
      label: "groups.developer",
      icon: "code",
      items: [
        {
          key: "webhooks",
          name: "Webhooks",
          mark: "{}",
          description: "descriptions.webhooks",
          direction: "push",
        },
        {
          key: "zapier",
          name: "Zapier",
          mark: "Z",
          description: "descriptions.zapier",
          direction: "two-way",
        },
        {
          key: "api-keys",
          name: "API keys",
          mark: "API",
          description: "descriptions.apiKeys",
          direction: "push",
        },
      ],
    },
  ],
};
