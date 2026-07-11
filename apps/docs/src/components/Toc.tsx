"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function Toc() {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("main h2[id], main h3[id]"),
    );
    setHeadings(
      nodes.map((n) => ({
        id: n.id,
        text: n.textContent ?? "",
        level: n.tagName === "H2" ? 2 : 3,
      })),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "0px 0px -75% 0px", threshold: 0 },
    );
    for (const n of nodes) observer.observe(n);
    return () => observer.disconnect();
  }, [pathname]);

  if (headings.length === 0) return null;

  return (
    <Box
      component="nav"
      aria-label="On this page"
      sx={{ position: "sticky", top: 88 }}
    >
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "text.secondary",
          mb: 1,
        }}
      >
        On this page
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {headings.map((h) => (
          <Box
            key={h.id}
            component="a"
            href={`#${h.id}`}
            sx={{
              pl: h.level === 3 ? 1.5 : 0,
              fontSize: 13,
              lineHeight: 1.5,
              textDecoration: "none",
              color: active === h.id ? "primary.main" : "text.secondary",
              fontWeight: active === h.id ? 600 : 400,
              borderLeft: "2px solid",
              borderColor: active === h.id ? "primary.main" : "transparent",
              ml: -0.25,
              paddingLeft: h.level === 3 ? 2 : 1,
              "&:hover": { color: "text.primary" },
            }}
          >
            {h.text}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
