"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { SectionCard } from "../ui";

const SEAT_USED = 5;
const SEAT_TOTAL = 8;

export function SettingsBillingComponent() {
  return (
    <Box sx={{ maxWidth: 1100, display: "flex", flexDirection: "column", gap: "16px" }}>
      <Box sx={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "16px" }}>
        <Card variant="accent" sx={{ p: "20px 22px", borderRadius: "16px" }}>
          <Typography sx={{ fontSize: 11.5, letterSpacing: ".06em", color: "#E8C4A6" }}>
            CURRENT PLAN
          </Typography>
          <Typography sx={{ fontSize: 24, fontWeight: 700, mt: "4px" }}>Growth</Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: "6px", mt: "14px" }}>
            <Typography sx={{ fontSize: 22, fontWeight: 700 }}>₹24,000</Typography>
            <Typography sx={{ fontSize: 12.5, color: "#D9B79A" }}>
              / month · billed annually
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 12, color: "#D9B79A", mt: "6px" }}>
            {SEAT_TOTAL} seats · unlimited roles · AI screening included
          </Typography>
        </Card>
        <SectionCard>
          <Typography sx={{ fontSize: 13, fontWeight: 700, mb: "14px" }}>Seats</Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: "7px" }}>
            <Typography sx={{ fontSize: 24, fontWeight: 700 }}>{SEAT_USED}</Typography>
            <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
              / {SEAT_TOTAL} used
            </Typography>
          </Box>
          <Card variant="inset" sx={{ height: 8, p: 0, my: "12px", overflow: "hidden" }}>
            <Box
              sx={{
                height: "100%",
                width: `${Math.round((SEAT_USED / SEAT_TOTAL) * 100)}%`,
                background: "linear-gradient(90deg,#FF8A3C,#E4560F)",
              }}
            />
          </Card>
          <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
            {SEAT_TOTAL - SEAT_USED} seats available · ₹3,000/mo each
          </Typography>
        </SectionCard>
      </Box>
      <SectionCard>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: "14px",
          }}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Payment method</Typography>
          <Typography
            sx={{ fontSize: 12, fontWeight: 600, color: "primary.light", cursor: "pointer" }}
          >
            Update
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <Box
            sx={{
              width: 46,
              height: 32,
              borderRadius: "7px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: ".04em",
              color: "text.secondary",
              background: "linear-gradient(135deg,#2A2A28,#141413)",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            VISA
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>•••• •••• •••• 4218</Typography>
            <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>Expires 08/28</Typography>
          </Box>
        </Box>
      </SectionCard>
    </Box>
  );
}
