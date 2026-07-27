import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { dependencyKey } from "../engine/renderer";
import type { ComponentDefinition, Configuration, LayoutElement, Route } from "../types";

export function MuiAuthLayout({
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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {positioned.top?.map(renderComponent)}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: "100%" }}>{children}</Box>
      </Box>
      {positioned.bottom?.map(renderComponent)}
    </Box>
  );
}
