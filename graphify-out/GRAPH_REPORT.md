# Graph Report - .  (2026-08-07)

## Corpus Check
- Corpus is ~32,420 words - fits in a single context window. You may not need a graph.

## Summary
- 579 nodes · 822 edges · 35 communities (26 shown, 9 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.85)
- Token cost: 229,808 input · 9,200 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Engine Orchestrator & Renderer|Engine Orchestrator & Renderer]]
- [[_COMMUNITY_Configurations Package|Configurations Package]]
- [[_COMMUNITY_Architecture Conventions & Gotchas|Architecture Conventions & Gotchas]]
- [[_COMMUNITY_TypeScript Base Config|TypeScript Base Config]]
- [[_COMMUNITY_Runtime Dependencies|Runtime Dependencies]]
- [[_COMMUNITY_Theme & Color Mode|Theme & Color Mode]]
- [[_COMMUNITY_Dev Tooling Dependencies|Dev Tooling Dependencies]]
- [[_COMMUNITY_SDK Providers & Datasources|SDK Providers & Datasources]]
- [[_COMMUNITY_Toast & Snackbar|Toast & Snackbar]]
- [[_COMMUNITY_Error Screens|Error Screens]]
- [[_COMMUNITY_Web App Shell|Web App Shell]]
- [[_COMMUNITY_Biome Config|Biome Config]]
- [[_COMMUNITY_Root Package Scripts|Root Package Scripts]]
- [[_COMMUNITY_Access Rules & Nav Renderers|Access Rules & Nav Renderers]]
- [[_COMMUNITY_Auth Provider & Session|Auth Provider & Session]]
- [[_COMMUNITY_Web Package Config|Web Package Config]]
- [[_COMMUNITY_Empty-State Illustrations|Empty-State Illustrations]]
- [[_COMMUNITY_Sign-In Placeholder Module|Sign-In Placeholder Module]]
- [[_COMMUNITY_Web App tsconfig|Web App tsconfig]]
- [[_COMMUNITY_Docs App tsconfig|Docs App tsconfig]]
- [[_COMMUNITY_Icon Name Checker|Icon Name Checker]]
- [[_COMMUNITY_Route ID Checker|Route ID Checker]]
- [[_COMMUNITY_SX Background Checker|SX Background Checker]]
- [[_COMMUNITY_Launch Config|Launch Config]]
- [[_COMMUNITY_Auth Guards & Sessions|Auth Guards & Sessions]]
- [[_COMMUNITY_Brand & Email Logo|Brand & Email Logo]]
- [[_COMMUNITY_Role Permission Model|Role Permission Model]]
- [[_COMMUNITY_Auth Client Glue|Auth Client Glue]]
- [[_COMMUNITY_Autocomplete Slot Checker|Autocomplete Slot Checker]]
- [[_COMMUNITY_Next Config|Next Config]]
- [[_COMMUNITY_distDir Gotcha|distDir Gotcha]]
- [[_COMMUNITY_TS7 Build Gotcha|TS7 Build Gotcha]]
- [[_COMMUNITY_Auth Client Exports (SDK)|Auth Client Exports (SDK)]]
- [[_COMMUNITY_Auth Client Exports (Web)|Auth Client Exports (Web)]]
- [[_COMMUNITY_useConfiguration Hook|useConfiguration Hook]]

## God Nodes (most connected - your core abstractions)
1. `paths` - 26 edges
2. `compilerOptions` - 17 edges
3. `scripts` - 14 edges
4. `Route` - 12 edges
5. `Configuration` - 11 edges
6. `createPortalApp()` - 9 edges
7. `GenericRenderer (value/cell dispatcher)` - 9 edges
8. `LinkRenderer (the only navigation primitive)` - 9 edges
9. `findRouteBySlug()` - 7 edges
10. `Upload Illustration (SVG)` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Typo'd resource silently hides UI` --semantically_similar_to--> `Unknown IconRenderer name renders nothing`  [INFERRED] [semantically similar]
  .claude/skills/roles-permissions/SKILL.md → CLAUDE.md
- `createPortalApp()` --calls--> `accessResolver()`  [EXTRACTED]
  packages/recruit-sdk/src/engine/orchestrator.tsx → apps/web/src/access.ts
- `accessResolver()` --calls--> `dashboardVariantFor()`  [INFERRED]
  apps/web/src/access.ts → packages/types/src/index.ts
- `accessResolver()` --calls--> `normaliseRole()`  [INFERRED]
  apps/web/src/access.ts → packages/types/src/index.ts
- `createPortalApp()` --calls--> `onAccessDenied()`  [EXTRACTED]
  packages/recruit-sdk/src/engine/orchestrator.tsx → apps/web/src/access.ts

## Import Cycles
- 1-file cycle: `packages/configurations/src/index.ts -> packages/configurations/src/index.ts`
- 1-file cycle: `packages/modules/recruit-auth/src/index.ts -> packages/modules/recruit-auth/src/index.ts`

## Hyperedges (group relationships)
- **Shared GenericRenderer value vocabulary across surfaces** — renderers_skill_genericrenderer, table_renderer_skill_tablerenderer, renderers_skill_cardrenderer, renderers_skill_listrenderer, renderers_skill_statcardrenderer [EXTRACTED 1.00]
- **Access control enforcement flow (rule → context → orchestrator → store)** — roles_permissions_skill_accessrule, roles_permissions_skill_accesscontext, roles_permissions_skill_enforcement_pipeline, roles_permissions_skill_permission_store, roles_permissions_skill_default_role_permissions [EXTRACTED 1.00]
- **Data-driven renderers implementing the skeleton contract** — renderers_skill_skeleton_rule, renderers_skill_statcardrenderer, renderers_skill_barchartrenderer, renderers_skill_stagefunnelrenderer, renderers_skill_graphrenderer [EXTRACTED 1.00]

## Communities (35 total, 9 thin omitted)

### Community 0 - "Engine Orchestrator & Renderer"
Cohesion: 0.07
Nodes (54): createPortalApp(), DataMap, PortalRenderer(), Registry, dependencyKey(), generateRenderTree(), configs, routes (+46 more)

### Community 1 - "Configurations Package"
Cohesion: 0.06
Nodes (32): layouts, AuthPages, PortalApp, accessResolver(), BetterAuthSession, getServerSession(), onAccessDenied(), Resource (+24 more)

### Community 2 - "Architecture Conventions & Gotchas"
Cohesion: 0.06
Nodes (45): Composition rules (atoms → shared → features), data={} footgun (seedRows / seedRecord), Detail routes (:id params + useRouteParams), Binding shared renderers directly as ComponentDefinition.value, Feature component 5-file pattern, Injected id = component id, not element id, react-apexcharts blank under React 19 + Turbopack, API layering (route → controller → service → model) (+37 more)

### Community 3 - "TypeScript Base Config"
Cohesion: 0.05
Nodes (43): compilerOptions, allowJs, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, jsx, lib, module (+35 more)

### Community 4 - "Runtime Dependencies"
Cohesion: 0.05
Nodes (41): dependencies, ajv, ajv-errors, ajv-formats, apexcharts, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, axios (+33 more)

### Community 5 - "Theme & Color Mode"
Cohesion: 0.08
Nodes (28): ColorModeContext, ColorModeContextValue, ThemeModeProvider(), useColorMode(), AlertPropsVariantOverrides, badgeChip, ButtonPropsVariantOverrides, ChipPropsVariantOverrides (+20 more)

### Community 6 - "Dev Tooling Dependencies"
Cohesion: 0.07
Nodes (29): devDependencies, @biomejs/biome, bun-types, drizzle-kit, @playwright/test, @tauri-apps/cli, turbo, @types/dlv (+21 more)

### Community 7 - "SDK Providers & Datasources"
Cohesion: 0.10
Nodes (23): DatasourceContext, DatasourceProvider(), useDatasourceFactory(), EMPTY_REFS, GlobalDependencyContext, GlobalDependencyContextType, GlobalDependencyProvider(), GlobalDependencyProviderProps (+15 more)

### Community 8 - "Toast & Snackbar"
Cohesion: 0.11
Nodes (21): Snackbar(), SnackbarAction, SnackbarContext, SnackbarProvider(), SnackbarState, SnackbarTrigger, useSnackbar(), UseSnackbarResult (+13 more)

### Community 9 - "Error Screens"
Cohesion: 0.09
Nodes (15): BrandErrorScreen(), ErrorScreenAction, numberSx, NotFound(), ServerError(), backToDashboard, errorLine, retry (+7 more)

### Community 10 - "Web App Shell"
Cohesion: 0.10
Nodes (15): grotesk, manrope, metadata, RootLayout(), Providers(), EMPTY_PREFS, LocaleContextValue, LocalePreferences (+7 more)

### Community 11 - "Biome Config"
Cohesion: 0.09
Nodes (21): files, ignoreUnknown, includes, formatter, enabled, indentStyle, indentWidth, lineWidth (+13 more)

### Community 12 - "Root Package Scripts"
Cohesion: 0.11
Nodes (18): name, packageManager, private, scripts, build, check, check:autocomplete, check:fix (+10 more)

### Community 13 - "Access Rules & Nav Renderers"
Cohesion: 0.13
Nodes (16): Access control (access rules on config objects), ListRenderer (config-driven list), ListSection (card-of-rows primitive), SegmentedFilterRenderer (toggle → search param), SlidingPillTabs (sliding gradient pill), TabNavRenderer (shared area tab bar), AccessContext (current user's attributes + permissions), AccessRule ({ resource, action?, attributes? }) (+8 more)

### Community 14 - "Auth Provider & Session"
Cohesion: 0.16
Nodes (11): authClient, AuthProvider(), AuthUser, AuthUserContext, useLogout(), BrandLoader(), BrandLoaderProps, BrandLoaderScreen() (+3 more)

### Community 15 - "Web Package Config"
Cohesion: 0.17
Nodes (11): devDependencies, typescript, name, private, scripts, build, dev, lint (+3 more)

### Community 16 - "Empty-State Illustrations"
Cohesion: 0.24
Nodes (11): HirePilotX Brand Palette (Navy #0E2E5C / Amber #F59E0B), Search Empty-State UI Pattern, Search Empty-State Illustration (SVG), Magnifying Glass Motif, Amber Accent Dot, Upward Upload Arrow, Dashed Drop-Zone Rectangle, File Upload Empty-State UI Concept (+3 more)

### Community 17 - "Sign-In Placeholder Module"
Cohesion: 0.29
Nodes (6): useTranslation(), SIGN_IN_COMPONENT, SIGN_IN_TRANSLATION, AuthLoginComponent(), subtitle, title

### Community 18 - "Web App tsconfig"
Cohesion: 0.22
Nodes (8): compilerOptions, jsx, noEmit, noUncheckedIndexedAccess, types, exclude, extends, include

### Community 19 - "Docs App tsconfig"
Cohesion: 0.22
Nodes (8): compilerOptions, incremental, noEmit, noUncheckedIndexedAccess, plugins, exclude, extends, include

### Community 20 - "Icon Name Checker"
Cohesion: 0.33
Nodes (4): known, misses, registrySource, ROOTS

### Community 21 - "Route ID Checker"
Cohesion: 0.40
Nodes (3): known, misses, ROOTS

### Community 22 - "SX Background Checker"
Cohesion: 0.50
Nodes (3): offenders, PALETTES, PATTERN

### Community 24 - "Auth Guards & Sessions"
Cohesion: 0.67
Nodes (3): Better Auth session architecture, Route guards (authenticationGuard), Guards (authentication) vs access (authorization)

### Community 25 - "Brand & Email Logo"
Cohesion: 0.67
Nodes (3): Email Logo Mark (white glyph + amber dot, 63x63 PNG), Transactional Email Templates (email-render service), HirePilotX Brand Identity (navy primary, amber #F59E0B secondary)

### Community 26 - "Role Permission Model"
Cohesion: 1.00
Nodes (3): DEFAULT_ROLE_PERMISSIONS (seed + offline fallback), role_permission store (per-agency Postgres rows), Migration delta (current roles → target model)

## Ambiguous Edges - Review These
- `Striped Navy Circle Motif` → `File Upload Empty-State UI Concept`  [AMBIGUOUS]
  apps/web/public/illustrations/upload.svg · relation: conceptually_related_to

## Knowledge Gaps
- **282 isolated node(s):** `version`, `configurations`, `nextConfig`, `name`, `version` (+277 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Striped Navy Circle Motif` and `File Upload Empty-State UI Concept`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `ThemeModeProvider()` connect `Theme & Color Mode` to `Web App Shell`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `PortalRouterProvider()` connect `Web App Shell` to `Engine Orchestrator & Renderer`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `ToastProvider()` connect `Web App Shell` to `Toast & Snackbar`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `version`, `configurations`, `nextConfig` to the rest of the system?**
  _289 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Engine Orchestrator & Renderer` be split into smaller, more focused modules?**
  _Cohesion score 0.07182524990744169 - nodes in this community are weakly interconnected._
- **Should `Configurations Package` be split into smaller, more focused modules?**
  _Cohesion score 0.06161616161616162 - nodes in this community are weakly interconnected._