import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { dependencyKey } from "../engine/renderer";
import { NavigationProgress } from "../navigation-progress";
import type { ComponentDefinition, Configuration, LayoutElement, Route } from "../types";

export function MuiCoreLayout({
  layoutConfig,
  dataMap,
  componentRegistry,
  currentRoute,
  children,
}: {
  layoutConfig: Configuration;
  dataMap: Map<string, Record<string, unknown>>;
  componentRegistry: Map<string, ComponentDefinition>;
  currentRoute: Route | null;
  children: ReactNode;
}) {
  const renderComponent = (element: LayoutElement | undefined) => {
    if (!element) return null;
    const def = componentRegistry.get(element.componentType ?? "");
    const Component = def?.value;
    if (!Component) return null;
    const props = {
      id: dependencyKey(element),
      ...(dataMap.get(dependencyKey(element)) || {}),
      currentRoute,
    };
    return <Component key={element.id} {...props} />;
  };

  const positioned = layoutConfig.elements.reduce(
    (acc, el) => {
      const pos = el.position || "main";
      if (!acc[pos]) acc[pos] = [];
      acc[pos].push(el);
      return acc;
    },
    {} as Record<string, LayoutElement[]>,
  );

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <NavigationProgress />
      {positioned.left?.map(renderComponent)}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          overflow: "hidden",
        }}
      >
        {positioned.top?.map(renderComponent)}
        {/* Sits above the scroll area, so it carries the content gutter itself
            to stay aligned with the page head below it. */}
        {positioned.breadcrumb?.length ? (
          <Box sx={{ px: { xs: "16px", sm: "28px" }, pt: "14px" }}>
            {positioned.breadcrumb.map(renderComponent)}
          </Box>
        ) : null}
        {/* The design's content gutter: 28px desktop, 16px on small screens. */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: "16px", sm: "18px 28px 32px" },
            overflow: "auto",
            bgcolor: "background.default",
          }}
        >
          {children}
        </Box>
        {positioned.bottom?.map(renderComponent)}
      </Box>
    </Box>
  );
}
