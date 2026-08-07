export interface ThemeOption {
  value: "light" | "dark";
  icon: string;
  label: string;
}

export interface UiPref {
  key: string;
  label: string;
  description: string;
}

export interface AppearanceConfiguration {
  themeOptions: ThemeOption[];
  accents: string[];
  uiPrefs: UiPref[];
}

export const AppearanceConfiguration: AppearanceConfiguration = {
  themeOptions: [
    { value: "light", icon: "light-mode", label: "theme.light" },
    { value: "dark", icon: "dark-mode", label: "theme.dark" },
  ],
  accents: ["#0E2E5C", "#F59E0B", "#00B8D9", "#22C55E"],
  uiPrefs: [
    { key: "compact", label: "prefs.compact.label", description: "prefs.compact.description" },
    { key: "sidebar", label: "prefs.sidebar.label", description: "prefs.sidebar.description" },
  ],
};
