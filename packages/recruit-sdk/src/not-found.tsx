import HelpOutlineRounded from "@mui/icons-material/HelpOutlineRounded";
import SpaceDashboardRounded from "@mui/icons-material/SpaceDashboardRounded";
import { BrandErrorScreen } from "./error-screen";

export function NotFound() {
  return (
    <BrandErrorScreen
      variant="notFound"
      headline="The pilot left this page"
      subtitle="It was moved, renamed, or never took off. Check the link — or fly back to somewhere that exists."
      primary={{
        label: "Back to Dashboard",
        href: "/",
        icon: <SpaceDashboardRounded sx={{ fontSize: 16 }} />,
      }}
      secondary={{
        label: "Help Center",
        href: "/help",
        icon: <HelpOutlineRounded sx={{ fontSize: 16 }} />,
      }}
      errorLine="Error code: 404"
    />
  );
}
