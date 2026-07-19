"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import {
  useConfiguration,
  useFetch,
  usePortalRouter,
  useTranslation,
} from "@recruit/sdk";
import { IconRenderer, LinkRenderer } from "@recruit/shared";
import { useMemo, useState } from "react";
import type {
  KindStyle,
  NotificationsConfig,
} from "./notifications.configuration";

interface NotificationView {
  id: string;
  kind: string;
  icon: string;
  text: string;
  timeLabel: string;
  dayGroup: string;
  read: boolean;
  routeId: string;
}

type Translate = (key: string, vars?: Record<string, unknown>) => string;

const DEFAULT_STYLE: KindStyle = {
  fg: "#C9C5BD",
  bg: "rgba(255,255,255,0.07)",
};

function NotificationRow({
  item,
  read,
  style,
  kindLabel,
  t,
  onClick,
}: {
  item: NotificationView;
  read: boolean;
  style: KindStyle;
  kindLabel: string;
  t: Translate;
  onClick: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: "13px",
        px: "14px",
        py: "13px",
        borderRadius: "11px",
        cursor: "pointer",
        bgcolor: read ? "transparent" : "rgba(242,106,27,0.06)",
        transition: "background .15s",
        "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
          bgcolor: style.bg,
        }}
      >
        <IconRenderer name={item.icon} size={18} color={style.fg} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 13.5, lineHeight: 1.45 }}>
          {item.text}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: "text.disabled", mt: "3px" }}>
          {t("subline", { when: item.timeLabel, kind: kindLabel })}
        </Typography>
      </Box>
      {read ? null : (
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "999px",
            bgcolor: "primary.main",
            flex: "none",
            mt: "6px",
          }}
        />
      )}
    </Box>
  );
}

export function NotificationsComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<NotificationsConfig>(id);
  const router = usePortalRouter();
  const { data, mutate, mutation } = useFetch<NotificationView[]>(id);

  const [filter, setFilter] = useState("all");
  const [localRead, setLocalRead] = useState<Record<string, boolean>>({});

  const items = useMemo(() => data ?? [], [data]);
  const isRead = (item: NotificationView) => item.read || !!localRead[item.id];

  const unreadCount = items.filter((item) => !isRead(item)).length;
  const activeFilter =
    config.filters.find((f) => f.key === filter) ?? config.filters[0];
  const filtered = activeFilter?.kind
    ? items.filter((item) => item.kind === activeFilter.kind)
    : items;

  const openItem = async (item: NotificationView) => {
    setLocalRead((prev) => ({ ...prev, [item.id]: true }));
    await mutation.markRead?.({ id: item.id });
    if (item.routeId) router.push(item.routeId);
  };

  const markAll = async () => {
    const next: Record<string, boolean> = {};
    for (const item of items) next[item.id] = true;
    setLocalRead(next);
    await mutation.markAll?.();
    await mutate();
  };

  if (!data) return null;

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          mb: "18px",
        }}
      >
        <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
          {t("heading")}
        </Typography>
        {unreadCount > 0 ? (
          <Chip
            variant="soft"
            color="primary"
            label={t("unread", { count: unreadCount })}
            size="small"
          />
        ) : null}
        <Box sx={{ flex: 1 }} />
        <Button
          variant="text"
          onClick={() => void markAll()}
          disabled={unreadCount === 0}
          startIcon={<IconRenderer name="done_all" size={15} />}
        >
          {t("markAll")}
        </Button>
      </Box>

      <Tabs
        value={filter}
        onChange={(_, next) => setFilter(next)}
        variant="scrollable"
        scrollButtons={false}
        sx={{ mb: "20px" }}
      >
        {config.filters.map((f) => (
          <Tab key={f.key} value={f.key} label={t(f.label)} />
        ))}
      </Tabs>

      {filtered.length === 0 ? (
        <Card
          variant="base"
          sx={{ textAlign: "center", py: "40px", color: "text.secondary" }}
        >
          <Typography sx={{ fontSize: 13.5 }}>
            {filter === "all"
              ? t("emptyAll")
              : t("empty", { filter: t(activeFilter?.label ?? "") })}
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          {config.dayGroups.map((group) => {
            const groupItems = filtered.filter(
              (item) => item.dayGroup === group,
            );
            if (groupItems.length === 0) return null;
            return (
              <Box key={group}>
                <Typography
                  variant="overline"
                  sx={{ display: "block", mb: "10px", px: "2px" }}
                >
                  {t(`groups.${group}`)}
                </Typography>
                <Card variant="base" sx={{ p: "6px" }}>
                  {groupItems.map((item) => {
                    const style = config.kindStyles[item.kind] ?? DEFAULT_STYLE;
                    const kindLabel = t(
                      config.kindLabels[item.kind] ?? item.kind,
                    );
                    return (
                      <NotificationRow
                        key={item.id}
                        item={item}
                        read={isRead(item)}
                        style={style}
                        kindLabel={kindLabel}
                        t={t}
                        onClick={() => void openItem(item)}
                      />
                    );
                  })}
                </Card>
              </Box>
            );
          })}
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
          mt: "26px",
          fontSize: 12,
          color: "text.disabled",
        }}
      >
        <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
          {t("footer.prefix")}
        </Typography>
        <LinkRenderer config={{ ...config.profileLink, id }} />
      </Box>
    </Box>
  );
}
