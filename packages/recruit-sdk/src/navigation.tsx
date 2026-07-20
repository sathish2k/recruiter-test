"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import { findRouteBySlug } from "./engine/router";
import type { Route } from "./types";

export interface PortalRouter {
  push: (routeId: string, params?: Record<string, string>) => void;
  replace: (routeId: string, params?: Record<string, string>) => void;
  pushPath: (path: string) => void;
  replacePath: (path: string) => void;
  back: () => void;
  forward: () => void;
  refresh: () => void;
  getPathFromRouteId: (routeId: string, params?: Record<string, string>) => string;
}

const PortalRouterContext = createContext<PortalRouter | undefined>(undefined);
const RoutesContext = createContext<Route[]>([]);

function buildPath(routes: Route[], routeId: string, params?: Record<string, string>): string {
  const route = routes.find((r) => r.id === routeId);
  if (!route) return "/";
  const walk = (current: Route): string[] => {
    const parent = routes.find((r) => r.children?.includes(current.id));
    return parent && parent.path !== "/" ? [...walk(parent), current.path] : [current.path];
  };
  let path = `/${walk(route).join("/")}`.replace(/\/+/g, "/");
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, value);
    }
  }
  return path;
}

export function PortalRouterProvider({
  routes,
  children,
}: {
  routes: Route[];
  children: ReactNode;
}) {
  const router = useRouter();

  const value = useMemo<PortalRouter>(() => {
    const getPathFromRouteId = (routeId: string, params?: Record<string, string>) =>
      buildPath(routes, routeId, params);
    return {
      push: (id, params) => router.push(getPathFromRouteId(id, params)),
      replace: (id, params) => router.replace(getPathFromRouteId(id, params)),
      pushPath: (path) => router.push(path),
      replacePath: (path) => router.replace(path),
      back: () => router.back(),
      forward: () => router.forward(),
      refresh: () => router.refresh(),
      getPathFromRouteId,
    };
  }, [routes, router]);

  return (
    <PortalRouterContext.Provider value={value}>
      <RoutesContext.Provider value={routes}>{children}</RoutesContext.Provider>
    </PortalRouterContext.Provider>
  );
}

export function usePortalRouter(): PortalRouter {
  const ctx = useContext(PortalRouterContext);
  if (!ctx) {
    throw new Error("usePortalRouter must be used within a PortalRouterProvider");
  }
  return ctx;
}

export function useRouteParams(): Record<string, string> {
  const routes = useContext(RoutesContext);
  const pathname = usePathname();
  return useMemo(() => {
    const slugs = (pathname ?? "/").split("/").filter(Boolean);
    const branch = findRouteBySlug(slugs, routes);
    if (!branch) return {};
    const params: Record<string, string> = {};
    let i = 0;
    for (const route of branch) {
      for (const segment of route.path.split("/").filter(Boolean)) {
        if (segment.startsWith(":")) {
          params[segment.slice(1)] = decodeURIComponent(slugs[i] ?? "");
        }
        i++;
      }
    }
    return params;
  }, [routes, pathname]);
}
