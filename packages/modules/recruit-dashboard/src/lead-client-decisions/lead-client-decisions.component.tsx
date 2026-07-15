"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { useFetch, useTranslation } from "@recruit/sdk";
import { IconRenderer, Toast, useToast } from "@recruit/shared";

interface DecisionRow {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  role: string;
  client: string;
  when: string;
}

interface ClientDecisions {
  approved: DecisionRow[];
  awaiting: DecisionRow | null;
}

export function LeadClientDecisionsComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const { data } = useFetch<ClientDecisions>(id);
  const toast = useToast();
  if (!data) return null;

  return (
    <Card variant="base">
      <Typography sx={{ fontSize: 14.5, fontWeight: 700, mb: "14px" }}>
        {t("title")}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {data.approved.map((row) => (
          <Card
            key={row.id}
            variant="inset"
            sx={{ display: "flex", alignItems: "center", gap: "11px" }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: row.avatarBg,
                color: row.avatarFg,
                fontSize: 12,
              }}
            >
              {row.initials}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                  {row.name}
                </Typography>
                <Chip variant="soft" color="success" label={t("approved")} />
              </Box>
              <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                {t("rowMeta", { client: row.client, when: row.when })}
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() =>
                toast.show(
                  t("toast.call", { name: row.name }),
                  t("toast.callSub"),
                )
              }
              startIcon={<IconRenderer name="call" size={14} />}
              sx={{ fontSize: 11.5 }}
            >
              {t("callSchedule")}
            </Button>
          </Card>
        ))}
        {data.awaiting ? (
          <Card
            variant="inset"
            sx={{ display: "flex", alignItems: "center", gap: "11px" }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: data.awaiting.avatarBg,
                color: data.awaiting.avatarFg,
                fontSize: 12,
              }}
            >
              {data.awaiting.initials}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                {data.awaiting.name}
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                {t("rowMeta", {
                  client: data.awaiting.client,
                  when: data.awaiting.when,
                })}
              </Typography>
            </Box>
            <Chip variant="soft" color="warning" label={t("awaiting")} />
          </Card>
        ) : null}
      </Box>
      <Toast toast={toast.toast} onClose={toast.clear} />
    </Card>
  );
}
