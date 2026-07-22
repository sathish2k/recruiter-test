export interface IntegrationItem {
  /** Stable key — this is what the API stores as `provider`. */
  key: string;
  name: string;
  /** Square logo tile text from the design. */
  mark: string;
  /** The provider's own brand colours for that tile — background, mark colour
   * and edge. These are brand assets, not theme tokens, so they're literals. */
  bg: string;
  fg: string;
  border: string;
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
          bg: "#0A66C2",
          fg: "#fff",
          border: "rgba(255,255,255,.15)",
          description: "descriptions.linkedin",
          direction: "two-way",
        },
        {
          key: "naukri",
          name: "Naukri",
          mark: "n.",
          bg: "#fff",
          fg: "#4A2FBF",
          border: "rgba(0,0,0,.1)",
          description: "descriptions.naukri",
          direction: "pull",
        },
        {
          key: "indeed",
          name: "Indeed",
          mark: "id",
          bg: "#fff",
          fg: "#2557A7",
          border: "rgba(0,0,0,.1)",
          description: "descriptions.indeed",
          direction: "pull",
        },
        {
          key: "monster",
          name: "Monster",
          mark: "M",
          bg: "#fff",
          fg: "#6E46AE",
          border: "rgba(0,0,0,.1)",
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
          bg: "#fff",
          fg: "#EA4335",
          border: "rgba(0,0,0,.1)",
          description: "descriptions.gmail",
          direction: "two-way",
        },
        {
          key: "outlook",
          name: "Outlook",
          mark: "O",
          bg: "#fff",
          fg: "#0F6CBD",
          border: "rgba(0,0,0,.1)",
          description: "descriptions.outlook",
          direction: "two-way",
        },
        {
          key: "mailjet",
          name: "Mailjet",
          mark: "MJ",
          bg: "#fff",
          fg: "#F2A20C",
          border: "rgba(0,0,0,.1)",
          description: "descriptions.mailjet",
          direction: "push",
        },
        {
          key: "slack",
          name: "Slack",
          mark: "S",
          bg: "#4A154B",
          fg: "#fff",
          border: "rgba(255,255,255,.15)",
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
          bg: "#fff",
          fg: "#4285F4",
          border: "rgba(0,0,0,.1)",
          description: "descriptions.googleCalendar",
          direction: "two-way",
        },
        {
          key: "outlook-calendar",
          name: "Outlook Calendar",
          mark: "OC",
          bg: "#fff",
          fg: "#0F6CBD",
          border: "rgba(0,0,0,.1)",
          description: "descriptions.outlookCalendar",
          direction: "two-way",
        },
        {
          key: "zoom",
          name: "Zoom",
          mark: "Z",
          bg: "#fff",
          fg: "#2D8CFF",
          border: "rgba(0,0,0,.1)",
          description: "descriptions.zoom",
          direction: "push",
        },
        {
          key: "teams",
          name: "Microsoft Teams",
          mark: "T",
          bg: "#fff",
          fg: "#6264A7",
          border: "rgba(0,0,0,.1)",
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
          bg: "#20201E",
          fg: "#ECEAE7",
          border: "rgba(255,255,255,.18)",
          description: "descriptions.openrouter",
          direction: "push",
        },
        {
          key: "openai",
          name: "OpenAI",
          mark: "AI",
          bg: "#20201E",
          fg: "#ECEAE7",
          border: "rgba(255,255,255,.18)",
          description: "descriptions.openai",
          direction: "push",
        },
        {
          key: "anthropic",
          name: "Anthropic",
          mark: "A",
          bg: "#20201E",
          fg: "#D97757",
          border: "rgba(255,255,255,.18)",
          description: "descriptions.anthropic",
          direction: "push",
        },
        {
          key: "gemini",
          name: "Gemini",
          mark: "Ge",
          bg: "#20201E",
          fg: "#9EC7F0",
          border: "rgba(255,255,255,.18)",
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
          bg: "#fff",
          fg: "#34A853",
          border: "rgba(0,0,0,.1)",
          description: "descriptions.googleDrive",
          direction: "push",
        },
        {
          key: "onedrive",
          name: "OneDrive",
          mark: "OD",
          bg: "#fff",
          fg: "#0F6CBD",
          border: "rgba(0,0,0,.1)",
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
          bg: "#fff",
          fg: "#F68D2E",
          border: "rgba(0,0,0,.1)",
          description: "descriptions.workday",
          direction: "push",
        },
        {
          key: "greenhouse",
          name: "Greenhouse",
          mark: "GH",
          bg: "#fff",
          fg: "#24A47F",
          border: "rgba(0,0,0,.1)",
          description: "descriptions.greenhouse",
          direction: "push",
        },
        {
          key: "lever",
          name: "Lever",
          mark: "L",
          bg: "#fff",
          fg: "#FC5D5D",
          border: "rgba(0,0,0,.1)",
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
          bg: "#20201E",
          fg: "#9A968E",
          border: "rgba(255,255,255,.18)",
          description: "descriptions.webhooks",
          direction: "push",
        },
        {
          key: "zapier",
          name: "Zapier",
          mark: "Z",
          bg: "#fff",
          fg: "#FF4A00",
          border: "rgba(0,0,0,.1)",
          description: "descriptions.zapier",
          direction: "two-way",
        },
        {
          key: "api-keys",
          name: "API keys",
          mark: "API",
          bg: "#20201E",
          fg: "#9A968E",
          border: "rgba(255,255,255,.18)",
          description: "descriptions.apiKeys",
          direction: "push",
        },
      ],
    },
  ],
};
