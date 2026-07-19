import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const ORANGE_GRADIENT = "linear-gradient(135deg,#FF8A3C,#E4560F)";

export function NotFound() {
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: "24px",
        bgcolor: "background.default",
        background:
          "radial-gradient(70% 55% at 50% 0%,rgba(242,106,27,.28),rgba(19,19,19,0) 60%),radial-gradient(60% 50% at 50% 120%,rgba(242,106,27,.22),rgba(19,19,19,0) 65%),#131313",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 30,
          left: 40,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
        }}
      >
        <Avatar
          variant="rounded"
          sx={{
            width: 34,
            height: 34,
            background: ORANGE_GRADIENT,
            fontWeight: 700,
            fontSize: 16,
            color: "#fff",
          }}
        >
          T
        </Avatar>
        <Typography sx={{ fontWeight: 700, fontSize: 15.5 }}>Troy</Typography>
      </Box>

      <Box sx={{ textAlign: "center", maxWidth: 520, position: "relative" }}>
        <Typography
          sx={{
            fontSize: { xs: 120, sm: 168 },
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            backgroundImage: ORANGE_GRADIENT,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </Typography>
        <Typography
          sx={{ fontSize: 24, fontWeight: 700, mt: "8px", mb: "10px" }}
        >
          This page went off the map
        </Typography>
        <Typography
          sx={{
            fontSize: 14.5,
            color: "text.secondary",
            lineHeight: 1.55,
            mb: "28px",
          }}
        >
          The page you're looking for doesn't exist, was moved, or the link that
          brought you here is out of date.
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Button variant="contained" component="a" href="/">
            Back to Dashboard
          </Button>
          <Button variant="outlined" component="a" href="/candidates">
            Candidates
          </Button>
        </Box>
        <Typography sx={{ fontSize: 12, color: "text.disabled", mt: "26px" }}>
          Error code: 404
        </Typography>
      </Box>
    </Box>
  );
}
