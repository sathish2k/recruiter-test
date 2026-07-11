import type {
  ComponentDefinition,
  ConfigurationExportModel,
  DatasourceExportModel,
  Module,
  TranslationExportModel,
} from "@recruit/sdk";
import {
  CandidatesTable,
  DemoAppBar,
  DemoSidebar,
  InfoPanel,
  RoleDetail,
  SignInForm,
  StatCard,
  WelcomePanel,
} from "./library";

const cfg = (value: unknown): ConfigurationExportModel => ({
  id: "cfg",
  type: "CONFIGURATION",
  value,
});
const tr = (value: unknown): TranslationExportModel => ({
  id: "tr",
  type: "TRANSLATION",
  value,
});
const ds = (get: () => Promise<unknown>): DatasourceExportModel => ({
  id: "ds",
  type: "DATASOURCE",
  value: () => ({ get }),
});

const comp = (
  id: string,
  // biome-ignore lint/suspicious/noExplicitAny: engine components accept injected props of any shape.
  value: any,
  defaults?: ComponentDefinition["defaults"],
): ComponentDefinition => ({ id, type: "COMPONENT", value, defaults });

const panel = (id: string, label: string) =>
  comp(id, InfoPanel, { configuration: cfg({ label }) });

export const DEMO_MODULES: Module[] = [
  {
    id: "Docs.Demo.Module",
    components: [
      comp("Nav.Sidebar", DemoSidebar),
      comp("App.Bar", DemoAppBar, {
        configuration: cfg({ title: "Dashboard" }),
      }),
      comp("Home.Welcome", WelcomePanel, {
        configuration: cfg({ title: "AI Recruiter" }),
        translation: tr({ subtitle: "Config-driven engine is live." }),
      }),
      comp("Candidates.Table", CandidatesTable),
      comp("Role.Detail", RoleDetail),
      comp("Auth.SignInForm", SignInForm, {
        configuration: cfg({ title: "Welcome back" }),
      }),
      comp("Stat.Live", StatCard, {
        configuration: cfg({ label: "Active candidates" }),
        datasource: ds(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ value: 128 }), 400),
            ),
        ),
      }),
      panel("Panel.Kpis", "KPIs"),
      panel("Panel.Chart", "Chart"),
      panel("Panel.Recent", "Recent activity"),
      panel("Panel.Profile", "Profile"),
      panel("Panel.Security", "Security"),
      panel("Panel.OpenRoles", "Open roles"),
      panel("Panel.ActiveCands", "Active candidates"),
    ],
  },
];
