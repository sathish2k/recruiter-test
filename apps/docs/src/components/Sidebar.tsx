"use client";

import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "../lib/nav";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <Box sx={{ px: 1.5, py: 2 }}>
      {NAV.map((section) => (
        <Box key={section.title} sx={{ mb: 2.5 }}>
          <Typography
            sx={{
              px: 1.5,
              mb: 0.5,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "text.secondary",
            }}
          >
            {section.title}
          </Typography>
          <List dense disablePadding>
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <ListItemButton
                  key={item.href}
                  component={Link}
                  href={item.href}
                  selected={active}
                  sx={{
                    borderRadius: 1.5,
                    py: 0.5,
                    "&.Mui-selected": {
                      bgcolor: "rgba(79,70,229,0.1)",
                      "&:hover": { bgcolor: "rgba(79,70,229,0.16)" },
                    },
                  }}
                >
                  <ListItemText
                    primary={item.title}
                    slotProps={{
                      primary: {
                        sx: {
                          fontSize: 14,
                          fontWeight: active ? 600 : 400,
                          color: active ? "primary.main" : "text.primary",
                        },
                      },
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      ))}
    </Box>
  );
}
