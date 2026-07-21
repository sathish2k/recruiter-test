import type { AccessRule, Route } from "@recruit/sdk";

export interface AppbarMenuItem {
  label: string;
  icon?: string;
  routeId?: string;
  action?: "logout";
  danger?: boolean;
  access?: AccessRule;
}

export interface AppbarLanguage {
  code: string;
  label: string;
}

export interface AppbarAction {
  icon?: string;
  routeId?: string;
  badge?: boolean;
  kind?: "avatar" | "theme" | "language";
  label?: string;
  menu?: AppbarMenuItem[];
  languages?: AppbarLanguage[];
}

export interface AppbarConfig {
  titles: Record<string, string>;
  actions: AppbarAction[];
}

export interface AppbarComponentProps {
  id: string;
  configuration?: Partial<AppbarConfig>;
  currentRoute?: Route | null;
}
