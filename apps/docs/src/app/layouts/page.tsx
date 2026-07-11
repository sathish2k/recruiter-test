import Box from "@mui/material/Box";
import {
  C,
  Callout,
  H2,
  Lead,
  P,
  PageTitle,
  PropsTable,
} from "../../components/doc";
import { EngineDemo } from "../../demos/EngineDemo";
import { APP_CONFIGS, APP_ROUTES } from "../../demos/scenarios";
import type { Configuration, Route } from "@recruit/sdk";

const customRoutes: Route[] = [
  {
    id: "Root",
    path: "/",
    layout: "Split.Layout",
    page: "Home.Page",
    children: [],
  },
];
const customConfigs: Configuration[] = [
  {
    id: "Split.Layout",
    gridContainer: { spacing: 2 },
    elements: [
      {
        id: "aside",
        type: "component",
        componentType: "Panel.Recent",
        gridItem: { size: 3 },
      },
      { id: "outlet", type: "outlet", gridItem: { size: 9 } },
    ],
  },
  {
    id: "Home.Page",
    elements: [{ id: "w", type: "component", componentType: "Home.Welcome" }],
  },
];

const nestedRoutes: Route[] = [
  {
    id: "Root",
    path: "/",
    layout: "Core.Layout",
    page: "Home.Page",
    children: ["Settings"],
  },
  {
    id: "Settings",
    path: "settings",
    layout: "Settings.Shell",
    page: "Profile.Page",
    children: [],
  },
];
const nestedConfigs: Configuration[] = [
  ...APP_CONFIGS.filter((c) => c.id === "Core.Layout" || c.id === "Home.Page"),
  {
    id: "Settings.Shell",
    stackContainer: { spacing: 2 },
    elements: [
      {
        id: "tabs",
        type: "component",
        componentType: "Panel.Profile",
        position: "top",
      },
      { id: "s-outlet", type: "outlet", position: "main" },
    ],
  },
  {
    id: "Profile.Page",
    elements: [
      { id: "sec", type: "component", componentType: "Panel.Security" },
    ],
  },
];

const slotRoutes: Route[] = [
  {
    id: "Root",
    path: "/",
    layout: "Slotted.Layout",
    page: "Home.Page",
    children: ["Candidates"],
  },
  {
    id: "Candidates",
    path: "candidates",
    page: "Candidates.Page",
    children: [],
  },
  {
    id: "PanelRoute",
    path: "candidates",
    slot: "panel",
    page: "Filters.Page",
    children: [],
  },
];
const slotConfigs: Configuration[] = [
  {
    id: "Slotted.Layout",
    stackContainer: { spacing: 2 },
    elements: [
      { id: "panel", type: "slot", name: "panel" },
      { id: "outlet", type: "outlet" },
    ],
  },
  {
    id: "Home.Page",
    elements: [{ id: "w", type: "component", componentType: "Home.Welcome" }],
  },
  {
    id: "Candidates.Page",
    elements: [
      { id: "c", type: "component", componentType: "Candidates.Table" },
    ],
  },
  {
    id: "Filters.Page",
    elements: [{ id: "f", type: "component", componentType: "Panel.Recent" }],
  },
];

export default function LayoutsPage() {
  return (
    <Box>
      <PageTitle>Layouts</PageTitle>
      <Lead>
        A layout is a <code>Configuration</code> with a <code>template</code>{" "}
        (the shell) and an <code>outlet</code> where the matched page renders.
        The branch&rsquo;s layouts wrap the page from the outside in. Every demo
        below is rendered live by the engine.
      </Lead>

      <H2>The Configuration shape</H2>
      <PropsTable
        rows={[
          {
            name: "id",
            type: "string",
            required: true,
            desc: "Unique id, referenced by a route's layout or page.",
          },
          {
            name: "template",
            type: '"core" | "auth" | "custom"',
            desc: "The shell. Set on layouts; leave undefined on pages.",
          },
          {
            name: "elements",
            type: "LayoutElement[]",
            required: true,
            desc: "The regions/components. A layout must include one outlet.",
          },
          {
            name: "gridContainer",
            type: "{ spacing?, direction? }",
            desc: "Wrap elements in <Grid container …>.",
          },
          {
            name: "stackContainer",
            type: "{ spacing?, direction? }",
            desc: "Wrap elements in <Stack …> (mutually exclusive with gridContainer).",
          },
        ]}
      />

      <H2>Template: core</H2>
      <P>
        The app shell (<C>MuiCoreLayout</C>). Elements are bucketed by{" "}
        <C>position</C>: <C>left</C> (sidebar), <C>top</C> (appbar),{" "}
        <C>breadcrumb</C>, the scrollable <C>main</C> outlet, and <C>bottom</C>.
      </P>
      <EngineDemo
        frame
        routes={APP_ROUTES}
        configurations={APP_CONFIGS}
        url="/"
        code={`{
  id: "Core.Layout",
  template: "core",
  elements: [
    { id: "sidebar", type: "component", componentType: "Nav.Sidebar", position: "left" },
    { id: "appbar",  type: "component", componentType: "App.Bar",     position: "top" },
    { id: "outlet",  type: "outlet",    position: "main" },
  ],
}`}
      />

      <H2>Template: auth</H2>
      <P>
        A bare, centered column (<C>MuiAuthLayout</C>) for sign-in and public
        screens — no sidebar. Optional <C>top</C> / <C>bottom</C> around the
        outlet.
      </P>
      <EngineDemo
        frame
        height={300}
        routes={APP_ROUTES}
        configurations={APP_CONFIGS}
        url="/signin"
        code={`{
  id: "Auth.Layout",
  template: "auth",
  elements: [{ id: "outlet", type: "outlet", position: "main" }],
}`}
      />

      <H2>Template: custom</H2>
      <P>
        With no <C>core</C>/<C>auth</C> template, the layout renders its own{" "}
        <C>elements</C> (honoring <C>gridContainer</C> / <C>stackContainer</C>),
        and the <C>outlet</C> marks where the child renders.
      </P>
      <EngineDemo
        frame
        height={220}
        routes={customRoutes}
        configurations={customConfigs}
        url="/"
        code={`{
  id: "Split.Layout",
  gridContainer: { spacing: 2 },
  elements: [
    { id: "aside",  type: "component", componentType: "Panel.Recent", gridItem: { size: 3 } },
    { id: "outlet", type: "outlet",   gridItem: { size: 9 } },
  ],
}`}
      />

      <H2>The outlet</H2>
      <P>
        Every layout needs exactly one <C>outlet</C>. In <C>core</C>/<C>auth</C>{" "}
        it&rsquo;s placed by the shell (the <C>main</C> region); in{" "}
        <C>custom</C> it renders in element order. The matched child render tree
        is cloned into the outlet.
      </P>

      <H2>Nested layouts</H2>
      <P>
        Every route in the matched branch that declares a <C>layout</C>{" "}
        contributes one; they wrap the page from the outside in. Here the{" "}
        <C>core</C> shell wraps a <C>Settings.Shell</C> sub-layout, which wraps
        the profile page in its outlet.
      </P>
      <EngineDemo
        frame
        routes={nestedRoutes}
        configurations={nestedConfigs}
        url="/settings"
        code={`{ id: "Root",     path: "/",       layout: "Core.Layout",   page: "Home",   children: ["Settings"] },
{ id: "Settings", path: "settings", layout: "Settings.Shell", page: "Profile", children: [] },
// /settings -> layouts [Core.Layout, Settings.Shell], page Profile`}
      />
      <Callout>
        <p>
          A layout id with no matching Configuration is <b>skipped</b> (not
          fatal) — the branch still renders with whatever layouts resolve.
        </p>
      </Callout>

      <H2>Slots</H2>
      <P>
        A <C>slot</C> element is a named region filled by a route whose{" "}
        <C>slot</C> matches — independently of the outlet. Switch to{" "}
        <C>/candidates</C>: the <C>panel</C> slot fills (from a slot route)
        while the outlet renders the candidates page.
      </P>
      <EngineDemo
        frame
        height={300}
        urls={["/", "/candidates"]}
        routes={slotRoutes}
        configurations={slotConfigs}
        code={`// layout element:
{ id: "panel", type: "slot", name: "panel" }

// a route that targets it:
{ id: "PanelRoute", path: "candidates", slot: "panel", page: "Filters.Page", children: [] }
// on /candidates the "panel" slot renders Filters.Page; the outlet renders Candidates.Page`}
      />
      <Callout tone="warning">
        <p>
          Slots render inside <b>custom</b> layouts and pages (which the engine
          walks element-by-element). The <C>core</C>/<C>auth</C> templates
          render only their positioned components and the outlet — put slots in
          a custom layout.
        </p>
      </Callout>
    </Box>
  );
}
