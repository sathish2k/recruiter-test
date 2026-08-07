"use client";

import Box from "@mui/material/Box";
import { useIsNavigating } from "./navigation";

const KEYFRAMES = `
@keyframes hpxNavProgress{
  0%{transform:translateX(-100%)}
  50%{transform:translateX(-25%)}
  100%{transform:translateX(0)}
}
@media (prefers-reduced-motion: reduce){
  .hpx-nav-progress span{animation:none !important;transform:translateX(-8%) !important}
}
`;

/**
 * Thin progress bar pinned to the top of the viewport while a route change is
 * resolving. The page underneath stays on screen — this is the only navigation
 * feedback, so switching tabs never blanks or shows a full-screen loader.
 */
export function NavigationProgress() {
  const navigating = useIsNavigating();

  return (
    <Box
      className="hpx-nav-progress"
      aria-hidden={!navigating}
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 2000,
        overflow: "hidden",
        pointerEvents: "none",
        // Fades out rather than vanishing, so a fast transition doesn't flicker.
        opacity: navigating ? 1 : 0,
        transition: "opacity .25s ease",
      }}
    >
      <style>{KEYFRAMES}</style>
      {navigating ? (
        <Box
          component="span"
          sx={{
            display: "block",
            height: "100%",
            background: (theme) => theme.gradients.primary,
            animation: "hpxNavProgress 1.2s ease-out forwards",
          }}
        />
      ) : null}
    </Box>
  );
}
