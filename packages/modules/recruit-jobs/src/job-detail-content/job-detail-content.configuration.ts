import type { CollapsibleSectionConfig } from "@recruit/shared";

/** The body of the requirement, as the design folds it: the description open,
 * the two lists closed, and the skills last. */
export const JobDetailContentConfiguration: CollapsibleSectionConfig[] = [
  {
    title: "sections.description",
    path: "description",
    kind: "markdown",
    defaultOpen: true,
    emptyText: "empty.description",
  },
  {
    title: "sections.qualifications",
    path: "requirements",
    kind: "bullets",
    showCount: true,
    defaultOpen: false,
    emptyText: "empty.qualifications",
  },
  {
    title: "sections.responsibilities",
    path: "benefits",
    kind: "bullets",
    showCount: true,
    defaultOpen: false,
    emptyText: "empty.responsibilities",
  },
  {
    title: "sections.skills",
    path: "skills",
    kind: "chips",
    showCount: true,
    defaultOpen: true,
    emptyText: "empty.skills",
  },
  {
    title: "sections.niceToHave",
    path: "niceToHaveSkills",
    kind: "chips",
    showCount: true,
    defaultOpen: false,
    emptyText: "empty.niceToHave",
  },
];
