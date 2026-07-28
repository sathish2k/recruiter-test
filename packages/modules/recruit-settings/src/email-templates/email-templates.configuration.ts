export interface EmailTemplatesConfiguration {
  /** Filing order of the template list. `keys` are template keys; anything
   * unmatched falls into the trailing CUSTOM group. */
  categories: { label: string; icon: string; keys: string[] }[];
  /** Order the variable picker groups its options in. */
  variableGroups: { label: string; variables: string[] }[];
  /** Sample values used to render the live preview; editable on screen. */
  sample: Record<string, string>;
  /** The From line shown in the preview's inbox header — the product, not the
   * agency, matching what the sent email's header lockup shows. */
  fromName: string;
  fromEmail: string;
  /** Postal line in the email footer — required by CAN-SPAM/GDPR. */
  postalAddress: string;
  /** Body toolbar: each button appends its fragment at the caret. */
  toolbar: { icon: string; label: string; fragment: string }[];
  /** AI rewrite chips; `action` is the key the API dispatches on. */
  aiActions: { action: string; label: string }[];
}

export const EmailTemplatesConfiguration: EmailTemplatesConfiguration = {
  categories: [
    { label: "categories.authentication", icon: "lock", keys: ["verify", "forgot", "invite"] },
    { label: "categories.recruitment", icon: "group", keys: ["jd", "interview"] },
    { label: "categories.clients", icon: "domain", keys: ["submission"] },
    { label: "categories.offers", icon: "description", keys: ["offer"] },
  ],
  variableGroups: [
    { label: "variableGroups.candidate", variables: ["candidate_name", "match_score"] },
    { label: "variableGroups.client", variables: ["client", "client_contact"] },
    {
      label: "variableGroups.job",
      variables: ["role", "salary_range", "ctc", "join_date", "date", "time", "mode"],
    },
    { label: "variableGroups.recruiter", variables: ["name", "inviter", "sourcer"] },
    { label: "variableGroups.workspace", variables: ["workspace", "expiry_minutes", "code"] },
  ],
  sample: {
    name: "Dev Shah",
    inviter: "Riya Kapoor",
    role: "Senior Backend Engineer",
    workspace: "Troy Consulting",
    expiry_minutes: "30",
    code: "482915",
    candidate_name: "Savannah Nguyen",
    client: "Nortech",
    salary_range: "$150–180k",
    sourcer: "Dev",
    date: "Jul 12",
    time: "2:00 PM IST",
    mode: "Zoom",
    client_contact: "Tom Weaver",
    match_score: "94%",
    ctc: "$165,000",
    join_date: "Jul 15",
    action_url: "https://app.troyconsulting.com/verify?token=1f9c4e",
  },
  fromName: "HirePilotX",
  fromEmail: "no-reply@hirepilotx.com",
  postalAddress: "Troy Consulting · 14 Prescott Road, Bengaluru 560001",
  toolbar: [
    { icon: "bold", label: "toolbar.bold", fragment: "**bold**" },
    { icon: "italic", label: "toolbar.italic", fragment: "_italic_" },
    { icon: "link", label: "toolbar.link", fragment: "{action_url}" },
    { icon: "list-bulleted", label: "toolbar.bullet", fragment: "\n• " },
    { icon: "horizontal-rule", label: "toolbar.divider", fragment: "\n\n— — —\n\n" },
  ],
  aiActions: [
    { action: "improve", label: "ai.improve" },
    { action: "shorten", label: "ai.shorten" },
    { action: "professional", label: "ai.professional" },
    { action: "rewrite", label: "ai.rewrite" },
  ],
};
