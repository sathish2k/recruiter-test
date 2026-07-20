"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useFetch } from "@recruit/sdk";
import { SectionCard } from "../ui";

interface Member {
  id: string;
  displayName: string;
  email: string;
  role: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
}

const ROLE_STYLE: Record<string, { fg: string; bg: string; border: string }> = {
  admin: { fg: "#F0B27C", bg: "rgba(242,106,27,.14)", border: "rgba(242,106,27,.35)" },
};
const DEFAULT_ROLE = {
  fg: "#C9C5BD",
  bg: "rgba(255,255,255,.05)",
  border: "rgba(255,255,255,.1)",
};

const SEAT_TOTAL = 5;

export function SettingsMembersComponent({ id }: { id: string }) {
  const { data: members = [] } = useFetch<Member[]>(id);

  return (
    <Box sx={{ maxWidth: 1100 }}>
      <SectionCard>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: "16px",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>Members</Typography>
            <Typography sx={{ fontSize: 11.5, color: "text.disabled", mt: "2px" }}>
              {members.length} of {SEAT_TOTAL} seats used
            </Typography>
          </Box>
          <Button variant="contained" size="small">
            Manage roles &amp; permissions
          </Button>
        </Box>

        {members.map((m) => {
          const rs = ROLE_STYLE[m.role] ?? DEFAULT_ROLE;
          return (
            <Box
              key={m.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                py: "12px",
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "999px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  flex: "none",
                  background: m.avatarBg,
                  color: m.avatarFg,
                }}
              >
                {m.initials}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{m.displayName}</Typography>
                <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>{m.email}</Typography>
              </Box>
              <Box
                component="span"
                sx={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: rs.fg,
                  background: rs.bg,
                  border: `1px solid ${rs.border}`,
                  px: "12px",
                  py: "4px",
                  borderRadius: "999px",
                  textTransform: "capitalize",
                }}
              >
                {m.role}
              </Box>
            </Box>
          );
        })}
      </SectionCard>
    </Box>
  );
}
