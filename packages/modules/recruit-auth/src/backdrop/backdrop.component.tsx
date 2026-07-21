"use client";

// Deliberate non-theme colours: this is the auth hero surface from the design.
// It is a fixed dark canvas in both schemes by intent — the sign-in card sits on
// it and carries the themed chrome.
import Box from "@mui/material/Box";
import { BrandLogo, BrandWordmark } from "@recruit/shared";

export function AuthBackdropComponent() {
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        background:
          "radial-gradient(80% 60% at 50% 115%,rgba(242,106,27,.38),rgba(19,19,19,0) 65%),radial-gradient(55% 40% at 50% -10%,rgba(242,106,27,.16),rgba(19,19,19,0) 60%),#141312",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: "-10%",
          top: "-40%",
          width: "34%",
          height: "180%",
          transform: "rotate(24deg)",
          background: "linear-gradient(90deg,transparent,rgba(255,138,60,.13),transparent)",
          filter: "blur(24px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          left: "26%",
          top: "-40%",
          width: "22%",
          height: "180%",
          transform: "rotate(24deg)",
          background: "linear-gradient(90deg,transparent,rgba(255,183,128,.09),transparent)",
          filter: "blur(20px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          left: "58%",
          top: "-40%",
          width: "30%",
          height: "180%",
          transform: "rotate(24deg)",
          background: "linear-gradient(90deg,transparent,rgba(228,86,15,.15),transparent)",
          filter: "blur(28px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(255,255,255,.055) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(60% 60% at 50% 50%,black,transparent 80%)",
          WebkitMaskImage: "radial-gradient(60% 60% at 50% 50%,black,transparent 80%)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "-20%",
          height: "50%",
          background: "radial-gradient(50% 60% at 50% 100%,rgba(242,106,27,.3),transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: 32,
          left: 40,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          color: "text.primary",
        }}
      >
        <BrandLogo size={34} />
        <BrandWordmark fontSize={18} />
      </Box>
    </Box>
  );
}
