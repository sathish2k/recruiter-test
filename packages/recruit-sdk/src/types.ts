import type { GridProps } from "@mui/material/Grid";
import type { ComponentType, ReactNode } from "react";

export interface RouteGuard {
  type: string;
}

export type RouteGuardFn = () => void | Promise<void>;

export interface Route {
  id: string;
  path: string;
  layout?: string;
  page?: string;
  slot?: string;
  guard?: RouteGuard[];
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
}

export interface Configuration {
  id: string;
  template?: "core" | "auth" | "custom";
  elements: LayoutElement[];
  gridContainer?: Pick<GridProps, "spacing" | "direction">;
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

export type DatasourceFactory = () =>
  | DatasourceInstance
  | (() => DatasourceInstance);

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
