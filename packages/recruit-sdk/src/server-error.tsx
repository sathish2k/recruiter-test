"use client";

import RefreshRounded from "@mui/icons-material/RefreshRounded";
import SpaceDashboardRounded from "@mui/icons-material/SpaceDashboardRounded";
import { BrandErrorScreen } from "./error-screen";
import copy from "./server-error.translations.json";

/**
 * The last-resort boundary: whatever failed may include the engine that resolves
 * translations, so this screen reads its copy from a static import rather than
 * through `useTranslation`. Text still lives outside the component; it just
 * cannot follow the user's language, which is the price of a crash screen that
 * always renders.
 */
export function ServerError({ onRetry }: { onRetry?: () => void }) {
  return (
    <BrandErrorScreen
      code={["5", "0"]}
      headline={copy.title}
      subtitle={copy.subtitle}
      primary={
        onRetry
          ? {
              label: copy.retry,
              onClick: onRetry,
              icon: <RefreshRounded sx={{ fontSize: 16 }} />,
            }
          : undefined
      }
      secondary={{
        label: copy.backToDashboard,
        href: "/",
        icon: <SpaceDashboardRounded sx={{ fontSize: 16 }} />,
      }}
      errorLine={copy.errorLine}
    />
  );
}
