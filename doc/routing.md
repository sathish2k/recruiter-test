# Routing — every way to declare and use routes

A `Route` is a node in the URL tree. The engine matches the incoming URL's slug
parts to a **branch** of routes (root → … → leaf), then renders the leaf's page
inside the branch's layouts.

```ts
interface Route {
  id: string;        // unique; referenced by a parent's `children`
  path: string;      // "/", "roles", "roles/:id"
  layout?: string;   // Configuration id of the layout shell
  page?: string;     // Configuration id of the page in the outlet
  slot?: string;     // if set, fills a layout slot instead of the outlet
  children: string[];// child route ids — the tree nests through these
}
```

Matching lives in `engine/router.ts` (`findRouteBySlug`, `findBestMatchBranch`).

---

## 1. The root route (`/`)

The root **must carry both `layout` and `page` directly.**

```ts
{ id: "Recruit.Root", path: "/", layout: "Recruit.Core.Layout",
  page: "Recruit.Home.Page", children: [] }
```

### ⚠️ The root gotcha (read this)

The empty slug (`/`) is special: `findRouteBySlug` returns the **first** route
with `path === "/"` and **does not descend into its children**. So if you split
the layout and the page across a parent/child (both at `/`), the child page is
never matched and the root renders **404**.

```ts
// ❌ WRONG — child page at "/" is never reached; root renders 404
{ id: "root",  path: "/", layout: "Core", children: ["home"] },
{ id: "home",  path: "/", page: "Home",   children: [] },

// ✅ RIGHT — layout + page on the single root route
{ id: "root",  path: "/", layout: "Core", page: "Home", children: [] },
```

---

## 2. A static child route

Add a route as a child of the root so it shares the root's layout.

```ts
{ id: "Recruit.Root", path: "/", layout: "Recruit.Core.Layout",
  page: "Recruit.Home.Page", children: ["Recruit.Candidates"] },

{ id: "Recruit.Candidates", path: "candidates",
  page: "Recruit.Candidates.Page", children: [] },
```

- URL `/candidates` → branch `[Recruit.Root, Recruit.Candidates]`.
- Layouts collected from the whole branch → the core layout wraps the
  candidates page in its `outlet`.

---

## 3. A dynamic (param) route

A segment beginning with `:` matches any single slug and is available to the
page component via `currentRoute`.

```ts
{ id: "Recruit.CandidateDetail", path: "candidates/:id",
  page: "Recruit.CandidateDetail.Page", children: [] }
```

- URL `/candidates/123` → matches this route.
- **Specificity:** a static segment (`+2`) always outranks a param (`+1`), so
  `candidates/list` beats `candidates/:id` for the slug `candidates/list`.

---

## 4. Nested routes (multi-level)

`children` nest arbitrarily deep. Each level can add its own path segment.

```ts
{ id: "root", path: "/", layout: "Core", page: "Home", children: ["roles"] },
{ id: "roles", path: "roles", page: "RolesList", children: ["roleDetail"] },
{ id: "roleDetail", path: ":id", page: "RoleDetail", children: [] },
```

- `/roles` → `[root, roles]`
- `/roles/42` → `[root, roles, roleDetail]` (child path `:id` consumes `42`)

> A child's `path` is matched against the **remaining** slugs after the parent
> consumes its own segments — so `roleDetail` uses `:id`, not `roles/:id`.

---

## 5. Public / auth routes (a different layout)

Public pages (sign-in, forgot-password) are declared **top-level** (not children
of the core route) and point at the **auth** layout. They carry no app chrome.

```ts
{ id: "Recruit.SignIn", path: "signin", layout: "Recruit.Auth.Layout",
  page: "Recruit.SignIn.Page", children: [] }
```

- URL `/signin` → `[Recruit.SignIn]` → the `auth` template renders a bare,
  centered page. See [layouts.md](./layouts.md) for templates.
- Keep these top-level: the `/` shortcut never descends into children, and
  public routes shouldn't inherit the authenticated core shell.

---

## 6. Slot routes (fill a named region, not the outlet)

A route with a `slot` fills a layout's `slot` element of the same `name`
instead of its `outlet`. Use this to drive a sidebar/panel from the URL
independently of the main page. Slot matching is resolved in
`engine/renderer.ts` against routes whose `slot` equals the slot name.

```ts
// layout element (see layouts.md):
{ id: "side", type: "slot", name: "sidebar", position: "left" }

// a route that renders into that slot:
{ id: "Recruit.RolesSidebar", path: "roles", slot: "sidebar",
  page: "Recruit.RolesSidebar.Page", children: [] }
```

When the URL matches, the `sidebar` slot renders `RolesSidebar.Page` while the
outlet still renders the main matched page.

---

## Route matching cheat-sheet

| URL | Route tree | Matched branch |
| --- | --- | --- |
| `/` | root has `path:"/"` | `[root]` (page must be on root) |
| `/candidates` | root → `candidates` | `[root, candidates]` |
| `/candidates/123` | `candidates/:id` | `[…, candidateDetail]` |
| `/signin` | top-level `signin` | `[signin]` |
| `/nope` | no match | `null` → **404** |

Rules, in one place:
1. Empty slug → first `path:"/"` route, **no child descent**.
2. Static segment (`+2`) beats param (`+1`); ties → more segments consumed.
3. A branch only matches if **every** remaining slug is consumed by some route.
4. No branch → `null` → the renderer shows `404 - Page Not Found`.
5. `slot` routes are matched separately, per layout slot, not as main routes.
