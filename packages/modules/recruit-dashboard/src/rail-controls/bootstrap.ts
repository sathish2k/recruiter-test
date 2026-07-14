import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { RailControlsComponent } from "./rail-controls.component";
import fallbackTranslation from "./rail-controls.translations.json";

const RAIL_CONTROLS_CONFIGURATION: ComponentDependency = {
  id: "Recruit.RailControls.Configuration",
  type: "CONFIGURATION",
  value: { scheduleRouteId: "Recruit.Interviews.Route" },
};

const RAIL_CONTROLS_TRANSLATION: ComponentDependency = {
  id: "Recruit.RailControls.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const RAIL_CONTROLS_COMPONENT: ComponentDefinition = {
  id: "Recruit.RailControls.Component",
  type: "COMPONENT",
  value: RailControlsComponent,
  default: {
    configuration: RAIL_CONTROLS_CONFIGURATION,
    translation: RAIL_CONTROLS_TRANSLATION,
  },
};
