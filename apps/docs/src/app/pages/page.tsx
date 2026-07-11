import Box from "@mui/material/Box";
import type { Configuration, Route } from "@recruit/sdk";
import {
  C,
  Callout,
  H2,
  H3,
  Lead,
  P,
  PageTitle,
  PropsTable,
} from "../../components/doc";
import { EngineDemo } from "../../demos/EngineDemo";

const one = (
  page: Configuration,
): { routes: Route[]; configs: Configuration[] } => ({
  routes: [{ id: "Root", path: "/", page: page.id, children: [] }],
  configs: [page],
});

const component = one({
  id: "P",
  elements: [
    { id: "welcome", type: "component", componentType: "Home.Welcome" },
  ],
});

const grid = one({
  id: "Dashboard.Page",
  gridContainer: { spacing: 2 },
  elements: [
    {
      id: "kpis",
      type: "component",
      componentType: "Panel.Kpis",
      gridItem: { size: 12 },
    },
    {
      id: "chart",
      type: "component",
      componentType: "Panel.Chart",
      gridItem: { size: { xs: 12, md: 8 } },
    },
    {
      id: "recent",
      type: "component",
      componentType: "Panel.Recent",
      gridItem: { size: { xs: 12, md: 4 } },
    },
  ],
});

const stack = one({
  id: "Settings.Page",
  stackContainer: { spacing: 2 },
  elements: [
    { id: "profile", type: "component", componentType: "Panel.Profile" },
    { id: "security", type: "component", componentType: "Panel.Security" },
  ],
});

const nestedRoutes: Route[] = [
  { id: "Root", path: "/", page: "Home.Page", children: [] },
];
const nestedConfigs: Configuration[] = [
  {
    id: "Stats.Panel",
    gridContainer: { spacing: 2 },
    elements: [
      {
        id: "open",
        type: "component",
        componentType: "Panel.OpenRoles",
        gridItem: { size: 6 },
      },
      {
        id: "active",
        type: "component",
        componentType: "Panel.ActiveCands",
        gridItem: { size: 6 },
      },
    ],
  },
  {
    id: "Home.Page",
    gridContainer: { spacing: 2 },
    elements: [
      {
        id: "stats",
        type: "configuration",
        configurationId: "Stats.Panel",
        gridItem: { size: 12 },
      },
    ],
  },
];

export default function PagesPage() {
  return (
    <Box>
      <PageTitle>Pages</PageTitle>
      <Lead>
        A page is a <code>Configuration</code> with no <code>template</code>.
        Its <code>elements</code> list what to render — components, nested
        configurations, slots — and how they flow (grid, stack, or plain). Demos
        below are rendered live by the engine.
      </Lead>

      <H2>The LayoutElement shape</H2>
      <PropsTable
        rows={[
          {
            name: "id",
            type: "string",
            required: true,
            desc: "Unique within the Configuration; also the data key for a component.",
          },
          {
            name: "type",
            type: '"component" | "outlet" | "slot" | "configuration"',
            required: true,
            desc: "What this element resolves to.",
          },
          {
            name: "componentType",
            type: "string",
            desc: 'For "component": the registered ComponentExportModel id.',
          },
          {
            name: "configurationId",
            type: "string",
            desc: 'For "configuration": the nested Configuration id.',
          },
          {
            name: "name",
            type: "string",
            desc: 'For "slot": the slot name routes target via their own slot.',
          },
          {
            name: "position",
            type: "string",
            desc: 'Region within a layout template ("left" | "top" | "main" | …).',
          },
          {
            name: "gridItem",
            type: "{ size?, offset? }",
            desc: "Wrap the element in <Grid size={…} offset={…}> (MUI 9).",
          },
          {
            name: "sx",
            type: "Record<string, unknown>",
            desc: "MUI sx applied to the element's Grid/Box wrapper.",
          },
        ]}
      />

      <H2>Element types</H2>
      <H3>component</H3>
      <P>
        Renders a registered component by <C>componentType</C>; the engine
        injects <C>configuration</C>, <C>data</C>, <C>translation</C>,{" "}
        <C>schema</C>, <C>currentRoute</C>. Unknown id → renders nothing.
      </P>
      <EngineDemo
        routes={component.routes}
        configurations={component.configs}
        code={`{ id: "P", elements: [
  { id: "welcome", type: "component", componentType: "Home.Welcome" },
]}`}
      />

      <H3>outlet · slot · configuration</H3>
      <P>
        <C>outlet</C> marks where a child/page renders (in a layout).{" "}
        <C>slot</C> is a named region filled by a route (see <C>Layouts</C>).{" "}
        <C>configuration</C> embeds another Configuration by id — shown live
        under <C>Nested composition</C> below.
      </P>

      <H2>Grid layout</H2>
      <P>
        With <C>gridContainer</C>, the page becomes a{" "}
        <C>&lt;Grid container&gt;</C> and each element&rsquo;s <C>gridItem</C>{" "}
        becomes a <C>&lt;Grid size=&#123;…&#125;&gt;</C>. Resize the window to
        see the responsive columns collapse.
      </P>
      <EngineDemo
        routes={grid.routes}
        configurations={grid.configs}
        code={`{
  id: "Dashboard.Page",
  gridContainer: { spacing: 2 },
  elements: [
    { id: "kpis",   type: "component", componentType: "Kpis",   gridItem: { size: 12 } },
    { id: "chart",  type: "component", componentType: "Chart",  gridItem: { size: { xs: 12, md: 8 } } },
    { id: "recent", type: "component", componentType: "Recent", gridItem: { size: { xs: 12, md: 4 } } },
  ],
}`}
      />
      <Callout>
        <p>
          <b>MUI 9 Grid.</b> Item sizing is <C>size</C> (a number or{" "}
          <C>&#123; xs, sm, md, lg, xl &#125;</C>), <b>not</b> the old <C>xs</C>
          /<C>sm</C> item props. <C>gridItem</C> is typed from MUI&rsquo;s own{" "}
          <C>GridProps</C>.
        </p>
      </Callout>

      <H2>Stack layout</H2>
      <P>
        With <C>stackContainer</C>, elements stack vertically and are <b>not</b>{" "}
        wrapped in grid items. An element&rsquo;s <C>sx</C> wraps it in a{" "}
        <C>&lt;Box&gt;</C>.
      </P>
      <EngineDemo
        routes={stack.routes}
        configurations={stack.configs}
        code={`{
  id: "Settings.Page",
  stackContainer: { spacing: 2, direction: "column" },
  elements: [
    { id: "profile",  type: "component", componentType: "Profile" },
    { id: "security", type: "component", componentType: "Security" },
  ],
}`}
      />

      <H2>Plain flow &amp; sx</H2>
      <Callout tone="warning">
        <p>
          With neither container, elements render in order, unwrapped. An
          element&rsquo;s <C>sx</C> applies to its <b>Grid</b> wrapper (with{" "}
          <C>gridItem</C>) or its <b>Box</b> wrapper (in a stack). In plain flow
          with no <C>gridItem</C>, <C>sx</C> has no wrapper — style inside the
          component instead.
        </p>
      </Callout>

      <H2>Nested composition</H2>
      <P>
        A <C>configuration</C> element pulls a whole Configuration into a page —
        compose dashboards from reusable panels. Here <C>Home.Page</C> embeds{" "}
        <C>Stats.Panel</C>.
      </P>
      <EngineDemo
        routes={nestedRoutes}
        configurations={nestedConfigs}
        code={`// reusable panel
{ id: "Stats.Panel", gridContainer: { spacing: 2 }, elements: [
  { id: "open",   type: "component", componentType: "OpenRoles",   gridItem: { size: 6 } },
  { id: "active", type: "component", componentType: "ActiveCands", gridItem: { size: 6 } },
]}

// page composing it
{ id: "Home.Page", gridContainer: { spacing: 2 }, elements: [
  { id: "stats", type: "configuration", configurationId: "Stats.Panel", gridItem: { size: 12 } },
]}`}
      />
    </Box>
  );
}
