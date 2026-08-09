"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { AuthStateTile, type AuthTone } from "./auth-parts";

/** The brand panel beside the form: the mark's geometry drawn at slab scale —
 * two rings on the horizon, the takeoff kerf leaving it, the amber pilot dot. */
function BrandSlab({
  kicker,
  title,
  blurb,
  footer,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  blurb?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Box
      data-slab
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: "surface.slab",
        color: "surface.slabFg",
        p: "40px 36px",
        display: "flex",
        flexDirection: "column",
        // The kerf and pilot dot are placed off the slab's lower edge; below
        // this height they would climb into the blurb.
        minHeight: 540,
      }}
    >
      {[
        { size: 420, left: -90, bottom: -120, opacity: 1 },
        { size: 300, left: -30, bottom: -60, opacity: 0.6 },
      ].map((ring) => (
        <Box
          key={ring.size}
          sx={{
            position: "absolute",
            left: ring.left,
            bottom: ring.bottom,
            width: ring.size,
            height: ring.size,
            borderRadius: "999px",
            border: "1px solid",
            borderColor: "surface.slabLine",
            opacity: ring.opacity,
          }}
        />
      ))}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 150,
          height: "1px",
          bgcolor: "surface.slabLine",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          left: "34%",
          bottom: 150,
          width: 210,
          height: "1px",
          background: (theme) =>
            `linear-gradient(90deg,${theme.palette.surface.slabLine},${theme.palette.secondary.main})`,
          transformOrigin: "left center",
          transform: "rotate(-34deg)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          left: "calc(34% + 174px)",
          bottom: 268,
          width: 8,
          height: 8,
          borderRadius: "999px",
          bgcolor: "secondary.main",
        }}
      />

      {kicker ? (
        <Typography variant="overline" sx={{ position: "relative", color: "surface.slabFgMuted" }}>
          {kicker}
        </Typography>
      ) : null}
      <Typography
        sx={{
          position: "relative",
          fontFamily: "var(--font-grotesk), 'Space Grotesk', system-ui, sans-serif",
          fontSize: 33,
          lineHeight: 1.16,
          fontWeight: 700,
          letterSpacing: "-.02em",
          mt: "18px",
          textWrap: "pretty",
        }}
      >
        {title}
      </Typography>
      {blurb ? (
        <Typography
          sx={{
            position: "relative",
            fontSize: 13.5,
            lineHeight: 1.6,
            color: "surface.slabFgMuted",
            mt: "16px",
            textWrap: "pretty",
          }}
        >
          {blurb}
        </Typography>
      ) : null}
      <Box sx={{ flex: 1, minHeight: 180 }} />
      {footer ? (
        <Typography sx={{ position: "relative", fontSize: 11, color: "surface.slabFgMuted" }}>
          {footer}
        </Typography>
      ) : null}
    </Box>
  );
}

export function AuthCard({
  icon,
  tone = "primary",
  title,
  subtitle,
  subtitleGap = "26px",
  width = 900,
  slab,
  footer,
  children,
  "data-testid": testId,
}: {
  /** Name of the glyph in the state tile above the title. */
  icon?: string;
  /** Tints the tile per state — green done, red expired, amber pending. */
  tone?: AuthTone;
  title: ReactNode;
  subtitle: ReactNode;
  /** Space below the subtitle. Shorter when a second line follows it. */
  subtitleGap?: string;
  width?: number;
  /** The brand panel. Omit it and the card renders as the form column alone. */
  slab?: { kicker?: ReactNode; title: ReactNode; blurb?: ReactNode; footer?: ReactNode };
  /** Closing line under the dashed rule — "Already have an account? Sign in". */
  footer?: ReactNode;
  children: ReactNode;
  "data-testid"?: string;
}) {
  return (
    <Box
      sx={{
        position: "relative",
        zIndex: 1,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: "60px 24px",
      }}
    >
      <Card
        variant="base"
        data-testid={testId}
        data-card
        sx={{
          width: "100%",
          p: 0,
          overflow: "hidden",
          display: "grid",
          // Mobile-first: a single form column with the brand panel dropped
          // rather than squeezed; the slab joins only once its own width fits.
          gridTemplateColumns: "minmax(0,1fr)",
          maxWidth: 460,
          "& [data-slab]": { display: "none" },
          "@media (min-width:881px)": {
            gridTemplateColumns: slab ? "352px minmax(0,1fr)" : "minmax(0,1fr)",
            maxWidth: width,
            "& [data-slab]": { display: "block" },
          },
        }}
      >
        {slab ? <BrandSlab {...slab} /> : null}
        <Box
          data-form
          sx={{
            p: "32px 24px 30px",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
            "@media (min-width:561px)": { p: "44px 44px 34px" },
          }}
        >
          {icon ? <AuthStateTile icon={icon} tone={tone} /> : null}
          <Typography
            sx={{
              fontFamily: "var(--font-grotesk), 'Space Grotesk', system-ui, sans-serif",
              fontSize: 24,
              lineHeight: 1.4,
              fontWeight: 700,
              letterSpacing: "-.01em",
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontSize: 13.5,
              lineHeight: 1.6,
              color: "text.secondary",
              mt: "6px",
              mb: subtitleGap,
              textWrap: "pretty",
            }}
          >
            {subtitle}
          </Typography>
          <Box sx={{ width: "100%" }}>{children}</Box>
          {footer ? (
            <>
              <Box sx={{ flex: 1, minHeight: "16px" }} />
              <Typography
                sx={{
                  pt: "22px",
                  borderTop: "1px dashed",
                  borderColor: "surface.divider",
                  fontSize: 13,
                  color: "text.secondary",
                }}
              >
                {footer}
              </Typography>
            </>
          ) : null}
        </Box>
      </Card>
    </Box>
  );
}
