"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { useFetch, useTranslation } from "@recruit/sdk";

interface InvitesWeek {
  days: Array<{ label: string; value: number }>;
  target: number;
  todayIndex: number;
}

const CHART_HEIGHT = 190;

export function EmployeeInvitesChartComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const { data } = useFetch<InvitesWeek>(id);
  if (!data) return null;

  const values = data.days.map((day) => day.value);
  const scaleMax = Math.max(data.target, ...values, 1) * 1.15;
  const targetOffset = (data.target / scaleMax) * CHART_HEIGHT;

  return (
    <Card variant="base">
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: "18px",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>
            {t("title")}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary", mt: "3px" }}>
            {t("subtitle", { target: data.target })}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            gap: "14px",
            height: CHART_HEIGHT,
            borderBottom: "1px solid rgba(255,255,255,.08)",
          }}
        >
          {data.days.map((day, index) => {
            const value = values[index] ?? 0;
            const today = index === data.todayIndex;
            return (
              <Box
                key={day.label}
                sx={{
                  flex: 1,
                  height: `${(value / scaleMax) * 100}%`,
                  borderRadius: "6px 6px 0 0",
                  position: "relative",
                  background: today
                    ? "linear-gradient(180deg,#FF8A3C,#C24509)"
                    : "#2A2A28",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -18,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 10.5,
                    fontWeight: today ? 700 : 600,
                    color: today ? "#F0B27C" : "#9A968E",
                  }}
                >
                  {value}
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: targetOffset,
            borderTop: "1px dashed rgba(240,178,124,.6)",
          }}
        >
          <Typography
            sx={{
              position: "absolute",
              right: 0,
              top: -16,
              fontSize: 10.5,
              fontWeight: 600,
              color: "#F0B27C",
            }}
          >
            {t("target", { target: data.target })}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: "14px",
          mt: "6px",
          fontSize: 11,
          color: "#7C7972",
        }}
      >
        {data.days.map((day, index) => (
          <Box
            key={day.label}
            sx={{
              flex: 1,
              textAlign: "center",
              color: index === data.todayIndex ? "#F0B27C" : "#7C7972",
              fontWeight: index === data.todayIndex ? 700 : 400,
            }}
          >
            {t(`day.${day.label}`)}
          </Box>
        ))}
      </Box>
    </Card>
  );
}
