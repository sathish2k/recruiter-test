"use client";

import Box from "@mui/material/Box";
import type { ReactNode } from "react";

// Full-page 404 / 403 screen matching the Claude Design source: the brand mark
// becomes the "0" of 404 (amber pilot dot drifting off) or the padlock of 403
// (amber keyhole). Shared by the SDK NotFound and the core PermissionDenied.

const MANROPE = "var(--font-manrope), 'Manrope', ui-sans-serif, sans-serif";

const KEYFRAMES = `
@keyframes bes-coinBreath{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes bes-shadowBreath{0%,100%{transform:scaleX(1);opacity:.5}50%{transform:scaleX(.82);opacity:.32}}
@keyframes bes-riseIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes bes-pilotDrift{0%,12%{transform:translate(0,0);opacity:1}55%{transform:translate(56px,-38px);opacity:1}70%{transform:translate(78px,-53px);opacity:0}71%,100%{transform:translate(0,0);opacity:0}92%,100%{opacity:1}}
@keyframes bes-keyPulse{0%,100%{box-shadow:0 0 10px rgba(245,158,11,.85),0 0 24px rgba(245,158,11,.4)}50%{box-shadow:0 0 16px rgba(245,158,11,1),0 0 40px rgba(245,158,11,.6)}}
@keyframes bes-lockWiggle{0%,86%,100%{transform:rotate(0)}88%{transform:rotate(-2.5deg)}91%{transform:rotate(2.2deg)}94%{transform:rotate(-1.4deg)}97%{transform:rotate(.8deg)}}
`;

export interface ErrorScreenAction {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
}

const COIN = "clamp(112px,19vw,150px)";

const numberSx = {
  fontFamily: MANROPE,
  fontSize: "clamp(100px,17vw,170px)",
  fontWeight: 800,
  letterSpacing: "-.05em",
  lineHeight: 1,
  color: "text.primary",
} as const;

function BrandCorner() {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 32,
        left: 40,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        color: "text.primary",
        zIndex: 2,
      }}
    >
      <svg
        width={30}
        height={30}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        style={{ flex: "none" }}
      >
        <defs>
          <mask id="bes-corner">
            <rect width="48" height="48" fill="white" />
            <path d="M2 31 H46" stroke="black" strokeWidth="3.5" />
            <path d="M18 31 L44 13" stroke="black" strokeWidth="3.5" />
          </mask>
        </defs>
        <circle cx="24" cy="24" r="19" fill="currentColor" mask="url(#bes-corner)" />
        <circle cx="45" cy="11" r="2.6" fill="#F59E0B" />
      </svg>
      <Box
        component="span"
        sx={{ fontFamily: MANROPE, fontWeight: 700, fontSize: 16.5, letterSpacing: "-.02em" }}
      >
        HirePilot
        <Box component="span" sx={{ color: "#F59E0B" }}>
          X
        </Box>
      </Box>
    </Box>
  );
}

function Coin({ lock }: { lock?: boolean }) {
  const denied = !!lock;
  return (
    <Box
      sx={{
        position: "relative",
        flex: "none",
        color: "text.primary",
        mt: denied ? "26px" : 0,
        animation: "bes-coinBreath 6s ease-in-out infinite",
      }}
    >
      {denied ? (
        <svg
          width="150"
          height="66"
          viewBox="0 0 48 21"
          fill="none"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "50%",
            top: "-40px",
            width: COIN,
            height: "auto",
            transform: "translateX(-50%)",
          }}
        >
          <path
            d="M13 21 v-7 a11 11 0 0 1 22 0 v7"
            stroke="currentColor"
            strokeWidth="3.6"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      ) : null}
      <Box sx={{ animation: denied ? "bes-lockWiggle 7s ease-in-out infinite" : "none" }}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
          style={{ display: "block", width: COIN, height: "auto" }}
        >
          <defs>
            <mask id="bes-coin">
              <rect width="48" height="48" fill="white" />
              <path d="M2 31 H46" stroke="black" strokeWidth="3.5" />
              <path d="M18 31 L44 13" stroke="black" strokeWidth="3.5" />
            </mask>
          </defs>
          <circle cx="24" cy="24" r="19" fill="currentColor" mask="url(#bes-coin)" />
        </svg>
        {denied ? (
          <Box
            component="span"
            sx={{
              position: "absolute",
              left: "50%",
              top: "42%",
              width: 11,
              height: 11,
              ml: "-5.5px",
              borderRadius: "99px",
              background: "#F59E0B",
              animation: "bes-keyPulse 2.6s ease-in-out infinite",
            }}
          />
        ) : (
          <Box
            component="span"
            sx={{
              position: "absolute",
              right: "2%",
              top: "14%",
              width: 10,
              height: 10,
              borderRadius: "99px",
              background: "#F59E0B",
              boxShadow: "0 0 16px rgba(245,158,11,.95),0 0 36px rgba(245,158,11,.45)",
              animation: "bes-pilotDrift 5.5s ease-in-out infinite",
            }}
          />
        )}
      </Box>
      <Box
        sx={{
          position: "absolute",
          left: "12%",
          right: "12%",
          bottom: "-26px",
          height: 12,
          borderRadius: "999px",
          background: "radial-gradient(50% 100% at 50% 50%,rgba(0,0,0,.55),transparent 75%)",
          animation: "bes-shadowBreath 6s ease-in-out infinite",
        }}
      />
    </Box>
  );
}

function ActionButton({ action, primary }: { action: ErrorScreenAction; primary?: boolean }) {
  const base = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    px: "22px",
    py: "12px",
    borderRadius: "999px",
    fontSize: 13.5,
    fontWeight: primary ? 700 : 600,
    cursor: "pointer",
    textDecoration: "none",
    ...(primary
      ? {
          background:
            "linear-gradient(135deg,var(--mui-palette-primary-light),var(--mui-palette-primary-dark))",
          color: "#fff",
          border: "none",
          boxShadow: "var(--mui-palette-surface-primaryShadow)",
          "&:hover": { filter: "brightness(1.08)", color: "#fff" },
        }
      : {
          border: "1px solid",
          borderColor: "divider",
          color: "text.primary",
          background: "transparent",
          "&:hover": { bgcolor: "action.hover" },
        }),
  };
  const content = (
    <>
      {action.icon}
      {action.label}
    </>
  );
  if (action.href) {
    return (
      <Box component="a" href={action.href} sx={base}>
        {content}
      </Box>
    );
  }
  return (
    <Box
      component="button"
      type="button"
      onClick={action.onClick}
      sx={{ ...base, font: "inherit" }}
    >
      {content}
    </Box>
  );
}

export function BrandErrorScreen({
  code,
  lock,
  headline,
  subtitle,
  primary,
  secondary,
  note,
  errorLine,
}: {
  /** The two digits flanking the coin — the coin reads as the middle character,
   * so 404 is `["4","4"]`, 403 `["4","3"]`, 500 `["5","0"]`. Omit for a state
   * with no status code of its own, e.g. an expired session. */
  code?: [string, string];
  /** Draws the padlock shackle over the coin. */
  lock?: boolean;
  headline: ReactNode;
  subtitle: ReactNode;
  primary?: ErrorScreenAction;
  secondary?: ErrorScreenAction;
  note?: ReactNode;
  errorLine?: ReactNode;
}) {
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        color: "text.primary",
        backgroundColor: "background.default",
        backgroundImage:
          "radial-gradient(55% 45% at 50% 58%,var(--mui-palette-surface-heroTint),transparent 70%)",
      }}
    >
      <Box component="style">{KEYFRAMES}</Box>
      <BrandCorner />
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: "70px 24px 50px",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(10px,3vw,26px)",
          }}
        >
          {code ? (
            <Box sx={{ ...numberSx, animation: "bes-riseIn .7s ease-out both" }}>{code[0]}</Box>
          ) : null}
          <Coin lock={lock} />
          {code ? (
            <Box sx={{ ...numberSx, animation: "bes-riseIn .7s ease-out .1s both" }}>{code[1]}</Box>
          ) : null}
        </Box>

        <Box
          sx={{
            fontSize: "clamp(19px,3vw,24px)",
            fontWeight: 700,
            mt: "42px",
            animation: "bes-riseIn .6s ease-out .3s both",
          }}
        >
          {headline}
        </Box>
        <Box
          sx={{
            fontSize: 14,
            color: "text.secondary",
            mt: "10px",
            maxWidth: 410,
            lineHeight: 1.65,
            animation: "bes-riseIn .6s ease-out .45s both",
          }}
        >
          {subtitle}
        </Box>

        {primary || secondary ? (
          <Box
            sx={{
              display: "flex",
              gap: "10px",
              mt: "26px",
              flexWrap: "wrap",
              justifyContent: "center",
              animation: "bes-riseIn .6s ease-out .6s both",
            }}
          >
            {primary ? <ActionButton action={primary} primary /> : null}
            {secondary ? <ActionButton action={secondary} /> : null}
          </Box>
        ) : null}

        {note ? <Box sx={{ mt: "18px", fontSize: 12.5 }}>{note}</Box> : null}

        {errorLine ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              mt: "24px",
              fontSize: 12.5,
              color: "text.disabled",
              animation: "bes-riseIn .6s ease-out .8s both",
            }}
          >
            {errorLine}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
