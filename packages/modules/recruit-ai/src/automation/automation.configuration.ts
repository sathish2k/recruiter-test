export interface AutomationConfig {
  /** Icon shown in the accent "Impact this month" rail card header. */
  impactIcon: string;
  /** Icon for the "New automation" CTA. */
  addIcon: string;
}

export const AutomationConfiguration: AutomationConfig = {
  impactIcon: "insights",
  addIcon: "add",
};
