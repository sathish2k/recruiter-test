"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { IconRenderer } from "@recruit/shared";
import type { Translate } from "./permissions.types";

export interface RoleCardData {
  role: string;
  label: string;
  description: string;
  icon: string;
  system: boolean;
  members: number;
  edited: string;
}

/**
 * Pick a role here and the matrix below follows. Each card also carries who
 * holds it — the count is the way into the members sheet, because "who does
 * this affect" is the first question anyone editing permissions asks.
 */
export function RoleCards({
  cards,
  selected,
  onSelect,
  onViewMembers,
  t,
}: {
  cards: RoleCardData[];
  selected: string;
  onSelect: (role: string) => void;
  onViewMembers: (role: string) => void;
  t: Translate;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(236px,1fr))",
        gap: "12px",
      }}
    >
      {cards.map((card) => {
        const active = card.role === selected;
        return (
          <Card
            key={card.role}
            variant="selectable"
            data-selected={active}
            onClick={() => onSelect(card.role)}
            sx={{ display: "flex", flexDirection: "column", gap: "9px" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  flex: "none",
                  borderRadius: "9px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: active ? "surface.primarySoftBg" : "surface.hover",
                  color: active ? "surface.primarySoftFg" : "text.disabled",
                }}
              >
                <IconRenderer name={card.icon} size={17} />
              </Box>
              <Typography
                sx={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 13.5,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {card.label}
              </Typography>
              <Chip
                variant="badge"
                color={card.system ? "default" : "secondary"}
                label={card.system ? t("roles.system") : t("roles.custom")}
                sx={{ flex: "none" }}
              />
            </Box>

            <Typography sx={{ fontSize: 11.5, lineHeight: 1.6, color: "text.secondary" }}>
              {card.description}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                pt: "8px",
                borderTop: "1px dashed",
                borderColor: "divider",
              }}
            >
              <Box
                onClick={(event) => {
                  event.stopPropagation();
                  onViewMembers(card.role);
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "surface.linkFg",
                  cursor: "pointer",
                }}
              >
                <IconRenderer name="group" size={15} />
                {t(card.members === 1 ? "roles.user" : "roles.users", { count: card.members })}
              </Box>
              <Typography sx={{ fontSize: 10.5, color: "surface.textFaint", textAlign: "right" }}>
                {card.edited}
              </Typography>
            </Box>
          </Card>
        );
      })}
    </Box>
  );
}
