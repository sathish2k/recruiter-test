"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";
import type { DatasourceFactory, Module } from "../types";

const DatasourceContext = createContext<Map<string, DatasourceFactory>>(
  new Map(),
);

function collectDatasources(modules: Module[]): Map<string, DatasourceFactory> {
  const map = new Map<string, DatasourceFactory>();
  for (const mod of modules) {
    for (const component of mod.components) {
      const datasource =
        component.defaults?.datasource ?? component.default?.datasource;
      if (datasource?.id && typeof datasource.value === "function") {
        map.set(datasource.id, datasource.value as DatasourceFactory);
      }
    }
  }
  return map;
}

export function DatasourceProvider({
  modules,
  children,
}: {
  modules: Module[];
  children: ReactNode;
}) {
  const registry = useMemo(() => collectDatasources(modules), [modules]);
  return (
    <DatasourceContext.Provider value={registry}>
      {children}
    </DatasourceContext.Provider>
  );
}

export function useDatasourceFactory(
  datasourceId: string | undefined,
): DatasourceFactory | undefined {
  const registry = useContext(DatasourceContext);
  return datasourceId ? registry.get(datasourceId) : undefined;
}
