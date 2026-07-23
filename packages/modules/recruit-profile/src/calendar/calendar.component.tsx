"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useConfiguration, useFetch, useSession, useTranslation } from "@recruit/sdk";
import { IconRenderer, ListSection, useToast } from "@recruit/shared";
import { useMemo } from "react";
import type { CalendarConfiguration, CalendarProvider } from "./calendar.configuration";

interface Connection {
  provider: string;
  status: "connected" | "warning" | "available";
  account: string;
}

type Mutation = Record<string, ((arg?: unknown) => Promise<unknown>) | undefined>;

export function CalendarComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<CalendarConfiguration>(id);
  const { data, isLoading, mutation, mutate } = useFetch<Connection[]>(id);
  const session = useSession();
  const { show } = useToast();
  const email = session?.data?.user?.email ?? "";

  const byProvider = useMemo(() => {
    const map = new Map<string, Connection>();
    for (const row of data ?? []) map.set(row.provider, row);
    return map;
  }, [data]);

  if (!config.providers) return null;
  if (isLoading && !data)
    return (
      <Box sx={{ maxWidth: 920 }}>
        <ListSection
          title={t("title")}
          isLoading
          skeletonRows={config.providers.length}
          skeletonShape={{ icon: true, action: "button" }}
        />
      </Box>
    );
  const mut = mutation as Mutation;

  const connect = async (provider: CalendarProvider) => {
    await mut.connect?.({ provider: provider.key, account: email });
    await mutate();
    show(t("toast.connected", { name: provider.name }), email);
  };
  const disconnect = async (provider: CalendarProvider) => {
    await mut.disconnect?.(provider.key);
    await mutate();
    show(t("toast.disconnected", { name: provider.name }));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: 920 }}>
      <ListSection
        title={t("title")}
        items={config.providers.map((provider) => {
          const connection = byProvider.get(provider.key);
          const connected = !!connection && connection.status !== "available";
          return {
            key: provider.key,
            icon: (
              <Avatar
                variant="rounded"
                sx={{ width: 34, height: 34, bgcolor: "background.default" }}
              >
                <IconRenderer name={provider.icon} size={17} sx={{ color: "text.secondary" }} />
              </Avatar>
            ),
            title: provider.name,
            description: connected ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "999px", bgcolor: "success.main" }} />
                <Box component="span" sx={{ color: "success.light" }}>
                  {t("connected", { account: connection?.account || email })}
                </Box>
              </Box>
            ) : (
              t("notConnected")
            ),
            action: connected ? (
              <Button color="error" onClick={() => disconnect(provider)} sx={{ fontWeight: 400 }}>
                {t("disconnect")}
              </Button>
            ) : (
              <Button variant="contained" onClick={() => connect(provider)}>
                {t("connect")}
              </Button>
            ),
          };
        })}
      />
    </Box>
  );
}
