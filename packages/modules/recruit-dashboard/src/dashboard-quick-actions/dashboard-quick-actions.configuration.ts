import type { QuickActionsRendererConfig } from "@recruit/shared";

const link = (routeId: string) => ({
  id: "Recruit.DashboardQuickActions.Component",
  linkType: "route" as const,
  routeId,
  underline: "none" as const,
  color: "inherit",
});

/**
 * The design gives every role its own action row. Rather than seven lists, this
 * is one list where each entry carries the permission that action needs — the
 * engine strips the rest before the component renders, so a recruiter sees
 * "Add candidate" and an admin sees "Invite member" without anything here
 * testing who is looking.
 */
export const DashboardQuickActionsConfiguration: QuickActionsRendererConfig = {
  title: "title",
  actions: [
    {
      label: "newJob",
      icon: "add-box",
      tone: "primary",
      link: link("Recruit.JobNew.Route"),
      access: { resource: "jobs", action: ["create"] },
    },
    {
      label: "addCandidate",
      icon: "person-add",
      tone: "info",
      link: link("Recruit.CandidateNew.Route"),
      access: { resource: "candidates", action: ["create"] },
    },
    {
      label: "addClient",
      icon: "domain-add",
      tone: "success",
      link: link("Recruit.ClientNew.Route"),
      access: { resource: "clients", action: ["manage"] },
    },
    {
      label: "scheduleInterview",
      icon: "event",
      tone: "violet",
      link: link("Recruit.Candidates.Route"),
      access: { resource: "interviews", action: ["create"] },
    },
    {
      label: "reviewQueue",
      icon: "rate-review",
      tone: "warning",
      link: link("Recruit.Candidates.Route"),
      access: { resource: "submissions", action: ["review"] },
    },
    {
      label: "inviteMember",
      icon: "group-add",
      tone: "primary",
      link: link("Recruit.SettingsMembers.Route"),
      access: { resource: "members", action: ["invite"] },
    },
  ],
};
