/** The prose card above the workspace. */
export interface ContactDetailBriefingConfiguration {
  icon: string;
  title: { name: string };
  footnote: { name: string };
}

export const ContactDetailBriefingConfiguration: ContactDetailBriefingConfiguration = {
  icon: "sparkle",
  title: { name: "briefing.title" },
  footnote: { name: "briefing.footnote" },
};
