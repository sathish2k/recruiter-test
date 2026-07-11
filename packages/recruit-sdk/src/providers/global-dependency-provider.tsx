"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useLocale } from "./locale-provider";

export interface GlobalDependencyContextType {
  configurationMap: Map<string, Record<string, unknown>>;
  dataMap: Map<string, Record<string, unknown>>;
  translationMap: Map<string, Record<string, unknown>>;
  datasourceRefMap: Map<string, string>;
}

const GlobalDependencyContext = createContext<
  GlobalDependencyContextType | undefined
>(undefined);

export interface GlobalDependencyProviderProps {
  children: ReactNode;
  configurationMap: Map<string, Record<string, unknown>>;
  dataMap: Map<string, Record<string, unknown>>;
  translationMap: Map<string, Record<string, unknown>>;
  datasourceRefMap?: Map<string, string>;
}

const EMPTY_REFS = new Map<string, string>();

export function GlobalDependencyProvider({
  children,
  configurationMap,
  dataMap,
  translationMap,
  datasourceRefMap = EMPTY_REFS,
}: GlobalDependencyProviderProps) {
  const value = useMemo<GlobalDependencyContextType>(
    () => ({ configurationMap, dataMap, translationMap, datasourceRefMap }),
    [configurationMap, dataMap, translationMap, datasourceRefMap],
  );
  return (
    <GlobalDependencyContext.Provider value={value}>
      {children}
    </GlobalDependencyContext.Provider>
  );
}

export function useGlobalDependencies(): GlobalDependencyContextType {
  const context = useContext(GlobalDependencyContext);
  if (context === undefined) {
    throw new Error(
      "useGlobalDependencies must be used within a GlobalDependencyProvider",
    );
  }
  return context;
}

export function useComponentConfiguration<T = Record<string, unknown>>(
  componentId: string,
): T {
  const { configurationMap } = useGlobalDependencies();
  return (configurationMap.get(componentId) || {}) as T;
}

export const useConfiguration = useComponentConfiguration;

export interface TranslationData {
  fallback?: Record<string, unknown>;
  [locale: string]: unknown;
}

function dget(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (o, k) =>
        o && typeof o === "object"
          ? (o as Record<string, unknown>)[k]
          : undefined,
      obj,
    );
}

export function useTranslation(componentId: string): {
  t: (key: string, fallback?: string) => string;
  language: string;
  setLanguage: (language: string) => void;
} {
  const { translationMap } = useGlobalDependencies();
  const { language, setLanguage } = useLocale();
  const data = translationMap.get(componentId) as TranslationData | undefined;

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const fromLang = data?.[language] ? dget(data[language], key) : undefined;
      if (typeof fromLang === "string") return fromLang;
      const fromFallback = data?.fallback
        ? dget(data.fallback, key)
        : undefined;
      if (typeof fromFallback === "string") return fromFallback;
      const fromEn = data?.en ? dget(data.en, key) : undefined;
      if (typeof fromEn === "string") return fromEn;
      return fallback ?? key;
    },
    [data, language],
  );

  return { t, language, setLanguage };
}

export function useComponentData<T = Record<string, unknown>>(
  componentId: string,
): T {
  const { dataMap } = useGlobalDependencies();
  return (dataMap.get(componentId) || {}) as T;
}

export function useComponentTranslation<T = Record<string, unknown>>(
  componentId: string,
): T {
  const { translationMap } = useGlobalDependencies();
  return (translationMap.get(componentId) || {}) as T;
}

export function useComponentDatasourceId(
  componentId: string,
): string | undefined {
  const { datasourceRefMap } = useGlobalDependencies();
  return datasourceRefMap.get(componentId);
}
