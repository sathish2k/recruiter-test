"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import {
  useConfiguration,
  useFetch,
  usePortalRouter,
  useTranslation,
} from "@recruit/sdk";
import { IconRenderer } from "@recruit/shared";

interface Upcoming {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  meta: string;
  time: string;
}

export function UpcomingInterviewsComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<{ viewAllRouteId?: string }>(id);
  const router = usePortalRouter();
  const { data } = useFetch<{ upcoming: Upcoming[] }>(id);
  const items = data?.upcoming ?? [];

  return (
    <Card variant="base">
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: "14px",
        }}
      >
        <Box sx={{ fontSize: 14.5, fontWeight: 600 }}>{t("title")}</Box>
        <IconButton
          onClick={() =>
            config?.viewAllRouteId && router.push(config.viewAllRouteId)
          }
          sx={{ width: 28, height: 28 }}
        >
          <IconRenderer name="add" size={14} />
        </IconButton>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {items.map((u) => (
          <Card
            key={u.id}
            variant="inset"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Avatar
              variant="rounded"
              sx={{
                width: 36,
                height: 36,
                bgcolor: u.avatarBg,
                color: u.avatarFg,
              }}
            >
              {u.initials}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ fontSize: 13.5, fontWeight: 600 }}>{u.name}</Box>
              <Box sx={{ fontSize: 12, color: "#9A968E" }}>{u.meta}</Box>
            </Box>
            <Chip variant="soft" size="small" label={u.time} />
          </Card>
        ))}
        <Button
          variant="outlined"
          fullWidth
          onClick={() =>
            config?.viewAllRouteId && router.push(config.viewAllRouteId)
          }
          sx={{
            fontWeight: 400,
            color: "#C9C5BD",
            borderRadius: "12px",
            py: "11px",
          }}
        >
          {t("viewAll")}
        </Button>
      </Box>
    </Card>
  );
}
