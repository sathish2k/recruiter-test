"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import { IconRenderer, Toast, useToast } from "@recruit/shared";
import { useMemo, useState } from "react";
import type { AutomationConfig } from "./automation.configuration";

interface AutomationView {
  id: string;
  key: string;
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
  runs: number;
  meta: string;
}

interface AutomationRun {
  icon: string;
  color: string;
  text: string;
  when: string;
  failed: boolean;
}

interface AutomationData {
  automations: AutomationView[];
  stats: { activeCount: number; totalCount: number; runsWeek: number };
  recentRuns: AutomationRun[];
  impact: { label: string; value: string }[];
}

type Translate = (key: string, vars?: Record<string, unknown>) => string;

function RecipeCard({
  recipe,
  enabled,
  onToggle,
  onEdit,
  t,
}: {
  recipe: AutomationView;
  enabled: boolean;
  onToggle: (next: boolean) => void;
  onEdit: () => void;
  t: Translate;
}) {
  return (
    <Card
      variant={enabled ? "highlight" : "base"}
      sx={{ display: "flex", flexDirection: "column", gap: "12px" }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "11px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
            bgcolor: enabled ? "rgba(242,106,27,.14)" : "rgba(255,255,255,.06)",
          }}
        >
          <IconRenderer
            name={recipe.icon}
            size={19}
            color={enabled ? "#FF9D57" : "#9A968E"}
          />
        </Box>
        <Typography sx={{ flex: 1, fontSize: 14, fontWeight: 600, mt: "2px" }}>
          {recipe.title}
        </Typography>
        <Switch
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
      </Box>
      <Typography
        sx={{ fontSize: 12.5, color: "text.secondary", lineHeight: 1.5 }}
      >
        {recipe.description}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          mt: "2px",
          pt: "12px",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <IconRenderer name="replay" size={14} color="#7C7972" />
        <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>
          {t("card.runs", { runs: recipe.runs })}
          {recipe.meta ? ` · ${recipe.meta}` : ""}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="text"
          onClick={onEdit}
          sx={{ minWidth: 0, p: "2px 8px", fontSize: 12 }}
        >
          {t("card.edit")}
        </Button>
      </Box>
    </Card>
  );
}

export function AutomationComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<AutomationConfig>(id);
  const { toast, show, clear } = useToast();
  const { data, mutate, mutation } = useFetch<AutomationData>(id);

  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const stats = useMemo(() => {
    if (!data) return { activeCount: 0, totalCount: 0, runsWeek: 0 };
    const list = data.automations.map((a) => ({
      ...a,
      enabled: overrides[a.id] ?? a.enabled,
    }));
    const active = list.filter((a) => a.enabled);
    return {
      activeCount: active.length,
      totalCount: list.length,
      runsWeek: active.reduce((sum, a) => sum + a.runs, 0),
    };
  }, [data, overrides]);

  if (!data) return null;

  const toggle = async (recipe: AutomationView, next: boolean) => {
    setOverrides((prev) => ({ ...prev, [recipe.id]: next }));
    await mutation.update?.({ id: recipe.id, enabled: next });
    await mutate();
    show(
      t(next ? "toast.enabledTitle" : "toast.disabledTitle"),
      t("toast.toggleSub", {
        title: recipe.title,
        state: t(next ? "toast.on" : "toast.off"),
      }),
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
          {t("header.summary", {
            active: stats.activeCount,
            total: stats.totalCount,
            runs: stats.runsWeek,
          })}
        </Typography>
        <Button
          variant="contained"
          startIcon={<IconRenderer name={config.addIcon} size={16} />}
          onClick={() => show(t("toast.builderTitle"), t("toast.builderSub"))}
        >
          {t("header.newAutomation")}
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
            alignItems: "start",
          }}
        >
          {data.automations.map((recipe) => {
            const enabled = overrides[recipe.id] ?? recipe.enabled;
            return (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                enabled={enabled}
                onToggle={(next) => void toggle(recipe, next)}
                onEdit={() =>
                  show(
                    t("toast.editTitle"),
                    t("toast.editSub", { title: recipe.title }),
                  )
                }
                t={t}
              />
            );
          })}
        </Box>

        <Box
          sx={{
            width: 350,
            flex: "0 0 350px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <Card variant="base">
            <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
              {t("recentRuns.title")}
            </Typography>
            <Typography
              sx={{
                fontSize: 12.5,
                color: "text.secondary",
                mt: "2px",
                mb: "14px",
              }}
            >
              {t("recentRuns.subtitle")}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {data.recentRuns.map((run) => (
                <Box
                  key={run.text}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <IconRenderer name={run.icon} size={16} color={run.color} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12.5 }}>{run.text}</Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        mt: "3px",
                      }}
                    >
                      <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
                        {run.when}
                      </Typography>
                      {run.failed ? (
                        <Button
                          variant="text"
                          onClick={() =>
                            show(t("toast.retryTitle"), t("toast.retrySub"))
                          }
                          sx={{ minWidth: 0, p: 0, fontSize: 11.5 }}
                        >
                          {t("recentRuns.retry")}
                        </Button>
                      ) : null}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>

          <Card variant="accent">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                mb: "16px",
              }}
            >
              <IconRenderer
                name={config.impactIcon}
                size={17}
                color="#FF9D57"
              />
              <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
                {t("impact.title")}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {data.impact.map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    {item.label}
                  </Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Box>
      </Box>

      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
