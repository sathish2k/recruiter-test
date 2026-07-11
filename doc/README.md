# The config-driven engine (`@recruit/sdk`)

The heart of the app. You **describe** screens as plain configuration objects —
routes, layouts, pages — and the engine matches the URL, assembles a render
tree, fetches each component's data, and renders it with MUI. You never
hand-write a React page under `apps/web/src/app/**`.

- **[routing.md](./routing.md)** — every way to declare and use **routes**.
- **[layouts.md](./layouts.md)** — every way to use **layouts, pages, and elements**.

## The three building blocks

| Shape | What it is | Where it lives |
| --- | --- | --- |
| `Route` | A node in the URL tree. Points at a `layout` and/or a `page`. | `portal/routes.ts` |
| `Configuration` | One screen unit. A **layout** and a **page** are both Configurations. | `portal/configurations.ts` |
| `Module` | A bundle of components, registered by id. | `portal/registry.ts` |

A **layout** is a Configuration with a `template` (`core` / `auth` / `custom`)
and an `outlet`. A **page** is a Configuration whose `elements` reference
components by `componentType`.

## Request lifecycle

```
URL  /roles/123
  │  Next.js [[...slug]]  ->  slugParts = ["roles","123"]
  ▼
findRouteBySlug(slugParts, routes)          engine/router.ts
  │  -> matched branch [rootRoute, roleDetailRoute]  (or null = 404)
  ▼
generateRenderTree(matched, configs, routes, slugParts)   engine/renderer.ts
  │  -> { layouts: [CoreLayout], page: RoleDetailPage, slots: {…} }
  ▼
createPortalApp(...).PortalApp({ slugParts })   engine/orchestrator.tsx
  │  awaits each component's datasource -> dataMap
  ▼
PortalRenderer(tree, dataMap, registry)
     if !tree.page  -> <h1>404 - Page Not Found</h1>
     else: build page content, wrap in layouts via reduceRight
           (MuiCoreLayout / MuiAuthLayout / custom), each layout's
           `outlet` renders the child.
```

The only glue in the Next app is `apps/web/src/app/[[...slug]]/page.tsx`:

```tsx
const PortalApp = createPortalApp({ routes, configurations, modules });

export default async function Page({ params }) {
  const { slug } = await params;      // Next 16: params is async
  return <PortalApp slugParts={slug ?? []} />;
}
```

## Where things live

```
apps/web/src/portal/
  routes.ts            Route[]              — the URL tree
  configurations.ts    Configuration[]      — layouts + pages
  registry.ts          Module[]             — components, by id
  welcome.component.tsx                     — an example registered component
  index.ts             re-exports the three arrays
```

> In a full app, components move into `packages/modules/*` (each with a
> `bootstrap.tsx` declaring its export models); the portal's `registry.ts` just
> imports and lists those modules. The shapes are identical either way.

## Public API

```ts
import {
  createPortalApp,          // build the async PortalApp from config
  findRouteBySlug,          // URL -> matched route branch
  findBestMatchBranch,      // specificity-scored branch matcher
  generateRenderTree,       // matched branch -> RenderTree
  PortalRenderer,           // render a RenderTree
  MuiCoreLayout,            // the "core" shell
  MuiAuthLayout,            // the "auth" shell
  useComponentData,         // hooks to read injected deps by id
  useComponentConfiguration,
  useComponentTranslation,
} from "@recruit/sdk";
import type {
  Route, Configuration, LayoutElement, Module, RenderTree,
} from "@recruit/sdk";
```

## Tests

```bash
bun test packages/recruit-sdk     # router + renderer unit tests (10 tests)
```

`engine/router.test.ts` covers route matching (branch, param, specificity,
404); `engine/renderer.test.ts` covers render-tree assembly (layouts, page,
orphan-layout skip).
