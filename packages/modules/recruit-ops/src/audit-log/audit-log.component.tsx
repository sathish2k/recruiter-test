"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import { IconRenderer, Toast, useToast } from "@recruit/shared";
import { useState } from "react";
import type { AuditLogConfig, AuditSwatch } from "./audit-log.configuration";

interface AuditEvent {
  id: string;
  actorInitials: string;
  actorColorKey: string;
  kind: string;
  text: string;
  ip: string;
  whenLabel: string;
}

function ActorAvatar({
  initials,
  swatch,
}: {
  initials: string;
  swatch: AuditSwatch;
}) {
  return (
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: "999px",
        bgcolor: swatch.bg,
        color: swatch.fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 600,
        flex: "none",
      }}
    >
      {initials}
    </Box>
  );
}

export function AuditLogComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<AuditLogConfig>(id);
  const { toast, show, clear } = useToast();
  const [kind, setKind] = useState("all");
  const { data } = useFetch<AuditEvent[]>(id, { filters: { kind } });

  const events = Array.isArray(data) ? data : [];

  return (
    <Box sx={{ maxWidth: 920, mx: "auto", width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
          mb: "18px",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
              {t("heading")}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
              · {t("adminOnly")}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 13, color: "text.secondary", mt: "3px" }}>
            {t("subheading")}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="outlined"
          onClick={() => show(t("toast.exportTitle"), t("toast.exportSub"))}
          startIcon={<IconRenderer name="download" size={15} />}
        >
          {t("exportJson")}
        </Button>
      </Box>

      <Tabs
        value={kind}
        onChange={(_, next) => setKind(next)}
        variant="scrollable"
        scrollButtons={false}
        aria-label={t("heading")}
        sx={{ mb: "16px" }}
      >
        {config.filters.map((filter) => (
          <Tab key={filter.key} value={filter.key} label={t(filter.label)} />
        ))}
      </Tabs>

      <Card variant="base">
        {events.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
            {t("empty")}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {events.map((event) => (
              <Box
                key={event.id}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  py: "14px",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-of-type": { borderBottom: "none" },
                }}
              >
                <ActorAvatar
                  initials={event.actorInitials}
                  swatch={
                    config.actorColors[event.actorColorKey] ??
                    config.defaultActor
                  }
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 500 }}>
                    {event.text}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      mt: "3px",
                      fontSize: 11.5,
                      color: "text.disabled",
                    }}
                  >
                    <Typography component="span" sx={{ fontSize: 11.5 }}>
                      {event.whenLabel} · {event.ip} ·
                    </Typography>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        color:
                          config.kindColors[event.kind] ?? config.mutedKind,
                      }}
                    >
                      {t(config.kindLabels[event.kind] ?? "kinds.system")}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Card>

      <Typography
        sx={{
          fontSize: 12,
          color: "text.disabled",
          mt: "18px",
          textAlign: "center",
        }}
      >
        {t("footer")}
      </Typography>

      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
