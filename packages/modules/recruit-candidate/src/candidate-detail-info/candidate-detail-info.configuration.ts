/** One line of the Details card: an icon and the fields joined onto it. */
export interface CandidateInfoRow {
  key: string;
  icon: string;
  /** Fields joined with "·"; blanks drop out, and the row with them. */
  paths: string[];
  as?: "text" | "email" | "phone" | "url";
  /** Translation namespace for an enum value. */
  translate?: string;
  /** Tints the icon — the design greens the compliance rows. */
  tone?: "success" | "warning" | "error";
}

export interface CandidateDetailInfoConfiguration {
  groups: { key: string; rows: CandidateInfoRow[] }[];
}

/** The design's three groups, in its order. */
export const CandidateDetailInfoConfiguration: CandidateDetailInfoConfiguration = {
  groups: [
    {
      key: "contact",
      rows: [
        { key: "email", icon: "mail", paths: ["email"], as: "email" },
        { key: "phone", icon: "call", paths: ["phone"], as: "phone" },
        { key: "linkedin", icon: "link", paths: ["linkedin"], as: "url" },
      ],
    },
    {
      key: "profile",
      rows: [
        { key: "location", icon: "location", paths: ["location", "openToRemote"] },
        {
          key: "availability",
          icon: "event",
          paths: ["availableFromLabel", "noticePeriod"],
        },
        {
          key: "salary",
          icon: "payments",
          paths: ["currentSalary", "expectedSalary"],
        },
        {
          key: "source",
          icon: "person-search",
          paths: ["source", "addedLabel"],
          translate: "sources",
        },
        {
          key: "workAuthorization",
          icon: "verified-user",
          paths: ["workAuthorization"],
          translate: "workAuthorizations",
        },
      ],
    },
    {
      key: "system",
      rows: [
        {
          key: "consent",
          icon: "fact-check",
          paths: ["consentAtLabel", "consentSource"],
          tone: "success",
        },
        {
          key: "offLimits",
          icon: "shield",
          paths: ["offLimitsUntilLabel"],
          tone: "warning",
        },
        { key: "doNotContact", icon: "person-off", paths: ["doNotContact"], tone: "error" },
      ],
    },
  ],
};
