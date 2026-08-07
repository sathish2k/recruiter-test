"use client";

import LoginRounded from "@mui/icons-material/LoginRounded";
import { BrandErrorScreen } from "./error-screen";
import copy from "./session-expired.translations.json";

/**
 * Shown when the API rejects a request the session was supposed to authorise.
 * Rendered by AuthProvider above the whole tree, so it replaces whatever screen
 * the user was on instead of letting half-loaded data sit there looking live.
 *
 * Copy is a static import for the same reason as ServerError — by the time this
 * renders the session is gone, and a screen that depends on resolved
 * dependencies is a screen that can fail to appear.
 */
export function SessionExpired({ onSignIn }: { onSignIn: () => void }) {
  return (
    <BrandErrorScreen
      lock
      headline={copy.title}
      subtitle={copy.subtitle}
      primary={{
        label: copy.signIn,
        onClick: onSignIn,
        icon: <LoginRounded sx={{ fontSize: 16 }} />,
      }}
      errorLine={copy.errorLine}
    />
  );
}
