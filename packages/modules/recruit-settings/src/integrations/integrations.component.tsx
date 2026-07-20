"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { SectionCard } from "../ui";

const SERVICES = [
  { name: "Google Calendar", mark: "G", bg: "#fff", fg: "#4285F4" },
  { name: "LinkedIn Sourcer", mark: "in", bg: "#0A66C2", fg: "#fff" },
  { name: "Naukri", mark: "n.", bg: "#fff", fg: "#4A2FBF" },
  { name: "Gmail", mark: "M", bg: "#fff", fg: "#EA4335" },
];

export function SettingsIntegrationsComponent() {
  return (
    <Box sx={{ maxWidth: 1100 }}>
      <SectionCard>
        <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>Connected services</Typography>
        <Typography sx={{ fontSize: 12, color: "text.disabled", mt: "6px", mb: "16px" }}>
          Calendars, sourcing, email &amp; meetings
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {SERVICES.map((c) => (
            <Box
              key={c.name}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "11px",
                background: "background.default",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "11px",
                p: "11px 13px",
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "9px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 800,
                  flex: "none",
                  background: c.bg,
                  color: c.fg,
                }}
              >
                {c.mark}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{c.name}</Typography>
                <Typography sx={{ fontSize: 11, color: "success.light" }}>Connected</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </SectionCard>
    </Box>
  );
}
