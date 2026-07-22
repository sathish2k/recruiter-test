"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useSession, useTranslation } from "@recruit/sdk";
import { IconRenderer, Modal, Toast, useToast } from "@recruit/shared";
import { useMemo, useState } from "react";
import { CardHeader, SectionCard } from "../ui";
import type { IntegrationItem, IntegrationsConfig } from "./integrations.configuration";

/** A connected row from the API. */
interface Connection {
  id: string;
  provider: string;
  status: "connected" | "warning" | "available";
  account: string;
  connectedBy: string;
  lastSync: string;
  direction: string;
  warning: string;
}

/** Catalogue entry merged with its connection state. */
type Tile = IntegrationItem & {
  status: "connected" | "warning" | "available";
  connection?: Connection;
};

const STATUS_COLOR: Record<string, string> = {
  connected: "var(--mui-palette-success-main)",
  warning: "var(--mui-palette-warning-light)",
  available: "text.disabled",
};

/** The blurb under the name shifts colour with the connection's health. */
const SUBTEXT_COLOR: Record<string, string> = {
  connected: "text.secondary",
  warning: "warning.light",
  available: "text.disabled",
};

/** Outline + label colour for the trailing action pill, per state. */
const ACTION_COLOR: Record<string, { fg: string; border: string }> = {
  connected: { fg: "surface.textMuted", border: "rgba(255,255,255,.14)" },
  warning: { fg: "warning.light", border: "rgba(214,155,60,.45)" },
  available: { fg: "surface.primarySoftFg", border: "rgba(242,106,27,.4)" },
};

export function SettingsIntegrationsComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<IntegrationsConfig>(id);
  const { data, mutation, mutate } = useFetch<Connection[]>(id);
  const { toast, show, clear } = useToast();
  const session = useSession();
  const [selected, setSelected] = useState<Tile | null>(null);

  const email = session?.data?.user?.email ?? "";

  const byProvider = useMemo(() => {
    const map = new Map<string, Connection>();
    for (const row of data ?? []) map.set(row.provider, row);
    return map;
  }, [data]);

  const groups = useMemo(
    () =>
      config.groups.map((group) => ({
        ...group,
        tiles: group.items.map((item): Tile => {
          const connection = byProvider.get(item.key);
          return {
            ...item,
            status: connection?.status ?? "available",
            connection,
          };
        }),
      })),
    [config.groups, byProvider],
  );

  const total = groups.reduce((sum, group) => sum + group.tiles.length, 0);
  // Rows can come back as `available`; only live links count.
  const connected = [...byProvider.values()].filter((c) => c.status !== "available").length;

  const connect = async (tile: Tile) => {
    await mutation.connect?.({
      provider: tile.key,
      account: email,
      direction: tile.direction,
    });
    await mutate();
    setSelected(null);
    show(t("toast.connected", { name: tile.name }), email);
  };

  const reconnect = async (tile: Tile) => {
    await mutation.reconnect?.(tile.key);
    await mutate();
    setSelected(null);
    show(t("toast.reconnected", { name: tile.name }), t("toast.reconnectedSub"));
  };

  const disconnect = async (tile: Tile) => {
    await mutation.disconnect?.(tile.key);
    await mutate();
    setSelected(null);
    show(t("toast.disconnected", { name: tile.name }), t("toast.disconnectedSub"));
  };

  /** Sub-text mirrors the design: account+sync when live, warning when stale. */
  const subtext = (tile: Tile) => {
    if (tile.status === "warning") return tile.connection?.warning || t(tile.description);
    if (tile.status === "connected" && tile.connection) {
      return t("syncedAt", {
        account: tile.connection.account || email,
        sync: tile.connection.lastSync,
      });
    }
    return t(tile.description);
  };

  const actionLabel = (status: string) =>
    status === "connected"
      ? t("actions.configure")
      : status === "warning"
        ? t("actions.reconnect")
        : t("actions.connect");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <SectionCard>
        <CardHeader
          title={t("title")}
          subtitle={t("subtitle", { connected, available: total - connected })}
          action={
            <Box
              component="a"
              href="#"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flex: "none",
                fontSize: 12.5,
                fontWeight: 600,
                textDecoration: "none",
                color: "surface.primarySoftFg",
                "&:hover": { color: "primary.light" },
              }}
            >
              {t("browse")}
              <IconRenderer name="arrow-forward" size={15} />
            </Box>
          }
        />
      </SectionCard>

      {groups.map((group) => (
        <SectionCard key={group.key}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "12px" }}>
            <IconRenderer name={group.icon} size={15} sx={{ color: "text.disabled" }} />
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".1em",
                color: "text.disabled",
              }}
            >
              {t(group.label)}
            </Typography>
            {group.badge ? (
              <Chip variant="soft" size="small" color="warning" label={t(group.badge)} />
            ) : null}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: "10px",
            }}
          >
            {group.tiles.map((tile) => (
              <Card
                key={tile.key}
                variant="inset"
                onClick={() => setSelected(tile)}
                sx={{
                  p: "12px 13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "11px",
                  cursor: "pointer",
                  borderRadius: "12px",
                  // A stale connection carries an amber edge at rest; hovering
                  // any tile warms the border rather than filling the card.
                  ...(tile.status === "warning" ? { borderColor: "rgba(214,155,60,.35)" } : {}),
                  "&:hover": { borderColor: "rgba(242,106,27,.35)" },
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    flex: "none",
                    borderRadius: "9px",
                    display: "grid",
                    placeItems: "center",
                    // The provider's own brand colours — see IntegrationItem.
                    bgcolor: tile.bg,
                    color: tile.fg,
                    border: "1px solid",
                    borderColor: tile.border,
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {tile.mark}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        // Truncates rather than running under the action pill
                        // when the column is narrower than the design's shell.
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {tile.name}
                    </Typography>
                    {tile.status !== "available" ? (
                      <IconRenderer
                        name={tile.status === "connected" ? "check-circle" : "warning"}
                        size={14}
                        sx={{ color: STATUS_COLOR[tile.status] }}
                      />
                    ) : null}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: SUBTEXT_COLOR[tile.status],
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {subtext(tile)}
                  </Typography>
                </Box>
                {/* A bare bordered pill, not a filled chip — the design's
                    action carries only an outline in its state colour. */}
                <Box
                  sx={{
                    flex: "none",
                    px: "12px",
                    py: "6px",
                    borderRadius: "999px",
                    border: "1px solid",
                    fontSize: 11.5,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    color: ACTION_COLOR[tile.status].fg,
                    borderColor: ACTION_COLOR[tile.status].border,
                  }}
                >
                  {actionLabel(tile.status)}
                </Box>
              </Card>
            ))}
          </Box>
        </SectionCard>
      ))}

      {/* Detail modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        description={selected ? t(`status.${selected.status}`) : ""}
      >
        {selected ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {selected.status === "available" ? (
              <>
                <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                  {t(selected.description)}
                </Typography>
                <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>
                  {t("detail.connectHint", { email })}
                </Typography>
                <Box sx={{ display: "flex", gap: "10px", justifyContent: "flex-end", mt: "6px" }}>
                  <Button variant="outlined" onClick={() => setSelected(null)}>
                    {t("cancel")}
                  </Button>
                  <Button variant="contained" onClick={() => connect(selected)}>
                    {t("actions.connect")}
                  </Button>
                </Box>
              </>
            ) : (
              <>
                {selected.status === "warning" && selected.connection?.warning ? (
                  <Box
                    sx={{
                      p: "10px 12px",
                      borderRadius: "10px",
                      bgcolor: "var(--mui-palette-surface-warningSoftBg)",
                      color: "warning.light",
                      fontSize: 12,
                    }}
                  >
                    {selected.connection.warning}
                  </Box>
                ) : null}
                {[
                  [t("detail.account"), selected.connection?.account || "—"],
                  [t("detail.by"), selected.connection?.connectedBy || "—"],
                  [t("detail.lastSync"), selected.connection?.lastSync || "—"],
                  [
                    t("detail.direction"),
                    selected.connection?.direction
                      ? t(`directions.${selected.connection.direction}`)
                      : "—",
                  ],
                ].map(([label, value]) => (
                  <Box
                    key={label}
                    sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
                  >
                    <Typography sx={{ fontSize: 12, color: "text.disabled" }}>{label}</Typography>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{value}</Typography>
                  </Box>
                ))}
                <Box
                  sx={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "space-between",
                    mt: "6px",
                  }}
                >
                  <Button color="error" onClick={() => disconnect(selected)}>
                    {t("actions.disconnect")}
                  </Button>
                  <Box sx={{ display: "flex", gap: "10px" }}>
                    <Button variant="outlined" onClick={() => reconnect(selected)}>
                      {t("actions.reconnect")}
                    </Button>
                    <Button variant="contained" onClick={() => setSelected(null)}>
                      {t("actions.done")}
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        ) : null}
      </Modal>

      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
