import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { MuiAuthLayout } from "../layout-renderer/mui-auth-layout";
import { MuiCoreLayout } from "../layout-renderer/mui-core-layout";
import { GlobalDependencyProvider } from "../providers";
import type {
  ComponentDefinition,
  Configuration,
  LayoutElement,
  Module,
  RenderTree,
  Route,
  RouteGuardFn,
} from "../types";
import { generateRenderTree } from "./renderer";
import { findRouteBySlug } from "./router";

type DataMap = Map<string, Record<string, unknown>>;
type Registry = Map<string, ComponentDefinition>;

function splitComponentData(entry: Record<string, unknown> | undefined) {
  const e = entry ?? {};
  return {
    configuration: (e.configuration as Record<string, unknown>) ?? {},
    data: (e.data as Record<string, unknown>) ?? {},
    translation: (e.translation as Record<string, unknown>) ?? {},
    schema: (e.schema as Record<string, unknown>) ?? {},
    datasourceId: e.datasourceId as string | undefined,
  };
}

export function PortalRenderer({
  tree,
  dataMap,
  componentRegistry,
  currentRoute,
  allConfigurations,
}: {
  tree: RenderTree | null;
  dataMap: DataMap;
  componentRegistry: Registry;
  currentRoute: Route | null;
  allConfigurations?: Configuration[];
}) {
  if (!tree?.page) {
    return <h1>404 - Page Not Found</h1>;
  }

  const configurationMap = new Map<string, Record<string, unknown>>();
  const serverDataMap = new Map<string, Record<string, unknown>>();
  const translationMap = new Map<string, Record<string, unknown>>();
  const datasourceRefMap = new Map<string, string>();
  dataMap.forEach((value, key) => {
    const { configuration, data, translation, datasourceId } =
      splitComponentData(value);
    configurationMap.set(key, configuration);
    serverDataMap.set(key, data);
    translationMap.set(key, translation);
    if (datasourceId) datasourceRefMap.set(key, datasourceId);
  });

  const pageContent = (
    <RenderContainer config={tree.page}>
      <RenderElements
        elements={tree.page.elements}
        dataMap={dataMap}
        componentRegistry={componentRegistry}
        tree={tree}
        currentRoute={currentRoute}
        allConfigurations={allConfigurations}
        isStackContainer={!!tree.page.stackContainer}
      />
    </RenderContainer>
  );

  const content = tree.layouts.reduceRight<ReactNode>((child, layoutConfig) => {
    if (layoutConfig.template === "core") {
      return (
        <MuiCoreLayout
          key={layoutConfig.id}
          layoutConfig={layoutConfig}
          dataMap={dataMap}
          componentRegistry={componentRegistry}
          currentRoute={currentRoute}
        >
          {child}
        </MuiCoreLayout>
      );
    }
    if (layoutConfig.template === "auth") {
      return (
        <MuiAuthLayout
          key={layoutConfig.id}
          layoutConfig={layoutConfig}
          dataMap={dataMap}
          componentRegistry={componentRegistry}
          currentRoute={currentRoute}
        >
          {child}
        </MuiAuthLayout>
      );
    }
    return (
      <RenderContainer key={layoutConfig.id} config={layoutConfig}>
        <RenderElements
          elements={layoutConfig.elements}
          dataMap={dataMap}
          componentRegistry={componentRegistry}
          tree={tree}
          childContent={child}
          currentRoute={currentRoute}
          allConfigurations={allConfigurations}
        />
      </RenderContainer>
    );
  }, pageContent);

  return (
    <GlobalDependencyProvider
      configurationMap={configurationMap}
      dataMap={serverDataMap}
      translationMap={translationMap}
      datasourceRefMap={datasourceRefMap}
    >
      {content}
    </GlobalDependencyProvider>
  );
}

function RenderElements({
  elements,
  dataMap,
  componentRegistry,
  tree,
  childContent = null,
  currentRoute,
  allConfigurations,
  isStackContainer = false,
}: {
  elements: LayoutElement[];
  dataMap: DataMap;
  componentRegistry: Registry;
  tree: RenderTree;
  childContent?: ReactNode;
  currentRoute: Route | null;
  allConfigurations?: Configuration[];
  isStackContainer?: boolean;
}) {
  return (
    <>
      {elements.map((element) => {
        if (element.type === "outlet") {
          return isValidElement(childContent)
            ? cloneElement(childContent as ReactElement, { key: element.id })
            : null;
        }

        if (element.type === "slot" && element.name) {
          const slotTree = tree.slots[element.name];
          return slotTree ? (
            <PortalRenderer
              key={element.id}
              tree={slotTree}
              dataMap={dataMap}
              componentRegistry={componentRegistry}
              currentRoute={currentRoute}
              allConfigurations={allConfigurations}
            />
          ) : null;
        }

        if (
          element.type === "configuration" &&
          element.configurationId &&
          allConfigurations
        ) {
          const nestedConfig = allConfigurations.find(
            (c) => c.id === element.configurationId,
          );
          if (!nestedConfig) return null;
          const nestedContent = (
            <RenderContainer key={element.id} config={nestedConfig}>
              <RenderElements
                elements={nestedConfig.elements}
                dataMap={dataMap}
                componentRegistry={componentRegistry}
                tree={tree}
                currentRoute={currentRoute}
                allConfigurations={allConfigurations}
                isStackContainer={!!nestedConfig.stackContainer}
              />
            </RenderContainer>
          );
          return element.gridItem ? (
            <Grid key={element.id} {...element.gridItem}>
              {nestedContent}
            </Grid>
          ) : (
            nestedContent
          );
        }

        if (element.type === "component") {
          const definition = componentRegistry.get(element.componentType ?? "");
          if (!definition) return null;
          const Component = definition.value;
          const { configuration, data, translation, schema } =
            splitComponentData(dataMap.get(element.id));

          const rendered = (
            <Component
              key={element.id}
              id={element.id}
              configuration={configuration}
              data={data}
              translation={translation}
              schema={schema}
              currentRoute={currentRoute}
            />
          );

          if (isStackContainer) {
            return element.sx ? (
              <Box key={element.id} sx={element.sx}>
                {rendered}
              </Box>
            ) : (
              rendered
            );
          }
          return element.gridItem ? (
            <Grid key={element.id} {...element.gridItem} sx={element.sx}>
              {rendered}
            </Grid>
          ) : (
            rendered
          );
        }
        return null;
      })}
    </>
  );
}

function RenderContainer({
  config,
  children,
}: {
  config: Configuration;
  children: ReactNode;
}) {
  if (config.stackContainer) {
    return <Stack {...config.stackContainer}>{children}</Stack>;
  }
  if (config.gridContainer) {
    return (
      <Grid container {...config.gridContainer}>
        {children}
      </Grid>
    );
  }
  return <>{children}</>;
}

export function createPortalApp(sdkConfig: {
  routes: Route[];
  configurations: Configuration[];
  modules: Module[];
  guards?: Record<string, RouteGuardFn>;
}) {
  const { routes, configurations, modules, guards } = sdkConfig;
  const componentRegistry: Registry = new Map();
  for (const m of modules) {
    for (const c of m.components) componentRegistry.set(c.id, c);
  }

  return async function PortalApp({
    slugParts,
  }: {
    slugParts: string[];
  }): Promise<ReactElement> {
    const matchedRoutes = findRouteBySlug(slugParts, routes);

    if (matchedRoutes && guards) {
      const ran = new Set<string>();
      for (const route of matchedRoutes) {
        for (const g of route.guard ?? []) {
          if (ran.has(g.type)) continue;
          ran.add(g.type);
          await guards[g.type]?.();
        }
      }
    }

    const tree = generateRenderTree(
      matchedRoutes,
      configurations,
      routes,
      slugParts,
    );
    const currentRoute = matchedRoutes
      ? (matchedRoutes[matchedRoutes.length - 1] ?? null)
      : null;

    const dataMap: DataMap = new Map();
    const fetchTasks: Promise<void>[] = [];

    const collectFor = (element: LayoutElement) => {
      if (element.type !== "component") return;
      const definition = componentRegistry.get(element.componentType ?? "");
      if (!definition) return;
      fetchTasks.push(
        (async () => {
          const deps = definition.defaults ?? definition.default;
          const props: Record<string, unknown> = {
            configuration: deps?.configuration?.value ?? {},
            schema: deps?.schema?.value ?? {},
            translation: deps?.translation?.value ?? {},
          };
          if (deps?.datasource) {
            if (deps.datasource.id) props.datasourceId = deps.datasource.id;
            if (element.prefetch) {
              const source = deps.datasource.value as unknown;
              const factory =
                typeof source === "function"
                  ? (source as () => unknown)()
                  : source;
              const instance =
                typeof factory === "function"
                  ? (factory as () => unknown)()
                  : factory;
              const getter = (instance as { get?: () => Promise<unknown> })
                ?.get;
              if (typeof getter === "function") props.data = await getter();
            }
          }
          dataMap.set(element.id, props);
        })(),
      );
    };

    const collectFetchTasks = (t: RenderTree | null) => {
      if (!t) return;
      const elements = [
        ...t.layouts.flatMap((l) => l.elements),
        ...(t.page?.elements ?? []),
      ];
      for (const element of elements) {
        if (element.type === "component") {
          collectFor(element);
        } else if (element.type === "configuration") {
          const nested = configurations.find(
            (c) => c.id === element.configurationId,
          );
          nested?.elements.forEach(collectFor);
        }
      }
      for (const slot of Object.values(t.slots)) collectFetchTasks(slot);
    };

    collectFetchTasks(tree);
    await Promise.all(fetchTasks);

    return (
      <PortalRenderer
        tree={tree}
        dataMap={dataMap}
        componentRegistry={componentRegistry}
        currentRoute={currentRoute}
        allConfigurations={configurations}
      />
    );
  };
}
