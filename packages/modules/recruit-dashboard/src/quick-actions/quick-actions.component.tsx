"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
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
          <Button
            key={a.label}
            variant="outlined"
            startIcon={<IconRenderer name={a.icon} size={16} />}
            onClick={() => a.routeId && router.push(a.routeId)}
            sx={{ fontWeight: 400, fontSize: 12.5 }}
          >
            {t(a.label)}
          </Button>
        ))}
      </Box>
    </Box>
  );
}
