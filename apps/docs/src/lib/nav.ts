export interface NavItem {
  title: string;
  href: string;
}
export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV: NavSection[] = [
  {
    title: "Getting started",
    items: [{ title: "Overview", href: "/" }],
  },
  {
    title: "Engine",
    items: [
      { title: "Routing", href: "/routing" },
      { title: "Layouts", href: "/layouts" },
      { title: "Pages", href: "/pages" },
      { title: "Components & data", href: "/data" },
      { title: "Lazy loading", href: "/lazy-loading" },
    ],
  },
  {
    title: "Reference",
    items: [
      { title: "API reference", href: "/reference" },
      { title: "Playground", href: "/playground" },
    ],
  },
  {
    title: "Design system",
    items: [{ title: "Component library", href: "/ui" }],
  },
];
