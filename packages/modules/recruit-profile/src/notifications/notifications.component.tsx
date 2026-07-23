"use client";

import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import { IconRenderer, ListSection, useToast } from "@recruit/shared";
import { useState } from "react";
import type { NotificationsConfiguration } from "./notifications.configuration";

interface NotificationData {
  notificationPrefs: Record<string, boolean>;
}

type Mutation = Record<string, ((body?: unknown) => Promise<unknown>) | undefined>;

export function NotificationsComponent({ id }: { id: string }) {
  const { data, isLoading, mutation } = useFetch<NotificationData>(id);
  const config = useConfiguration<NotificationsConfiguration>(id);
  const { t } = useTranslation(id);

  if (isLoading || !data) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: 920 }}>
        {(config.groups ?? []).map((group) => (
          <ListSection
            key={group.label}
            icon={<IconRenderer name={group.icon} size={17} sx={{ color: "warning.light" }} />}
            title={t(group.label)}
            isLoading
            skeletonRows={group.items.length}
            skeletonShape={{ description: false }}
          />
        ))}
      </Box>
    );
  }
  return (
    <NotificationsEditor id={id} prefs={data.notificationPrefs} mutation={mutation as Mutation} />
  );
}

function NotificationsEditor({
  id,
  prefs: initial,
  mutation,
}: {
  id: string;
  prefs: Record<string, boolean>;
  mutation: Mutation;
}) {
  const { t } = useTranslation(id);
  const config = useConfiguration<NotificationsConfiguration>(id);
  const { show } = useToast();
  const [prefs, setPrefs] = useState<Record<string, boolean>>(initial);

  if (!config.groups) return null;

  const toggle = async (key: string) => {
    const previous = prefs;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    try {
      await mutation.update?.({ notificationPrefs: next });
      show(t(next[key] ? "toast.on" : "toast.off"), undefined, "success");
    } catch {
      setPrefs(previous);
      show(t("toast.error"), undefined, "error");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: 920 }}>
      {config.groups.map((group) => (
        <ListSection
          key={group.label}
          icon={<IconRenderer name={group.icon} size={17} sx={{ color: "warning.light" }} />}
          title={t(group.label)}
          items={group.items.map((item) => ({
            key: item.key,
            title: t(item.title),
            action: <Switch checked={!!prefs[item.key]} onChange={() => toggle(item.key)} />,
          }))}
        />
      ))}
      <Box sx={{ display: "flex", alignItems: "center", gap: "7px", color: "text.disabled" }}>
        <IconRenderer name="check-circle" size={14} sx={{ color: "success.light" }} />
        <Typography sx={{ fontSize: 11.5 }}>{t("autosave")}</Typography>
      </Box>
    </Box>
  );
}
