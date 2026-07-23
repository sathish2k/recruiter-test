import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { CalendarComponent } from "./calendar.component";
import { CalendarConfiguration } from "./calendar.configuration";
import { calendarDatasource } from "./calendar.datasource";
import fallbackTranslation from "./calendar.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ProfileCalendar.Configuration",
  type: "CONFIGURATION",
  value: CalendarConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ProfileCalendar.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.ProfileCalendar.Datasource",
  type: "DATASOURCE",
  value: calendarDatasource,
};

export const PROFILE_CALENDAR_COMPONENT: ComponentDefinition = {
  id: "Recruit.ProfileCalendar.Component",
  type: "COMPONENT",
  value: CalendarComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
