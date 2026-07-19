"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import { useTranslation as useI18nextTranslation } from "react-i18next";
import { registerTranslations } from "./i18n";

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
  const { i18n } = useI18nextTranslation();

  const lastMap = useRef<
    GlobalDependencyProviderProps["translationMap"] | null
  >(null);
  if (lastMap.current !== translationMap) {
    registerTranslations(i18n, translationMap);
    lastMap.current = translationMap;
  }

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

export function useTranslation(componentId: string): {
  t: (key: string, fallback?: string | Record<string, unknown>) => string;
  language: string;
  setLanguage: (language: string) => void;
} {
  const { t: rawT, i18n } = useI18nextTranslation(componentId);

  const t = useCallback(
    (key: string, fallback?: string | Record<string, unknown>): string => {
      const options =
        typeof fallback === "string" ? { defaultValue: fallback } : fallback;
      return rawT(key, options) as string;
    },
    [rawT],
  );
  const setLanguage = useCallback(
    (language: string) => {
      i18n.changeLanguage(language);
    },
    [i18n],
  );

  return { t, language: i18n.language, setLanguage };
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
