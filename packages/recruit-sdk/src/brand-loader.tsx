"use client";

import Box from "@mui/material/Box";

// `#F59E0B` below is the brand mark's own accent — it belongs to the logo, not
// the theme, so it stays fixed in both modes. Everything structural (ring,
// backdrop, the other two orbits) reads theme CSS variables.
//
// Loading state from the Claude Design source ("AIRecruiter - Loader"): the
// brand mark sits inside three counter-rotating orbits, with the runway stroke
// drawing itself and a comet running off the end. Lives in the SDK rather than
// @recruit/shared because the SDK's AuthProvider needs it and never imports
// upward — same reason as `error-screen.tsx`.

const KEYFRAMES = `
@keyframes hpxSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes hpxOrbit{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes hpxDraw{0%{stroke-dashoffset:34;opacity:0}12%{opacity:1}55%{stroke-dashoffset:0;opacity:1}78%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:0;opacity:0}}
@keyframes hpxComet{0%,45%{transform:translate(0,0) scale(.4);opacity:0}55%{transform:translate(0,0) scale(1);opacity:1}85%{transform:translate(9px,-8px) scale(1.15);opacity:1}100%{transform:translate(14px,-12px) scale(.2);opacity:0}}
@keyframes hpxPulse{0%,100%{transform:scale(1);opacity:.35}50%{transform:scale(1.5);opacity:0}}
@keyframes hpxFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@media (prefers-reduced-motion: reduce){
  .hpx-loader *{animation-duration:0s !important;animation-iteration-count:1 !important}
  .hpx-loader .hpx-arc{animation:hpxSpin 1.6s linear infinite !important}
}
`;

/** Orbit ring: an absolutely-positioned rotator with a single dot on its edge. */
function Orbit({
  inset,
  size,
  color,
  duration,
  reverse,
}: {
  inset: number;
  size: number;
  color: string;
  duration: number;
  reverse?: boolean;
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        inset: `${inset}px`,
        animation: `hpxOrbit ${duration}s linear infinite${reverse ? " reverse" : ""}`,
      }}
    >
      <Box
        component="span"
        sx={{
          position: "absolute",
          top: `${-size / 2}px`,
          left: "50%",
          ml: `${-size / 2}px`,
          width: size,
          height: size,
          borderRadius: "999px",
          background: color,
          boxShadow: `0 0 ${size + 3}px ${color}`,
        }}
      />
    </Box>
  );
}

export interface BrandLoaderProps {
  /** Diameter of the orbit system. The mark scales with it. */
  size?: number;
  /** Optional caption under the mark. */
  label?: string;
}

/** The mark + orbits on their own — drop into a card, a table, or a page. */
export function BrandLoader({ size = 140, label }: BrandLoaderProps) {
  const mark = Math.round(size * 0.457); // 64 at the design's 140
  const scale = size / 140;

  return (
    <Box
      className="hpx-loader"
      role="status"
      aria-live="polite"
      aria-label={label ?? "Loading"}
      sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
    >
      <style>{KEYFRAMES}</style>

      <Box
        sx={{
          position: "relative",
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "hpxFloat 4.5s ease-in-out infinite",
        }}
      >
        {/* Static track + the sweeping conic arc riding on it. */}
        <Box
          sx={{
            position: "absolute",
            inset: `${10 * scale}px`,
            borderRadius: "999px",
            border: "1px solid var(--mui-palette-surface-tint)",
          }}
        />
        <Box
          className="hpx-arc"
          sx={{
            position: "absolute",
            inset: `${10 * scale}px`,
            borderRadius: "999px",
            background: "conic-gradient(from 0deg, rgba(245,158,11,.4), transparent 22%)",
            WebkitMask:
              "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))",
            animation: "hpxSpin 2.8s linear infinite",
          }}
        />

        <Orbit inset={0} size={5 * scale} color="#F59E0B" duration={6} />
        <Orbit
          inset={16 * scale}
          size={4 * scale}
          color="var(--mui-palette-primary-light)"
          duration={9}
          reverse
        />
        <Orbit
          inset={27 * scale}
          size={3 * scale}
          color="var(--mui-palette-info-light)"
          duration={13}
        />

        <Box sx={{ position: "relative", width: mark, height: mark }}>
          {/* Halo pulsing out from behind the mark. */}
          <Box
            sx={{
              position: "absolute",
              inset: `${4 * scale}px`,
              borderRadius: "999px",
              background: "rgba(255,255,255,.22)",
              animation: "hpxPulse 2.2s ease-out infinite",
            }}
          />
          {/* The mark itself, with the runway knocked out of the disc. */}
          <Box
            component="svg"
            width={mark}
            height={mark}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            sx={{
              position: "relative",
              display: "block",
              filter: "drop-shadow(0 10px 30px rgba(0,0,0,.5))",
              color: "text.primary",
            }}
          >
            <defs>
              <mask id="hpx-loader-mask">
                <rect width="48" height="48" fill="white" />
                <path d="M2 31 H46" stroke="black" strokeWidth="3.5" />
                <path d="M18 31 L44 13" stroke="black" strokeWidth="3.5" />
              </mask>
            </defs>
            <circle cx="24" cy="24" r="19" fill="currentColor" mask="url(#hpx-loader-mask)" />
          </Box>
          {/* Runway stroke drawing itself, with the comet running off the end. */}
          <Box
            component="svg"
            width={mark}
            height={mark}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            sx={{ position: "absolute", inset: 0, overflow: "visible" }}
          >
            <path
              d="M18 31 L44 13"
              stroke="#F59E0B"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="34"
              strokeDashoffset="34"
              style={{ animation: "hpxDraw 2.2s ease-in-out infinite" }}
            />
            <circle
              cx="44"
              cy="13"
              r="2.8"
              fill="#F59E0B"
              style={{
                animation: "hpxComet 2.2s ease-in-out infinite",
                filter: "drop-shadow(0 0 4px rgba(245,158,11,.9))",
              }}
            />
          </Box>
        </Box>
      </Box>

      {label ? (
        <Box sx={{ fontSize: 12.5, color: "text.secondary", mt: "6px" }}>{label}</Box>
      ) : null}
    </Box>
  );
}

/** Full-viewport loading screen, on the design's radial-glow backdrop. */
export function BrandLoaderScreen({ size, label }: BrandLoaderProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        color: "text.primary",
        // Brand glow over the themed page colour — same in both schemes, since
        // the base beneath it is a token.
        background:
          "radial-gradient(620px 420px at 50% 38%, rgba(242,106,27,.08), transparent 65%), radial-gradient(900px 600px at 50% 110%, rgba(245,158,11,.05), transparent 60%), var(--mui-palette-background-default)",
      }}
    >
      <Box sx={{ p: "40px" }}>
        <BrandLoader size={size} label={label} />
      </Box>
    </Box>
  );
}
