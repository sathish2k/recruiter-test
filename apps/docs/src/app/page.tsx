import Box from "@mui/material/Box";
import { CodeBlock } from "../components/Demo";
import { C, H2, Lead, P, PageTitle } from "../components/doc";

export default function OverviewPage() {
  return (
    <Box>
      <PageTitle>The config-driven engine</PageTitle>
      <Lead>
        <code>@recruit/sdk</code> renders every screen from configuration
        objects — routes, layouts, and pages — not hand-written React. You
        describe the app; the engine matches the URL, assembles a render tree,
        fetches each component&rsquo;s data, and renders it with MUI.
      </Lead>

      <H2>The three building blocks</H2>
      <P>
        <C>Route</C> — a node in the URL tree, pointing at a layout and/or a
        page. <C>Configuration</C> — one screen unit; a layout and a page are
        both Configurations. <C>Module</C> — a bundle of components registered
        by id. A layout is a Configuration with a <C>template</C> and an{" "}
        <C>outlet</C>; a page is a Configuration whose <C>elements</C> reference
        components by <C>componentType</C>.
      </P>

      <H2>Request lifecycle</H2>
      <P>
        The <C>[[...slug]]</C> shell hands the URL to the engine, which resolves
        it end to end:
      </P>
      <CodeBlock
        code={`URL  /candidates/42
  → findRouteBySlug(slugParts, routes)        // matched branch, or null (404)
  → generateRenderTree(matched, configs, ...) // { layouts, page, slots }
  → createPortalApp(...).PortalApp({ slugParts })
       // awaits each component's datasource, then renders
  → PortalRenderer(tree)                        // wraps page in layouts`}
      />

      <H2>Quickstart</H2>
      <P>
        Build the app once from config, then render whatever the URL resolves:
      </P>
      <CodeBlock
        code={`import { createPortalApp } from "@recruit/sdk";
import { routes, allConfigurations, AllModules } from "../portal";

const PortalApp = createPortalApp({
  routes,
  configurations: allConfigurations,
  modules: AllModules,
});

export default async function Page({ params }) {
  const { slug } = await params;           // Next 16: params is async
  return <PortalApp slugParts={slug ?? []} />;
}`}
      />

      <P>
        Next: <C>Routing</C> (URL → route branch), <C>Layouts</C> (the shells),{" "}
        <C>Pages</C> (elements, grid/stack, composition),{" "}
        <C>Components &amp; data</C> (registration, datasources, hooks), and the{" "}
        <C>API reference</C>.
      </P>
    </Box>
  );
}
