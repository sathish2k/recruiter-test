"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { avatarSwatch, IconRenderer, initialsOf, LinkRenderer } from "@recruit/shared";
import type { RoleHolders } from "./permissions.model";
import type { Translate } from "./permissions.types";

/**
 * Who this role actually affects. Opened from a role card's member count,
 * because that is the moment the question comes up.
 */
export function MembersSheet({
  open,
  onClose,
  roleLabel,
  holders,
  membersLink,
  t,
}: {
  open: boolean;
  onClose: () => void;
  roleLabel: string;
  holders: RoleHolders | undefined;
  membersLink: { routeId: string };
  t: Translate;
}) {
  const members = holders?.members ?? [];
  const total = holders?.count ?? 0;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: { sx: { width: 440, maxWidth: "92vw" } },
        backdrop: { sx: { bgcolor: "surface.backdrop" } },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: "13px",
          p: "20px 22px 16px",
          borderBottom: "1px dashed",
          borderColor: "divider",
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 17, fontWeight: 700, letterSpacing: "-.01em" }}>
            {roleLabel}
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: "2px" }}>
            {t("members.subtitle", { shown: members.length, total })}
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label={t("dialogs.cancel")}>
          <IconRenderer name="close" size={19} />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", p: "8px 22px 24px" }}>
        {members.length === 0 ? (
          <Typography sx={{ fontSize: 12.5, color: "text.secondary", py: "16px" }}>
            {t("members.empty")}
          </Typography>
        ) : null}
        {members.map((member) => {
          const swatch = avatarSwatch(member.name);
          return (
            <Box
              key={member.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                py: "12px",
                borderBottom: "1px dashed",
                borderColor: "divider",
              }}
            >
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  fontSize: 11.5,
                  fontWeight: 800,
                  bgcolor: swatch.bg,
                  color: swatch.fg,
                }}
              >
                {initialsOf(member.name)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {member.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 11.5,
                    color: "text.secondary",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {member.email}
                </Typography>
              </Box>
            </Box>
          );
        })}

        <Box sx={{ mt: "16px" }}>
          <LinkRenderer
            config={{
              routeId: membersLink.routeId,
              color: "inherit",
              underline: "none",
              sx: {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                height: 40,
                borderRadius: "8px",
                border: "1px solid var(--mui-palette-divider)",
                fontSize: 12.5,
                fontWeight: 700,
              },
            }}
          >
            <IconRenderer name="manage-accounts" size={17} />
            {t("members.openInUsers")}
          </LinkRenderer>
        </Box>
      </Box>
    </Drawer>
  );
}
