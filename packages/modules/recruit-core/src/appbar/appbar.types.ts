import type { AccessRule, Route } from "@recruit/sdk";
import type { LinkRendererConfig } from "@recruit/shared";

export interface AppbarMenuItem {
  label: string;
  icon?: string;
  routeId?: string;
  action?: "logout";
  danger?: boolean;
  access?: AccessRule;
}

/** The avatar dropdown: an identity header, the workspace row, then the menu
 * sections (a divider is drawn between each). */
export interface AppbarAvatarMenu {
  sections: AppbarMenuItem[][];
  /** Role pill under the email. `labels` maps a user role to a translation key. */
  role?: { icon: string; labels: Record<string, string> };
  /** Workspace row; `seats` is a translation key interpolated with the org. */
  workspace?: { seats: string; routeId?: string; access?: AccessRule };
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
  menu?: AppbarAvatarMenu;
  languages?: AppbarLanguage[];
}

export interface AppbarConfig {
  titles: Record<string, string>;
  /** Route id → sub-heading under the title, as the design pairs them. */
  subtitles?: Record<string, string>;
  /** Per-route back link, shown on the left in place of the title (config-driven
   * via LinkRenderer). Keyed by route id; the target is the link's `routeId`. */
  back?: Record<string, LinkRendererConfig>;
  actions: AppbarAction[];
}

export interface AppbarComponentProps {
  id: string;
  configuration?: Partial<AppbarConfig>;
  currentRoute?: Route | null;
  data?: Record<string, unknown>;
}
