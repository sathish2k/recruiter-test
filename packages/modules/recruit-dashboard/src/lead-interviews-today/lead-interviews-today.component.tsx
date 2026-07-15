"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { useFetch, useTranslation } from "@recruit/sdk";
import { IconRenderer, Toast, useToast } from "@recruit/shared";

interface InterviewRow {
  id: string;
  time: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  role: string;
}

export function LeadInterviewsTodayComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const { data } = useFetch<InterviewRow[]>(id);
  const toast = useToast();
  const rows = data ?? [];

  return (
    <Card variant="base">
      <Typography sx={{ fontSize: 14.5, fontWeight: 700, mb: "14px" }}>
        {t("title")}
      </Typography>
      {rows.length === 0 ? (
        <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
          {t("empty")}
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {rows.map((row) => (
            <Card
              key={row.id}
              variant="inset"
              sx={{ display: "flex", alignItems: "center", gap: "11px" }}
            >
              <Box sx={{ width: 58 }}>
                <Typography
                  sx={{ fontSize: 12, fontWeight: 700, color: "#F0B27C" }}
                >
                  {row.time}
                </Typography>
              </Box>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: row.avatarBg,
                  color: row.avatarFg,
                  fontSize: 11.5,
                }}
              >
                {row.initials}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                  {row.name}
                </Typography>
                <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                  {row.role}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="secondary"
                onClick={() =>
                  toast.show(
                    t("toast.join", { name: row.name }),
                    t("toast.joinSub"),
                  )
                }
                startIcon={<IconRenderer name="event" size={14} />}
                sx={{ fontSize: 11.5 }}
              >
                {t("join")}
              </Button>
            </Card>
          ))}
        </Box>
      )}
      <Toast toast={toast.toast} onClose={toast.clear} />
    </Card>
  );
}
