export interface EmployeeKpiCard {
  key: string;
  label: string;
  sub: string;
  icon: string;
  variant: "accent" | "base";
  /** Accent card only — renders the target progress bar and "+ Log" button. */
  progress?: boolean;
}

export interface EmployeeKpisConfig {
  cards: EmployeeKpiCard[];
  targetKey: string;
  pctKey: string;
}

export const EmployeeKpisConfiguration: EmployeeKpisConfig = {
  targetKey: "invitesTarget",
  pctKey: "invitesPct",
  cards: [
    {
      key: "invitesSent",
      label: "invitesSent.label",
      sub: "invitesSent.sub",
      icon: "mail",
      variant: "accent",
      progress: true,
    },
    {
      key: "connections",
      label: "connections.label",
      sub: "connections.sub",
      icon: "handshake",
      variant: "base",
    },
    {
      key: "jdsShared",
      label: "jdsShared.label",
      sub: "jdsShared.sub",
      icon: "description",
      variant: "base",
    },
    {
      key: "cvsReceived",
      label: "cvsReceived.label",
      sub: "cvsReceived.sub",
      icon: "sparkle",
      variant: "base",
    },
  ],
};
