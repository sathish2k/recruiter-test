import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import type {
  ComponentDefinition,
  Configuration,
  LayoutElement,
  Route,
} from "../types";

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
      id: element.id,
      ...(dataMap.get(element.id) || {}),
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
        {positioned.breadcrumb?.map(renderComponent)}
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto" }}>
          {children}
        </Box>
        {positioned.bottom?.map(renderComponent)}
      </Box>
    </Box>
  );
}
