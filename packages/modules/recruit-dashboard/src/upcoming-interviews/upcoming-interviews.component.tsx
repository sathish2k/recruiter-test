"use client";

import Box from "@mui/material/Box";
import {
  useConfiguration,
  useFetch,
  usePortalRouter,
  useTranslation,
} from "@recruit/sdk";

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
    <Box
      sx={{
        background: "#1C1C1B",
        border: "1px solid rgba(255,255,255,.06)",
        borderRadius: "16px",
        p: "18px 20px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: "14px",
        }}
      >
        <Box sx={{ fontSize: 14.5, fontWeight: 600 }}>{t("title")}</Box>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {items.map((u) => (
          <Box
            key={u.id}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "#141413",
              border: "1px solid rgba(255,255,255,.06)",
              borderRadius: "12px",
              p: "12px 14px",
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: u.avatarBg,
                color: u.avatarFg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {u.initials}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ fontSize: 13.5, fontWeight: 600 }}>{u.name}</Box>
              <Box sx={{ fontSize: 12, color: "#9A968E" }}>{u.meta}</Box>
            </Box>
            <Box
              sx={{
                fontSize: 11.5,
                fontWeight: 600,
                color: "#C9C5BD",
                background: "rgba(255,255,255,.07)",
                p: "4px 10px",
                borderRadius: "999px",
              }}
            >
              {u.time}
            </Box>
          </Box>
        ))}
        <Box
          onClick={() =>
            config?.viewAllRouteId && router.push(config.viewAllRouteId)
          }
          sx={{
            textAlign: "center",
            p: "11px",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: "12px",
            fontSize: 13,
            color: "#C9C5BD",
            cursor: "pointer",
            "&:hover": {
              background: "rgba(255,255,255,.05)",
              color: "#ECEAE7",
            },
          }}
        >
          {t("viewAll")}
        </Box>
      </Box>
    </Box>
  );
}
