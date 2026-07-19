export interface HelpCategory {
  key: string;
  icon: string;
  name: string;
  description: string;
  count: number;
}

export interface HelpArticle {
  key: string;
  title: string;
}

export interface HelpCenterConfig {
  categories: HelpCategory[];
  articles: HelpArticle[];
  supportEmail: string;
  articleIcon: string;
  chevronIcon: string;
  supportIcon: string;
  searchIcon: string;
}

export const HelpCenterConfiguration: HelpCenterConfig = {
  articleIcon: "article",
  chevronIcon: "chevron-right",
  supportIcon: "support-agent",
  searchIcon: "search",
  supportEmail: "mailto:support@troy.example",
  categories: [
    {
      key: "getting-started",
      icon: "rocket",
      name: "categories.gettingStarted.name",
      description: "categories.gettingStarted.desc",
      count: 8,
    },
    {
      key: "sourcing",
      icon: "person-search",
      name: "categories.sourcing.name",
      description: "categories.sourcing.desc",
      count: 12,
    },
    {
      key: "ai-screening",
      icon: "sparkle",
      name: "categories.aiScreening.name",
      description: "categories.aiScreening.desc",
      count: 9,
    },
    {
      key: "client-review",
      icon: "fact_check",
      name: "categories.clientReview.name",
      description: "categories.clientReview.desc",
      count: 6,
    },
    {
      key: "interviews",
      icon: "event",
      name: "categories.interviews.name",
      description: "categories.interviews.desc",
      count: 7,
    },
    {
      key: "admin-billing",
      icon: "settings",
      name: "categories.adminBilling.name",
      description: "categories.adminBilling.desc",
      count: 5,
    },
  ],
  articles: [
    { key: "scoring", title: "articles.scoring" },
    { key: "invites", title: "articles.invites" },
    { key: "threshold", title: "articles.threshold" },
    { key: "shortlist", title: "articles.shortlist" },
    { key: "panel", title: "articles.panel" },
    { key: "permissions", title: "articles.permissions" },
    { key: "invoices", title: "articles.invoices" },
  ],
};
