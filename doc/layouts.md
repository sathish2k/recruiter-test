# Layouts, pages & elements — every way to use them

A **Configuration** is one screen unit. A **layout** and a **page** are both
Configurations — the difference is that a layout sets a `template` (the shell)
and contains an `outlet`; a page just lists the components to render.

```ts
interface Configuration {
  id: string;
  template?: "core" | "auth" | "custom";   // set on layouts only
  elements: LayoutElement[];
  gridContainer?: { spacing?; direction? };  // wrap elements in <Grid container>
  stackContainer?: { spacing?; direction? }; // wrap elements in <Stack>
}

interface LayoutElement {
  id: string;
  type: "component" | "outlet" | "slot" | "configuration";
  position?: string;        // region in a template: "left" | "top" | "main" | "bottom" | …
  componentType?: string;   // for "component": the registered component id
  configurationId?: string; // for "configuration": a nested Configuration id
  name?: string;            // for "slot": the slot name routes target
  gridItem?: { size?; offset? };  // wrap this element in <Grid size={…}>
  sx?: Record<string, unknown>;
}
```

---

## Part A — Layout templates (the shell)

The `template` picks which shell wraps the page. The renderer wires this in
`engine/orchestrator.tsx`; the shells live in `layout-renderer/`.

### `core` — the app shell (`MuiCoreLayout`)

A flex layout with regions bucketed by `position`: `left` (sidebar), `top`
(appbar), `breadcrumb`, the scrollable `main` **outlet**, and `bottom`.

```ts
{
  id: "Recruit.Core.Layout",
  template: "core",
  elements: [
    { id: "sidebar", type: "component", componentType: "Recruit.Sidebar",  position: "left" },
    { id: "appbar",  type: "component", componentType: "Recruit.AppBar",   position: "top" },
    { id: "crumbs",  type: "component", componentType: "Recruit.Crumbs",   position: "breadcrumb" },
    { id: "outlet",  type: "outlet",   position: "main" },
  ],
}
```

### `auth` — the bare centered shell (`MuiAuthLayout`)

No sidebar; a centered column for sign-in/public screens. Supports optional
`top` (header) and `bottom` (footer) regions around the centered outlet.

```ts
{
  id: "Recruit.Auth.Layout",
  template: "auth",
  elements: [{ id: "auth-outlet", type: "outlet", position: "main" }],
}
```

### `custom` — build your own shell inline

With no `core`/`auth` template, the layout renders its `elements` directly
(honoring `gridContainer` / `stackContainer`), and the `outlet` element marks
where the child renders. Use this when neither standard shell fits.

```ts
{
  id: "Recruit.Split.Layout",
  gridContainer: { spacing: 2 },
  elements: [
    { id: "aside",  type: "component", componentType: "Recruit.Aside", gridItem: { size: 3 } },
    { id: "outlet", type: "outlet",   gridItem: { size: 9 } },
  ],
}
```

---

## Part B — Element types (what goes in `elements`)

### 1. `outlet` — where the page renders

Every layout needs exactly one `outlet`. The matched child/page is rendered
there. In `core`/`auth` it's placed by the shell; in `custom` it renders in
element order.

```ts
{ id: "outlet", type: "outlet", position: "main" }
```

### 2. `component` — render a registered component

Looked up by `componentType` in the module registry. The engine injects
`configuration`, `data`, `translation`, `schema`, and `currentRoute` as props
(values come from the component's `defaults` — see Part D).

```ts
{ id: "home-welcome", type: "component", componentType: "Recruit.Welcome.Component" }
```

### 3. `slot` — a named region filled by a route

A `slot` element renders whatever slot-route matches its `name` (see
[routing.md](./routing.md) §6). Unmatched → renders nothing.

```ts
{ id: "side", type: "slot", name: "sidebar", position: "left" }
```

### 4. `configuration` — embed a nested Configuration

Compose one Configuration into another by id — reuse a block across pages. Its
components' datasources are fetched too. Optionally wrap it in a grid item.

```ts
{ id: "stats", type: "configuration", configurationId: "Recruit.Stats.Panel",
  gridItem: { size: { xs: 12, md: 6 } } }
```

---

## Part C — Laying out a page's elements

A **page** is a Configuration with `elements` but no `template`. Choose how its
elements flow:

### Grid layout

```ts
{
  id: "Recruit.Dashboard.Page",
  gridContainer: { spacing: 3 },
  elements: [
    { id: "kpis",   type: "component", componentType: "Recruit.Kpis",   gridItem: { size: 12 } },
    { id: "chart",  type: "component", componentType: "Recruit.Chart",  gridItem: { size: { xs: 12, md: 8 } } },
    { id: "recent", type: "component", componentType: "Recruit.Recent", gridItem: { size: { xs: 12, md: 4 } } },
  ],
}
```

- `gridContainer` → `<Grid container spacing direction>`.
- `gridItem` → `<Grid size={…} offset={…}>`. **MUI 9:** sizing is `size`
  (a number or responsive object), **not** the old `xs`/`sm` item props.

### Stack layout

```ts
{
  id: "Recruit.Settings.Page",
  stackContainer: { spacing: 2, direction: "column" },
  elements: [
    { id: "profile",  type: "component", componentType: "Recruit.Profile",  sx: { mb: 1 } },
    { id: "security", type: "component", componentType: "Recruit.Security" },
  ],
}
```

- In a stack, elements are **not** wrapped in grid items; `sx` (if present)
  wraps the element in a `<Box sx={…}>`.

### Plain flow

No `gridContainer`/`stackContainer` → elements render in order, unwrapped.

---

## Part D — How a component gets its data

A registered component receives five props from the engine. Their values come
from the component's `defaults` in the registry (or a module `bootstrap.tsx`):

```ts
{
  id: "Recruit.Welcome.Component",
  type: "COMPONENT",
  value: WelcomeComponent,
  defaults: {
    configuration: { id: "…", type: "CONFIGURATION", value: { title: "AI Recruiter" } },
    translation:   { id: "…", type: "TRANSLATION",   value: { subtitle: "…" } },
    schema:        { id: "…", type: "SCHEMA",        value: { permissions: ["View"] } },
    datasource:    { id: "…", type: "DATASOURCE",    value: () => ({ get: async () => ({ /* data */ }) }) },
  },
}
```

At render the engine:
1. reads `configuration.value`, `translation.value`, `schema.value` → props;
2. **awaits** `datasource.value().get()` → the `data` prop (all datasources
   across the tree are fetched in parallel before render);
3. injects `currentRoute` (the matched leaf route, incl. `:params`).

```tsx
function WelcomeComponent({ configuration, data, translation, schema, currentRoute }) {
  return <h1>{configuration.title}</h1>;
}
```

Deeply-nested children can also read a component's slice by id without
prop-drilling:

```tsx
import { useComponentData, useComponentConfiguration } from "@recruit/sdk";
const data = useComponentData<MyData>("Recruit.Welcome.Component");
```

---

## Checklist: adding a real page

1. **Build the component** (in `packages/modules/*` for a feature; inline in the
   portal for a seed) and register it in `registry.ts` (`AllModules`).
2. **Describe the page** — a Configuration in `configurations.ts` whose
   `elements` reference the component by `componentType`.
3. **Route to it** — a `Route` in `routes.ts` (a child of the core route for app
   pages; top-level with `auth` for public pages).

No new files under `apps/web/src/app/**` — the `[[...slug]]` shell renders
whatever the config resolves.
