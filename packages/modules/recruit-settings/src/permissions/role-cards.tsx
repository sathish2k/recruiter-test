"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { IconRenderer } from "@recruit/shared";
import type { RoleCard } from "./permissions.configuration";

/** Who holds each role, derived from the members list. */
export interface RoleHolders {
  count: number;
  names: string[];
}

/**
 * The three-up summary above the matrix: role chip, member count, what the
 * role does, and who currently holds it. The owner card carries a lock note
 * because its permissions can't be edited.
 */
export function RoleCards({
  cards,
  holders,
  t,
}: {
  cards: RoleCard[];
  holders: Record<string, RoleHolders>;
  t: (key: string, vars?: Record<string, unknown>) => string;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
        gap: "16px",
      }}
    >
      {cards.map((card) => {
        const held = holders[card.value] ?? { count: 0, names: [] };
        return (
          <Box
            key={card.value}
            sx={{
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "16px",
              p: "18px 20px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: "10px",
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: card.fg,
                  bgcolor: card.bg,
                  border: "1px solid",
                  borderColor: card.border,
                  px: "12px",
                  py: "4px",
                  borderRadius: "999px",
                }}
              >
                {t(`roles.${card.value}`)}
              </Box>
              <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>
                {t(held.count === 1 ? "cards.member" : "cards.members", { count: held.count })}
              </Typography>
            </Box>

            <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.55 }}>
              {t(`cards.desc.${card.value}`)}
            </Typography>

            <Typography sx={{ fontSize: 11.5, color: "text.disabled", mt: "9px" }}>
              {held.names.join(" · ") || t("cards.nobody")}
            </Typography>

            {card.locked ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: 11,
                  color: "warning.light",
                  mt: "8px",
                }}
              >
                <IconRenderer name="lock" size={13} />
                {t("cards.lockedNote")}
              </Box>
            ) : null}
          </Box>
        );
      })}
    </Box>
  );
}
