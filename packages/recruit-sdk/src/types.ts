import type { GridProps } from "@mui/material/Grid";
import type { ComponentType, ReactNode } from "react";

export interface RouteGuard {
  type: string;
}

export type RouteGuardFn = () => void | Promise<void>;

/**
 * The verb half of a permission key. Deliberately open: `canAccess` does plain
 * set-membership on these strings, and the vocabulary belongs to the app
 * (`@recruit/types`), not to the engine. Keeping it closed here would mean
 * every new domain verb had to be declared twice.
 */
export type AccessAction = string;

/** Declarative access rule attachable to routes, page/layout elements and
 * component configs. `action` defaults to ["read"]; `attributes` adds
 * ABAC checks against the user's attributes (e.g. { role: ["lead"] }). */
export interface AccessRule {
  resource: string;
  action?: AccessAction[];
  attributes?: Record<string, unknown[]>;
}

/** The current user's access context, supplied by the app's accessResolver. */
export interface AccessContext {
  attributes: Record<string, unknown>;
  permissions: Record<string, AccessAction[]>;
}

export interface Route {
  id: string;
  path: string;
  layout?: string;
  page?: string;
  slot?: string;
  guard?: RouteGuard[];
  access?: AccessRule;
  children: string[];
}

export type GridSize = GridProps["size"];

export interface LayoutElement {
  id: string;
  type: "component" | "outlet" | "slot" | "configuration";
  position?: string;
  componentType?: string;
  configurationId?: string;
  name?: string;
  gridItem?: Pick<GridProps, "size" | "offset">;
  prefetch?: boolean;
  sx?: Record<string, unknown>;
  access?: AccessRule;
}

export interface Configuration {
  id: string;
  template?: "core" | "auth" | "custom";
  elements: LayoutElement[];
  gridContainer?: Pick<GridProps, "spacing" | "direction"> & {
    /** Explicit CSS grid tracks, for a layout a 12-column ratio cannot state —
     * the design pins the dashboard's context column at exactly 380px. Children
     * fall into the tracks in source order and their `gridItem` is ignored. */
    templateColumns?: string;
  };
  stackContainer?: { spacing?: number; direction?: "column" | "row" };
}

export interface ConfigurationExportModel {
  id: string;
  type: "CONFIGURATION";
  displayName?: string;
  value: unknown;
}

export interface SchemaExportModel {
  id: string;
  type: "SCHEMA";
  displayName?: string;
  value: { permissions?: string[] } & Record<string, unknown>;
}

export interface DatasourceInstance {
  // biome-ignore lint/suspicious/noExplicitAny: datasource methods take arbitrary query args and return arbitrary payloads.
  [method: string]: (...args: any[]) => Promise<unknown>;
}

export type DatasourceFactory = () => DatasourceInstance | (() => DatasourceInstance);

export interface DatasourceExportModel {
  id: string;
  type: "DATASOURCE";
  displayName?: string;
  value: DatasourceFactory;
}

export interface TranslationExportModel {
  id: string;
  type?: "TRANSLATION";
  displayName?: string;
  value: unknown;
}

export interface ComponentDefaults {
  configuration?: ConfigurationExportModel;
  schema?: SchemaExportModel;
  datasource?: DatasourceExportModel;
  translation?: TranslationExportModel;
}

export interface ComponentExportModel {
  id: string;
  type: "COMPONENT";
  resource?: string;
  displayName?: string;
  // biome-ignore lint/suspicious/noExplicitAny: components accept engine-injected props of any shape.
  value: ComponentType<any>;
  defaults?: ComponentDefaults;
}

export interface ComponentDependency {
  id: string;
  type: "CONFIGURATION" | "DATASOURCE" | "TRANSLATION" | "SCHEMA";
  value: unknown;
}

export interface ComponentDefinition {
  id: string;
  type: string;
  resource?: string;
  displayName?: string;
  // biome-ignore lint/suspicious/noExplicitAny: components accept engine-injected props of any shape.
  value: ComponentType<any>;
  defaults?: ComponentDefaults;
  default?: {
    configuration?: ComponentDependency;
    datasource?: ComponentDependency;
    translation?: ComponentDependency;
    schema?: ComponentDependency;
  };
}

export interface Module {
  id: string;
  components: ComponentDefinition[];
}

export interface RenderTree {
  layouts: Configuration[];
  page: Configuration | null;
  slots: { [key: string]: RenderTree | null };
}

export interface InjectedComponentProps {
  id: string;
  configuration: Record<string, unknown>;
  data: Record<string, unknown>;
  translation: Record<string, unknown>;
  schema?: Record<string, unknown>;
  currentRoute: Route | null;
}

export type ReactChildren = ReactNode;
