"use client";

import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useLocale, useTranslation } from "@recruit/sdk";
import { ListSection, SearchableSelectField } from "@recruit/shared";
import { type ReactNode, useState } from "react";
import type { LanguageConfiguration } from "./language.configuration";

interface Defaults {
  language: string;
  dateFormat: string;
  timeFormat: string;
}
interface Profile {
  preferences: Record<string, string>;
  workspace: { defaults: Defaults } | null;
}
type Mutation = Record<string, ((body?: unknown) => Promise<unknown>) | undefined>;

/** English display name for a language code, best-effort. */
function languageName(code: string): string {
  try {
    return new Intl.DisplayNames([code], { type: "language" }).of(code) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

export function LanguageComponent({ id }: { id: string }) {
  const { data, isLoading, mutation } = useFetch<Profile>(id);
  const { t } = useTranslation(id);
  if (isLoading || !data)
    return (
      <Box sx={{ maxWidth: 920 }}>
        <ListSection
          title={t("title")}
          footer={t("footer")}
          isLoading
          skeletonRows={3}
          skeletonShape={{ description: true, control: true }}
        />
      </Box>
    );
  return <LanguageEditor id={id} profile={data} mutation={mutation as Mutation} />;
}

function LanguageEditor({
  id,
  profile,
  mutation,
}: {
  id: string;
  profile: Profile;
  mutation: Mutation;
}) {
  const { t } = useTranslation(id);
  const config = useConfiguration<LanguageConfiguration>(id);
  const locale = useLocale();
  const [prefs, setPrefs] = useState<Record<string, string>>(profile.preferences ?? {});

  const defaults: Defaults = profile.workspace?.defaults ?? {
    language: "en",
    dateFormat: config.dateOptions[0] ?? "DD MMM YYYY",
    timeFormat: config.timeOptions[0] ?? "12-hour (2:30 PM)",
  };

  if (!config.languageSource) return null;

  // Push the chosen value into the localStorage-backed locale store so the whole
  // portal reformats immediately (the server seeds it on the next boot).
  const applyToLocale = (key: keyof Defaults, value: string) => {
    if (key === "language") locale.setLanguage(value);
    else if (key === "dateFormat") locale.setDateFormat(value);
    else locale.setTimeFormat(value);
  };
  const persist = (next: Record<string, string>) => {
    setPrefs(next);
    void mutation.update?.({ preferences: next });
  };
  const setOverride = (key: keyof Defaults, value: string) => {
    persist({ ...prefs, [key]: value });
    applyToLocale(key, value);
  };
  const toggleDefault = (key: keyof Defaults) => {
    if (prefs[key] === undefined) {
      setOverride(key, defaults[key]);
    } else {
      const next = { ...prefs };
      delete next[key];
      persist(next);
      applyToLocale(key, defaults[key]);
    }
  };

  const rows: { key: keyof Defaults; defaultDisplay: string; control: ReactNode }[] = [
    {
      key: "language",
      defaultDisplay: languageName(defaults.language),
      control: (
        <Box sx={{ maxWidth: 280 }}>
          <SearchableSelectField
            value={prefs.language ?? defaults.language}
            onChange={((value: string) => setOverride("language", value)) as (next: never) => void}
            source={config.languageSource}
            placeholder={t("fields.placeholder")}
          />
        </Box>
      ),
    },
    {
      key: "dateFormat",
      defaultDisplay: defaults.dateFormat,
      control: (
        <Segmented
          options={config.dateOptions}
          value={prefs.dateFormat ?? defaults.dateFormat}
          onChange={(value) => setOverride("dateFormat", value)}
        />
      ),
    },
    {
      key: "timeFormat",
      defaultDisplay: defaults.timeFormat,
      control: (
        <Segmented
          options={config.timeOptions}
          value={prefs.timeFormat ?? defaults.timeFormat}
          onChange={(value) => setOverride("timeFormat", value)}
        />
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: 920 }}>
      <ListSection
        title={t("title")}
        footer={t("footer")}
        items={rows.map((row) => {
          const usingDefault = prefs[row.key] === undefined;
          return {
            key: row.key,
            title: t(`rows.${row.key}`),
            description: t("workspaceDefault", { value: row.defaultDisplay }),
            action: (
              <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flex: "none" }}>
                <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
                  {t("useDefault")}
                </Typography>
                <Switch checked={usingDefault} onChange={() => toggleDefault(row.key)} />
              </Box>
            ),
            control: (
              <Box
                sx={{
                  opacity: usingDefault ? 0.5 : 1,
                  pointerEvents: usingDefault ? "none" : "auto",
                }}
              >
                {row.control}
              </Box>
            ),
          };
        })}
      />
    </Box>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        flexWrap: "wrap",
        gap: "4px",
        p: "4px",
        borderRadius: "11px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.default",
      }}
    >
      {options.map((option) => {
        const active = option === value;
        return (
          <Box
            key={option}
            onClick={() => onChange(option)}
            sx={{
              px: "14px",
              py: "7px",
              borderRadius: "8px",
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: "nowrap",
              cursor: "pointer",
              bgcolor: active ? "surface.hover" : "transparent",
              color: active ? "text.primary" : "text.secondary",
              "&:hover": { color: "text.primary" },
            }}
          >
            {option}
          </Box>
        );
      })}
    </Box>
  );
}
