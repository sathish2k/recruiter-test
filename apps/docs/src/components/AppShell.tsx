"use client";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DRAWER_WIDTH, MONO, TOC_WIDTH } from "../lib/theme";
import { Sidebar } from "./Sidebar";
import { Toc } from "./Toc";

export function AppShell({ children }: { children: ReactNode }) {
  const wide = usePathname() === "/ui";
  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          <Box
            component={Link}
            href="/"
            sx={{
              display: "flex",
              alignItems: "baseline",
              gap: 1,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Typography sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
              AI Recruiter
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              engine docs
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box
            component="span"
            sx={{
              fontFamily: MONO,
              fontSize: 12,
              color: "text.secondary",
              border: "1px solid",
              borderColor: "divider",
              px: 1,
              py: 0.25,
              borderRadius: 1,
            }}
          >
            @recruit/sdk
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderColor: "divider",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <Sidebar />
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        <Toolbar />
        {wide ? (
          <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>{children}</Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              gap: 5,
              maxWidth: 1120,
              mx: "auto",
              px: { xs: 3, md: 5 },
              py: 5,
            }}
          >
            <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: 780 }}>
              {children}
            </Box>
            <Box
              sx={{
                width: TOC_WIDTH,
                flexShrink: 0,
                display: { xs: "none", lg: "block" },
              }}
            >
              <Toc />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
