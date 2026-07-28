import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { TabbedWorkspaceRenderer } from "@recruit/shared";
import { ContactDetailWorkspaceConfiguration } from "./contact-detail-workspace.configuration";
import { contactDetailWorkspaceDatasource } from "./contact-detail-workspace.datasource";
import fallbackTranslation from "./contact-detail-workspace.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ContactDetailWorkspace.Configuration",
  type: "CONFIGURATION",
  value: ContactDetailWorkspaceConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ContactDetailWorkspace.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.ContactDetailWorkspace.Datasource",
  type: "DATASOURCE",
  value: contactDetailWorkspaceDatasource,
};

export const CONTACT_DETAIL_WORKSPACE_COMPONENT: ComponentDefinition = {
  id: "Recruit.ContactDetailWorkspace.Component",
  type: "COMPONENT",
  value: TabbedWorkspaceRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
