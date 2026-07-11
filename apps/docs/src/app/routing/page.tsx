import Box from "@mui/material/Box";
import { CodeBlock, Demo } from "../../components/Demo";
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
import { RouteResolver } from "../../demos/RouteResolver";
import { APP_CONFIGS, APP_ROUTES, APP_URLS } from "../../demos/scenarios";

export default function RoutingPage() {
  return (
    <Box>
      <PageTitle>Routing</PageTitle>
      <Lead>
        A <code>Route</code> is a node in the URL tree. The engine matches the
        incoming path to a branch of routes (root → … → leaf), then renders the
        leaf&rsquo;s page inside the branch&rsquo;s layouts. Matching lives in{" "}
        <code>engine/router.ts</code>.
      </Lead>

      <H2>Try it</H2>
      <P>
        This runs the real <C>findRouteBySlug</C> and <C>generateRenderTree</C>{" "}
        from <C>@recruit/sdk</C> — nothing is mocked.
      </P>
      <Demo
        code={`import { findRouteBySlug, generateRenderTree } from "@recruit/sdk";

const slugParts = parseUrl(url);              // "/candidates/42" -> ["candidates","42"]
const matched = findRouteBySlug(slugParts, routes);
const tree = matched
  ? generateRenderTree(matched, configurations, routes, slugParts)
  : null;                                      // null -> 404`}
      >
        <RouteResolver />
      </Demo>

      <H2>See it render</H2>
      <P>
        The same routes, rendered live through the engine (<C>PortalRenderer</C>
        ). Switch paths to watch the screen change: the app pages share the{" "}
        <C>core</C> shell, <C>/roles/42</C> resolves the nested <C>:id</C>{" "}
        route, <C>/signin</C> swaps to the <C>auth</C> shell, and <C>/nope</C>{" "}
        hits the 404.
      </P>
      <EngineDemo
        frame
        urls={APP_URLS}
        routes={APP_ROUTES}
        configurations={APP_CONFIGS}
        code={`const routes = [
  {
    id: "Root",
    path: "/",
    layout: "Core.Layout",
    page: "Home.Page",
    children: ["Candidates", "Roles"],
  },
  { id: "Candidates", path: "candidates", page: "Candidates.Page", children: [] },
  { id: "Roles", path: "roles", page: "Roles.Page", children: ["RoleDetail"] },
  { id: "RoleDetail", path: ":id", page: "RoleDetail.Page", children: [] },
  {
    id: "SignIn",
    path: "signin",
    layout: "Auth.Layout",
    page: "SignIn.Page",
    children: [],
  },
];

// <PortalApp slugParts={parseUrl(url)} /> renders whatever this resolves.`}
      />

      <H2>The Route shape</H2>
      <PropsTable
        rows={[
          {
            name: "id",
            type: "string",
            required: true,
            desc: "Unique id, referenced by a parent route's children.",
          },
          {
            name: "path",
            type: "string",
            required: true,
            desc: (
              <>
                URL segment(s) for this route: <C>&quot;/&quot;</C> (root),{" "}
                <C>&quot;candidates&quot;</C>, <C>&quot;candidates/:id&quot;</C>
                . May contain multiple segments and params.
              </>
            ),
          },
          {
            name: "layout",
            type: "string",
            desc: "Configuration id of the layout shell wrapping this route's page.",
          },
          {
            name: "page",
            type: "string",
            desc: "Configuration id of the page rendered in the layout's outlet.",
          },
          {
            name: "slot",
            type: "string",
            desc: "If set, this route fills a layout slot of the same name instead of the outlet.",
          },
          {
            name: "children",
            type: "string[]",
            required: true,
            desc: "Child route ids. The URL tree nests through these (use [] for a leaf).",
          },
        ]}
      />

      <H2>The root route</H2>
      <P>
        The root carries both <C>layout</C> and <C>page</C> directly. It is the
        entry for the empty path.
      </P>
      <CodeBlock
        code={`{ id: "Root", path: "/", layout: "Core.Layout", page: "Home.Page", children: [] }`}
      />
      <Callout tone="warning">
        <p>
          <b>The root gotcha.</b> The empty path (<C>/</C>) returns the first
          route with <C>path: &quot;/&quot;</C> and does <b>not</b> descend into
          children. If you split the layout and page across a parent/child both
          at <C>/</C>, the child page is never matched and the root renders 404.
          Keep <C>layout</C> and <C>page</C> on the single root route.
        </p>
      </Callout>

      <H2>Static child routes</H2>
      <P>
        Add a route to a parent&rsquo;s <C>children</C> so it shares the
        parent&rsquo;s layout. A child&rsquo;s <C>path</C> is matched against
        the <b>remaining</b> slugs after the parent consumes its own segments.
      </P>
      <CodeBlock
        code={`{ id: "Root", path: "/", layout: "Core", page: "Home", children: ["Candidates"] },
{ id: "Candidates", path: "candidates", page: "Candidates.Page", children: [] },
// /candidates -> [Root, Candidates]  (Root's "/" consumes nothing; "candidates" matches)`}
      />

      <H2>Nested routes</H2>
      <P>
        <C>children</C> nest arbitrarily deep; each level adds its own segment.
      </P>
      <CodeBlock
        code={`{ id: "Root",   path: "/",      layout: "Core", page: "Home", children: ["Roles"] },
{ id: "Roles",  path: "roles",  page: "RolesList",  children: ["RoleDetail"] },
{ id: "RoleDetail", path: ":id", page: "RoleDetail", children: [] },
// /roles      -> [Root, Roles]
// /roles/42   -> [Root, Roles, RoleDetail]   (child ":id" consumes "42")`}
      />

      <H2>Dynamic (param) routes</H2>
      <P>
        A segment beginning with <C>:</C> matches any single slug. The matched
        leaf route is passed to components as <C>currentRoute</C>.
      </P>
      <CodeBlock
        code={`{ id: "RoleDetail", path: "roles/:id", page: "RoleDetail.Page", children: [] }
// /roles/42 matches; currentRoute is this Route object`}
      />
      <Callout>
        <p>
          <b>Param values are not auto-extracted.</b> <C>currentRoute</C> is the
          matched Route <i>definition</i> (its <C>id</C>, <C>path</C>, …), not a{" "}
          <C>&#123; id: &quot;42&quot; &#125;</C> params object. To read the
          actual value in a component, use Next&rsquo;s <C>useParams()</C> /{" "}
          <C>usePathname()</C>.
        </p>
      </Callout>

      <H2>Multi-segment paths</H2>
      <P>
        A single route&rsquo;s <C>path</C> can span several segments — an
        alternative to nesting when there are no intermediate pages.
      </P>
      <CodeBlock
        code={`{ id: "RoleDetail", path: "roles/:id", page: "RoleDetail.Page", children: [] }
// top-level; matches /roles/42 without a separate "roles" parent route`}
      />

      <H2>Specificity &amp; tie-breaking</H2>
      <P>Each candidate segment is scored, and the highest total wins:</P>
      <PropsTable
        rows={[
          {
            name: "static match",
            type: "+2",
            desc: "The path segment equals the slug exactly.",
          },
          {
            name: "param match",
            type: "+1",
            desc: "The path segment starts with ':' (matches any slug).",
          },
          {
            name: "no match",
            type: "—",
            desc: "Any other segment fails the whole route.",
          },
        ]}
      />
      <P>
        So <C>candidates/list</C> (static, +2) outranks <C>candidates/:id</C>{" "}
        (param, +1) for the slug <C>list</C>. Ties break toward the route that{" "}
        <b>consumes more segments</b>.
      </P>

      <H2>Top-level routes</H2>
      <P>
        The matcher&rsquo;s entry points are the routes <b>not referenced</b> in
        any other route&rsquo;s <C>children</C>. Everything else is reached only
        by descending from its parent — so a route added to <C>children</C> is
        automatically a nested route, not a top-level one.
      </P>

      <H2>Public / auth routes</H2>
      <P>
        Public pages (sign-in, forgot-password) are declared top-level (not
        children of the core route) and point at the <C>auth</C> layout, so they
        carry no app chrome.
      </P>
      <CodeBlock
        code={`{ id: "SignIn", path: "signin", layout: "Auth.Layout", page: "SignIn.Page", children: [] }`}
      />

      <H2>Slot routes</H2>
      <P>
        A route with a <C>slot</C> fills a layout&rsquo;s named <C>slot</C>{" "}
        region instead of its outlet — driving a panel from the URL,
        independently of the main page. See <C>Layouts → Slots</C> for the full
        picture.
      </P>
      <CodeBlock
        code={`{
  id: "RolesSidebar",
  path: "roles",
  slot: "sidebar",
  page: "RolesSidebar.Page",
  children: [],
}
// fills the layout's { type: "slot", name: "sidebar" } region`}
      />

      <H2>404 &amp; edge cases</H2>
      <PropsTable
        rows={[
          {
            name: "no branch consumes all slugs",
            type: "null",
            desc: "Matching returns null → the renderer shows the 404 page.",
          },
          {
            name: "empty path / trailing slash",
            type: '"" or "/"',
            desc: "Normalized to []; resolves the root shortcut route.",
          },
          {
            name: "path longer than slugs",
            type: "skip",
            desc: "A route whose path has more segments than the remaining slugs can't match.",
          },
        ]}
      />
    </Box>
  );
}
