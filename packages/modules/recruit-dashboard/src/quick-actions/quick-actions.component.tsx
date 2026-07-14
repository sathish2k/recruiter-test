"use client";

import Box from "@mui/material/Box";
import {
  useConfiguration,
  usePortalRouter,
  useTranslation,
} from "@recruit/sdk";
import { IconRenderer } from "@recruit/shared";

interface QuickAction {
  icon: string;
  label: string;
  routeId?: string;
}

export function QuickActionsComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<{ title?: string; actions?: QuickAction[] }>(
    id,
  );
  const router = usePortalRouter();
  const actions = config?.actions ?? [];

  return (
    <Box>
      <Box sx={{ fontSize: 14.5, fontWeight: 600, mb: "10px" }}>
        {t(config?.title ?? "title")}
      </Box>
      <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {actions.map((a) => (
          <Box
            key={a.label}
            onClick={() => a.routeId && router.push(a.routeId)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              p: "9px 14px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,.14)",
              fontSize: 12.5,
              color: "#ECEAE7",
              cursor: "pointer",
              "&:hover": { background: "rgba(255,255,255,.06)" },
            }}
          >
            <IconRenderer name={a.icon} size={16} />
            {t(a.label)}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
