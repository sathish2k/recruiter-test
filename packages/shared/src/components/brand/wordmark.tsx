import Box from "@mui/material/Box";

// Brand wordmark from the Claude Design source: "HirePilot" + an orange "X",
// set in Manrope (via the --font-manrope CSS variable loaded by the app).
export function BrandWordmark({ fontSize = 15.5 }: { fontSize?: number }) {
  return (
    <Box
      component="span"
      sx={{
        fontFamily: "var(--font-manrope), 'Manrope', ui-sans-serif, sans-serif",
        fontWeight: 700,
        fontSize,
        letterSpacing: "-.02em",
        lineHeight: 1,
      }}
    >
      HirePilot
      <Box component="span" sx={{ color: "#F59E0B" }}>
        X
      </Box>
    </Box>
  );
}
