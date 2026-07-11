import Box from "@mui/material/Box";
import { CodeBlock } from "../../components/Demo";
import { C, H2, Lead, P, PageTitle, PropsTable } from "../../components/doc";

export default function ReferencePage() {
  return (
    <Box>
      <PageTitle>API reference</PageTitle>
      <Lead>
        Everything exported from <code>@recruit/sdk</code> — the engine
        functions, layout shells, provider hooks, types, and the HTTP client.
      </Lead>

      <H2>Engine</H2>
      <PropsTable
        rows={[
          {
            name: "createPortalApp(config)",
            type: "→ async PortalApp",
            desc: (
              <>
                Build the app from{" "}
                <C>&#123; routes, configurations, modules &#125;</C>. Returns an
                async <C>PortalApp(&#123; slugParts &#125;)</C> that matches,
                fetches, and renders.
              </>
            ),
          },
          {
            name: "findRouteBySlug(slugParts, routes)",
            type: "→ Route[] | null",
            desc: "Resolve a URL's slug parts to a matched route branch (or null = 404).",
          },
          {
            name: "findBestMatchBranch(slugs, candidates, routeMap)",
            type: "→ Route[] | null",
            desc: "The specificity-scored branch matcher used internally by findRouteBySlug.",
          },
          {
            name: "generateRenderTree(matched, configs, routes, slugParts)",
            type: "→ RenderTree | null",
            desc: "Assemble { layouts, page, slots } from a matched branch.",
          },
          {
            name: "PortalRenderer(props)",
            type: "→ JSX",
            desc: "Render a RenderTree (used by PortalApp; exported for advanced cases).",
          },
        ]}
      />

      <H2>Layout shells</H2>
      <PropsTable
        rows={[
          {
            name: "MuiCoreLayout",
            type: "component",
            desc: 'The "core" app shell (sidebar / appbar / main outlet / footer).',
          },
          {
            name: "MuiAuthLayout",
            type: "component",
            desc: 'The "auth" shell (bare, centered outlet).',
          },
        ]}
      />

      <H2>Provider &amp; hooks</H2>
      <PropsTable
        rows={[
          {
            name: "GlobalDependencyProvider",
            type: "component",
            desc: "Wraps the tree; provides the id-keyed dependency maps.",
          },
          {
            name: "useGlobalDependencies()",
            type: "hook",
            desc: "The raw configuration / data / translation maps.",
          },
          {
            name: "useComponentConfiguration(id)",
            type: "hook",
            desc: "A component's configuration by id.",
          },
          {
            name: "useComponentData(id)",
            type: "hook",
            desc: "A component's fetched data by id.",
          },
          {
            name: "useComponentTranslation(id)",
            type: "hook",
            desc: "A component's translation by id.",
          },
        ]}
      />

      <H2>Types</H2>
      <PropsTable
        rows={[
          { name: "Route", type: "interface", desc: "A node in the URL tree." },
          {
            name: "Configuration",
            type: "interface",
            desc: "A layout or page.",
          },
          {
            name: "LayoutElement",
            type: "interface",
            desc: "One entry in a Configuration's elements.",
          },
          {
            name: "GridSize",
            type: "type",
            desc: "MUI 9 Grid sizing (number | responsive object).",
          },
          {
            name: "Module",
            type: "interface",
            desc: "A bundle of components.",
          },
          {
            name: "ComponentExportModel",
            type: "interface",
            desc: "A component + its default dependencies.",
          },
          {
            name: "ComponentDefaults",
            type: "interface",
            desc: "configuration / schema / datasource / translation.",
          },
          {
            name: "RenderTree",
            type: "interface",
            desc: "{ layouts, page, slots } — the resolved screen.",
          },
          {
            name: "InjectedComponentProps",
            type: "interface",
            desc: "The props the engine injects into a component.",
          },
        ]}
      />

      <H2>HTTP client</H2>
      <P>
        For feature components talking to the Elysia API — auth, base URL, and
        error shaping in one place.
      </P>
      <PropsTable
        rows={[
          {
            name: "httpClient",
            type: "AxiosInstance",
            desc: "The shared axios instance (base URL from NEXT_PUBLIC_API_URL). A request interceptor attaches Authorization: Bearer <token> from setAuthToken.",
          },
          {
            name: "setAuthToken(token?)",
            type: "→ void",
            desc: "Sets the bearer token the httpClient interceptor uses. The SDK's AuthProvider calls it from the next-auth session.",
          },
          {
            name: "useFetch(id, params?)",
            type: "→ UseFetchResult",
            desc: "The one data hook: SWR read via the datasource's get(), plus mutation (its mutating methods: create/update/…).",
          },
        ]}
      />
      <CodeBlock
        code={`import { useFetch } from "@recruit/sdk";

// read
const { data, isLoading } = useFetch<HomeDashboard>(id);
// mutate (submit)
const { mutation } = useFetch(id);
await mutation.create(values);     // or mutation.delete(id)`}
      />
    </Box>
  );
}
