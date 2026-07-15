import type { StatCardRendererConfig } from "@recruit/shared";

const value = (path: string) =>
  ({
    type: "number",
    path,
    sx: { fontSize: 30, lineHeight: 1, letterSpacing: "normal" },
  }) as const;

export const EmployeeKpisConfiguration: StatCardRendererConfig[] = [
  {
    variant: "accent",
    icon: { name: "mail" },
    label: { name: "invitesSent.label" },
    value: value("invitesSent"),
    sub: { name: "invitesSent.ofTarget" },
    progress: { targetPath: "invitesTarget" },
    action: {
      label: { name: "log" },
      icon: "add",
      toast: { title: "toast.logged", sub: "toast.loggedSub" },
    },
  },
  {
    icon: { name: "handshake" },
    label: { name: "connections.label" },
    value: value("connections"),
    sub: { name: "connections.sub" },
  },
  {
    icon: { name: "description" },
    label: { name: "jdsShared.label" },
    value: value("jdsShared"),
    sub: { name: "jdsShared.sub" },
  },
  {
    icon: { name: "sparkle" },
    label: { name: "cvsReceived.label" },
    value: value("cvsReceived"),
    sub: { name: "cvsReceived.sub" },
  },
];
