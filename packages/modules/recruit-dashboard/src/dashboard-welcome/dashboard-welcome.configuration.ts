import type { LinkRendererConfig } from "@recruit/shared";

/** A "You have …" summary chip. `label` is a translation key interpolated with
 * the whole summary row; `path` is the count that decides whether it shows. */
export interface WelcomeHighlight {
  path: string;
  label: string;
  icon: string;
  /** `accent` is the orange soft pill, `warning` the amber one. */
  tone?: "accent" | "neutral" | "warning";
  link?: LinkRendererConfig;
}

export interface DashboardWelcomeConfig {
  /** Greeting keys picked by local hour; see the component's GREETINGS map. */
  greeting: { morning: string; afternoon: string; evening: string };
  lead: string;
  emptyLead: string;
  highlights: WelcomeHighlight[];
}

export const DashboardWelcomeConfiguration: DashboardWelcomeConfig = {
  greeting: {
    morning: "greeting.morning",
    afternoon: "greeting.afternoon",
    evening: "greeting.evening",
  },
  lead: "lead",
  emptyLead: "emptyLead",
  highlights: [
    {
      path: "interviews",
      label: "highlights.interviews",
      icon: "event",
      tone: "accent",
      link: {
        id: "Recruit.DashboardWelcome.Component",
        linkType: "route",
        routeId: "Recruit.Interviews.Route",
        target: "_self",
        color: "inherit",
        underline: "none",
      },
    },
    {
      path: "submissions",
      label: "highlights.submissions",
      icon: "send",
      link: {
        id: "Recruit.DashboardWelcome.Component",
        linkType: "route",
        routeId: "Recruit.Pipeline.Route",
        target: "_self",
        color: "inherit",
        underline: "none",
      },
    },
    {
      path: "resumesToReview",
      label: "highlights.resumes",
      icon: "description",
      link: {
        id: "Recruit.DashboardWelcome.Component",
        linkType: "route",
        routeId: "Recruit.Candidates.Route",
        target: "_self",
        color: "inherit",
        underline: "none",
      },
    },
    {
      path: "clientsAtRisk",
      label: "highlights.clientsAtRisk",
      icon: "warning",
      tone: "warning",
      link: {
        id: "Recruit.DashboardWelcome.Component",
        linkType: "route",
        routeId: "Recruit.Clients.Route",
        target: "_self",
        color: "inherit",
        underline: "none",
      },
    },
  ],
};
