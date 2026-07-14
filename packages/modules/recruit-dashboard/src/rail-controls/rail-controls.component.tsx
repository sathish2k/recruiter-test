"use client";

import Box from "@mui/material/Box";
import {
  useConfiguration,
  usePortalRouter,
  useTranslation,
} from "@recruit/sdk";
import { IconRenderer } from "@recruit/shared";
import { useState } from "react";

export function RailControlsComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<{ scheduleRouteId?: string }>(id);
  const router = usePortalRouter();
  const [q, setQ] = useState("");
  const [range, setRange] = useState<"today" | "week">("today");

  const tab = (key: "today" | "week") => ({
    p: "7px 14px",
    borderRadius: "999px",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: range === key ? "#ECEAE7" : "#9A968E",
    background: range === key ? "rgba(255,255,255,.08)" : "transparent",
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "#1C1C1B",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: "999px",
          px: "16px",
          color: "#7C7972",
        }}
      >
        <IconRenderer name="search" size={17} />
        <Box
          component="input"
          value={q}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQ(e.target.value)
          }
          placeholder={t("search")}
          sx={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            border: "none",
            py: "10px",
            fontSize: 13,
            color: "#ECEAE7",
            outline: "none",
            fontFamily: "inherit",
            "&::placeholder": { color: "#7C7972" },
          }}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            background: "#1C1C1B",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: "999px",
            p: "4px",
          }}
        >
          <Box onClick={() => setRange("today")} sx={tab("today")}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "999px",
                background: "#FF8A3C",
              }}
            />
            {t("today")}
          </Box>
          <Box onClick={() => setRange("week")} sx={tab("week")}>
            {t("week")}
          </Box>
        </Box>
        <Box
          onClick={() =>
            config?.scheduleRouteId && router.push(config.scheduleRouteId)
          }
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            p: "9px 15px",
            borderRadius: "999px",
            background: "linear-gradient(135deg,#FF8A3C,#E4560F)",
            color: "#fff",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            "&:hover": { filter: "brightness(1.08)" },
          }}
        >
          <IconRenderer name="add" size={15} />
          {t("schedule")}
        </Box>
      </Box>
    </Box>
  );
}
