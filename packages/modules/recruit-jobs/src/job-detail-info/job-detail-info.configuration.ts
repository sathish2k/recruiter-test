/** One tile of the rail's fact grid. */
export interface JobInfoFact {
  key: string;
  icon: string;
  label: string;
  path: string;
  /** Translation namespace for an enum value — `<translate>.<value>`. */
  translate?: string;
}

export interface JobDetailInfoConfiguration {
  facts: JobInfoFact[];
}

/** The design's six facts, in its order. */
export const JobDetailInfoConfiguration: JobDetailInfoConfiguration = {
  facts: [
    { key: "created", icon: "event", label: "facts.created", path: "createdLabel" },
    { key: "openings", icon: "person-add", label: "facts.openings", path: "openings" },
    {
      key: "workModel",
      icon: "domain",
      label: "facts.workModel",
      path: "workModel",
      translate: "workModels",
    },
    {
      key: "experience",
      icon: "insights",
      label: "facts.experience",
      path: "workExperience",
      translate: "workExperience",
    },
    { key: "guarantee", icon: "verified-user", label: "facts.guarantee", path: "guarantee" },
    { key: "updated", icon: "history", label: "facts.updated", path: "updatedLabel" },
  ],
};
