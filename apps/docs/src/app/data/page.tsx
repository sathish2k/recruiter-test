import Box from "@mui/material/Box";
import { CodeBlock } from "../../components/Demo";
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

const welcomeDemo = {
  routes: [{ id: "Root", path: "/", page: "P", children: [] }],
  configs: [
    {
      id: "P",
      elements: [
        { id: "w", type: "component" as const, componentType: "Home.Welcome" },
      ],
    },
  ],
};
const datasourceDemo = {
  routes: [{ id: "Root", path: "/", page: "P", children: [] }],
  configs: [
    {
      id: "P",
      elements: [
        {
          id: "s",
          type: "component" as const,
          componentType: "Stat.Live",
          prefetch: true,
        },
      ],
    },
  ],
};

export default function DataPage() {
  return (
    <Box>
      <PageTitle>Components &amp; data</PageTitle>
      <Lead>
        Components are registered in modules and referenced from pages by id.
        The engine injects each component&rsquo;s configuration, data,
        translation, and schema — fetching datasources in parallel before
        render.
      </Lead>

      <H2>Registering components</H2>
      <P>
        A <C>Module</C> bundles components; <C>createPortalApp</C> flattens
        every module&rsquo;s components into one registry keyed by <C>id</C>. A
        page element&rsquo;s <C>componentType</C> is that id.
      </P>
      <CodeBlock
        code={`import type { Module } from "@recruit/sdk";

export const AllModules: Module[] = [
  {
    id: "Recruit.Core.Module",
    components: [WelcomeComponentModel /* … */],
  },
];`}
      />

      <H2>The component export model</H2>
      <P>
        Each component is a <C>ComponentExportModel</C> binding its default
        dependencies via <C>defaults</C>. The engine reads each <C>.value</C>{" "}
        and injects it as a prop.
      </P>
      <PropsTable
        rows={[
          {
            name: "id",
            type: "string",
            required: true,
            desc: "The registry key; a page's componentType points here.",
          },
          {
            name: "type",
            type: '"COMPONENT"',
            required: true,
            desc: "Discriminant.",
          },
          {
            name: "value",
            type: "ComponentType",
            required: true,
            desc: "The React component to render.",
          },
          {
            name: "resource",
            type: "string",
            desc: 'Domain resource this component reads/writes (e.g. "candidate").',
          },
          {
            name: "displayName",
            type: "string",
            desc: "Human label (tooling).",
          },
          {
            name: "defaults",
            type: "ComponentDefaults",
            desc: "Default configuration / schema / datasource / translation.",
          },
        ]}
      />
      <CodeBlock
        code={`{
  id: "Home.Welcome",
  type: "COMPONENT",
  value: WelcomeComponent,
  defaults: {
    configuration: { id: "…", type: "CONFIGURATION", value: { title: "AI Recruiter" } },
    schema:        { id: "…", type: "SCHEMA",        value: { permissions: ["View"] } },
    translation:   { id: "…", type: "TRANSLATION",   value: { subtitle: "…" } },
    datasource:    { id: "…", type: "DATASOURCE",    value: () => ({ get: async () => ({}) }) },
  },
}`}
      />

      <H2>Injected props</H2>
      <P>Every registered component receives these five props:</P>
      <PropsTable
        rows={[
          {
            name: "id",
            type: "string",
            desc: "The element id it was rendered from.",
          },
          {
            name: "configuration",
            type: "Record<string, unknown>",
            desc: "From defaults.configuration.value.",
          },
          {
            name: "data",
            type: "Record<string, unknown>",
            desc: "The awaited result of the datasource's get().",
          },
          {
            name: "translation",
            type: "Record<string, unknown>",
            desc: "From defaults.translation.value.",
          },
          {
            name: "schema",
            type: "Record<string, unknown>",
            desc: "From defaults.schema.value (e.g. { permissions }).",
          },
          {
            name: "currentRoute",
            type: "Route | null",
            desc: "The matched leaf route definition.",
          },
        ]}
      />
      <CodeBlock
        code={`function WelcomeComponent({ configuration, data, translation, currentRoute }) {
  return <h1>{configuration.title}</h1>;
}`}
      />
      <P>
        Rendered live — the heading comes from <C>configuration.title</C> and
        the subtitle from <C>translation.subtitle</C>, both injected from the
        component&rsquo;s <C>defaults</C>:
      </P>
      <EngineDemo
        routes={welcomeDemo.routes}
        configurations={welcomeDemo.configs}
        code={`// registered with:
defaults: {
  configuration: { type: "CONFIGURATION", value: { title: "AI Recruiter" } },
  translation:   { type: "TRANSLATION",   value: { subtitle: "Config-driven engine is live." } },
}`}
      />

      <H2>Datasources</H2>
      <P>
        A datasource&rsquo;s <C>value</C> is a factory. Fetching is client-side
        by default (<C>useFetch</C>, below). Opt an element into a server seed
        with <C>prefetch: true</C> — the engine calls the factory, calls the
        result again if it&rsquo;s still a function, then awaits <C>.get()</C>{" "}
        to produce the <C>data</C> prop. Prefetched datasources across the
        render tree resolve in parallel before anything renders.
      </P>
      <CodeBlock
        code={`datasource: {
  id: "Candidates.Data",
  type: "DATASOURCE",
  value: () => ({
    async get() {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/candidates");
      return res.json();
    },
  }),
}`}
      />
      <P>
        Live — <C>createPortalApp</C> awaits this stat card&rsquo;s datasource
        (a 400ms async call) during render, so the fetched value is already
        present when the screen appears:
      </P>
      <EngineDemo
        routes={datasourceDemo.routes}
        configurations={datasourceDemo.configs}
        code={`datasource: {
  type: "DATASOURCE",
  value: () => ({
    async get() {
      // any async source; here a 400ms delay then { value: 128 }
      return { value: 128 };
    },
  }),
}
// StatCard reads props.data.value`}
      />

      <H2>
        Client fetching — <C>useFetch(id)</C>
      </H2>
      <P>
        The server resolves <C>get()</C> once for the first paint (above). To{" "}
        <b>revalidate on the client</b> — refresh, pagination, mutations —
        components call <C>useFetch(id)</C>, which drives the same datasource
        with <C>SWR</C>. Since a factory closure can&rsquo;t cross the
        server→client boundary, the engine serializes only the
        datasource&rsquo;s <C>id</C>; a client <C>DatasourceProvider</C> (given
        the same modules) holds the factories and <C>useFetch</C> joins the two.
        Server data seeds <C>fallbackData</C>, so there&rsquo;s no loading
        flash.
      </P>
      <CodeBlock
        code={`// providers.tsx (client) — register the factories once
import { DatasourceProvider } from "@recruit/sdk";
import { AllModules } from "@recruit/configurations";

<DatasourceProvider modules={AllModules}>{children}</DatasourceProvider>

// any component — revalidate its datasource by id
import { useFetch } from "@recruit/sdk";

function Stats({ id }: { id: string }) {
  const { data, isLoading, totalCount, mutate } = useFetch<Home>(id);
  // useFetch(id, [query], { method: "get" }) to pass args / pick a method
}`}
      />

      <H2>Dependency hooks</H2>
      <P>
        Beyond props, deeply-nested children can read a component&rsquo;s slice
        by id — no prop drilling. All three read from the{" "}
        <C>GlobalDependencyProvider</C> the engine wraps the tree in.
      </P>
      <PropsTable
        rows={[
          {
            name: "useComponentConfiguration(id)",
            type: "<T>",
            desc: "The component's configuration object.",
          },
          {
            name: "useComponentData(id)",
            type: "<T>",
            desc: "The component's fetched data.",
          },
          {
            name: "useComponentTranslation(id)",
            type: "<T>",
            desc: "The component's translation object.",
          },
          {
            name: "useGlobalDependencies()",
            type: "—",
            desc: "The three raw id-keyed maps.",
          },
        ]}
      />
      <CodeBlock
        code={`import { useComponentData } from "@recruit/sdk";

function Row() {
  const data = useComponentData<CandidateList>("Candidates.Table");
  // …
}`}
      />

      <Callout tone="warning">
        <p>
          <b>Schema is passed, not enforced.</b> <C>schema.value</C> (e.g.{" "}
          <C>&#123; permissions: [&quot;View&quot;] &#125;</C>) is injected as
          the <C>schema</C> prop for the component to act on — the engine does{" "}
          <b>not</b> gate rendering on it. Enforce access in the component or
          the backend.
        </p>
      </Callout>
    </Box>
  );
}
