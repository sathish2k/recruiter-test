"use client";

// Deliberate non-theme colours: the block below renders a preview of the actual
// email, which lands in a mail client on a white background regardless of what
// scheme the app is in. Theming it would misrepresent what recipients see.

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import OutlinedInput from "@mui/material/OutlinedInput";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import { IconRenderer, useToast } from "@recruit/shared";
import { useEffect, useMemo, useRef, useState } from "react";
import type { EmailTemplatesConfiguration } from "./email-templates.configuration";

interface EmailTemplate {
  id: string;
  key: string;
  icon: string;
  name: string;
  description: string;
  subject: string;
  variables: string[];
  body: string[];
  cta: string;
  footer: string;
  enabled: boolean;
}

interface Draft {
  name: string;
  subject: string;
  bodyText: string;
  enabled: boolean;
}

type FocusedField = "subject" | "body";

function fill(text: string, sample: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => sample[key] ?? match);
}

/** The design's fixed filing order; anything else lands in CUSTOM. */
const TEMPLATE_CATEGORIES: { label: string; icon: string; keys: string[] }[] = [
  { label: "categories.authentication", icon: "lock", keys: ["invite", "forgot"] },
  { label: "categories.recruitment", icon: "group", keys: ["jd", "interview"] },
  { label: "categories.clients", icon: "domain", keys: ["submission"] },
  { label: "categories.offers", icon: "description", keys: ["offer"] },
];

export function EmailTemplatesComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<EmailTemplatesConfiguration>(id);
  const sample = config.sample ?? {};
  const { data, mutation, mutate } = useFetch<EmailTemplate[]>(id);
  const templates = data ?? [];

  const { show } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [focused, setFocused] = useState<FocusedField>("body");
  const [query, setQuery] = useState("");

  // The design files templates under fixed categories, with anything unmatched
  // falling into CUSTOM, and filters name + blurb as you type.
  const grouped = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matches = (tpl: EmailTemplate) =>
      !term ||
      tpl.name.toLowerCase().includes(term) ||
      (tpl.description ?? "").toLowerCase().includes(term);

    const claimed = new Set<string>();
    const groups: { label: string; icon: string; items: EmailTemplate[] }[] = [];

    for (const category of TEMPLATE_CATEGORIES) {
      const items = templates.filter((tpl) => category.keys.includes(tpl.key) && matches(tpl));
      for (const tpl of items) claimed.add(tpl.id);
      if (items.length) groups.push({ label: category.label, icon: category.icon, items });
    }

    const rest = templates.filter((tpl) => !claimed.has(tpl.id) && matches(tpl));
    if (rest.length) groups.push({ label: "categories.custom", icon: "edit", items: rest });
    return groups;
  }, [templates, query]);

  const subjectRef = useRef<HTMLInputElement | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  const selected = templates.find((tpl) => tpl.id === selectedId) ?? templates[0] ?? null;

  useEffect(() => {
    if (templates.length === 0) return;
    if (!templates.some((tpl) => tpl.id === selectedId)) {
      setSelectedId(templates[0]?.id ?? null);
    }
  }, [templates, selectedId]);

  const selectedKey = selected?.id;
  // biome-ignore lint/correctness/useExhaustiveDependencies: resync draft only when a different template is selected.
  useEffect(() => {
    if (!selected) {
      setDraft(null);
      return;
    }
    setDraft({
      name: selected.name,
      subject: selected.subject,
      bodyText: selected.body.join("\n\n"),
      enabled: selected.enabled,
    });
  }, [selectedKey]);

  const insertVariable = (variable: string) => {
    if (!draft) return;
    const token = `{${variable}}`;
    const el = focused === "subject" ? subjectRef.current : bodyRef.current;
    const current = focused === "subject" ? draft.subject : draft.bodyText;
    const start = el?.selectionStart ?? current.length;
    const end = el?.selectionEnd ?? start;
    const next = current.slice(0, start) + token + current.slice(end);
    setDraft(focused === "subject" ? { ...draft, subject: next } : { ...draft, bodyText: next });
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const save = async () => {
    if (!selected || !draft) return;
    const body = draft.bodyText
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    await mutation.update?.({
      id: selected.id,
      name: draft.name,
      subject: draft.subject,
      body,
      enabled: draft.enabled,
    });
    await mutate();
    show(t("toast.saved"), draft.name);
  };

  const createNew = async () => {
    const res = (await mutation.create?.({})) as { data?: { id?: string } } | undefined;
    await mutate();
    const newId = res?.data?.id;
    if (newId) setSelectedId(newId);
    show(t("toast.created"));
  };

  const remove = async () => {
    if (!selected) return;
    const removedId = selected.id;
    await mutation.delete?.(removedId);
    const remaining = templates.filter((tpl) => tpl.id !== removedId);
    setSelectedId(remaining[0]?.id ?? null);
    await mutate();
    show(t("toast.deleted"), selected.name);
  };

  // ponytail: "Reset to default" re-syncs the editor to the last-saved copy
  // (a re-fetch); it does not restore the shipped default template content.
  const resetToDefault = async () => {
    await mutate();
    if (selected) {
      setDraft({
        name: selected.name,
        subject: selected.subject,
        bodyText: selected.body.join("\n\n"),
        enabled: selected.enabled,
      });
    }
    show(t("toast.reset"));
  };

  // ponytail: no mail is sent — the transactional email service isn't wired yet.
  const sendTest = () => show(t("toast.testSent"), sample.candidate_name ?? "");

  const previewBody = draft
    ? draft.bodyText
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
    : (selected?.body ?? []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{t("title")}</Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: "6px" }}>
        {t("subtitle")}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "320px 1fr" },
          gap: "18px",
          alignItems: "start",
        }}
      >
        <Card sx={{ p: "12px" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: "8px 10px 10px",
            }}
          >
            <Typography sx={{ fontSize: 11, letterSpacing: ".08em", color: "text.disabled" }}>
              {t("templatesLabel")}
            </Typography>
            <Button
              variant="contained"
              onClick={createNew}
              sx={{ px: "12px", py: "5px", fontSize: 11, fontWeight: 700, minWidth: 0 }}
            >
              {t("newTemplate")}
            </Button>
          </Box>

          {/* Filters the list in place — the design searches name and blurb. */}
          <Box
            component="label"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              bgcolor: "surface.inset",
              border: "1px solid var(--mui-palette-surface-controlBorder)",
              borderRadius: "9px",
              p: "8px 10px",
              m: "0 2px 4px",
            }}
          >
            <IconRenderer name="search" size={16} sx={{ color: "text.disabled" }} />
            <InputBase
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchTemplates")}
              sx={{
                flex: 1,
                minWidth: 0,
                fontSize: 12.5,
                color: "text.primary",
                "& .MuiInputBase-input": { p: 0, height: "auto", lineHeight: "normal" },
              }}
            />
          </Box>

          {grouped.length === 0 ? (
            <Typography
              sx={{ p: "16px 10px", textAlign: "center", fontSize: 12, color: "text.disabled" }}
            >
              {t("noTemplates")}
            </Typography>
          ) : null}

          {grouped.map((group) => (
            <Box key={group.label}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: 10,
                  letterSpacing: ".1em",
                  fontWeight: 700,
                  color: "text.disabled",
                  p: "12px 10px 5px",
                }}
              >
                <IconRenderer name={group.icon} size={13} />
                {t(group.label)}
              </Box>
              {group.items.map((tpl) => {
                const isSelected = tpl.id === selected?.id;
                const on = isSelected && draft ? draft.enabled : tpl.enabled;
                return (
                  <Box
                    key={tpl.id}
                    component="button"
                    type="button"
                    onClick={() => setSelectedId(tpl.id)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "11px",
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                      borderRadius: "11px",
                      p: "11px 12px",
                      mb: "4px",
                      background: isSelected ? "rgba(242,106,27,.12)" : "transparent",
                      border: isSelected
                        ? "1px solid rgba(242,106,27,.35)"
                        : "1px solid transparent",
                      "&:hover": {
                        background: isSelected
                          ? "rgba(242,106,27,.12)"
                          : "var(--mui-palette-surface-hoverSubtle)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        flex: "none",
                        borderRadius: "9px",
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "rgba(242,106,27,.1)",
                        border: "1px solid rgba(242,106,27,.25)",
                        color: "surface.accentBright",
                      }}
                    >
                      <IconRenderer name={tpl.icon} size={15} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>
                        {tpl.name}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: "text.disabled" }} noWrap>
                        {tpl.description}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "999px",
                        flex: "none",
                        bgcolor: on ? "success.main" : "surface.track",
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          ))}
        </Card>

        <Box sx={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {draft && selected ? (
            <Card>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  mb: "16px",
                }}
              >
                <OutlinedInput
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder={t("namePlaceholder")}
                  sx={{
                    flex: 1,
                    fontWeight: 700,
                    "& input": { fontSize: 15, fontWeight: 700 },
                  }}
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                    {draft.enabled ? t("enabled") : t("disabled")}
                  </Typography>
                  <Switch
                    checked={draft.enabled}
                    onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
                  />
                </Box>
                <IconButton onClick={remove} aria-label={t("delete")}>
                  <IconRenderer name="delete" size={15} />
                </IconButton>
              </Box>

              <Typography
                sx={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "text.secondary",
                  mb: "6px",
                }}
              >
                {t("subjectLabel")}
              </Typography>
              <OutlinedInput
                fullWidth
                value={draft.subject}
                inputRef={subjectRef}
                onFocus={() => setFocused("subject")}
                onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                placeholder={t("subjectPlaceholder")}
                sx={{ mb: "16px" }}
              />

              <Typography
                sx={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "text.secondary",
                  mb: "6px",
                }}
              >
                {t("variablesLabel")}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "7px",
                  mb: "16px",
                }}
              >
                {selected.variables.map((variable) => (
                  <Chip
                    key={variable}
                    variant="soft"
                    color="primary"
                    label={`{${variable}}`}
                    onClick={() => insertVariable(variable)}
                  />
                ))}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  mb: "6px",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "text.secondary",
                  }}
                >
                  {t("bodyLabel")}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
                  {t("bodyHint")}
                </Typography>
              </Box>
              <OutlinedInput
                fullWidth
                multiline
                minRows={8}
                value={draft.bodyText}
                inputRef={bodyRef}
                onFocus={() => setFocused("body")}
                onChange={(e) => setDraft({ ...draft, bodyText: e.target.value })}
                placeholder={t("bodyPlaceholder")}
                sx={{ mb: "16px" }}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <Button variant="contained" onClick={save}>
                  {t("save")}
                </Button>
              </Box>
            </Card>
          ) : (
            <Card>
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{t("empty")}</Typography>
            </Card>
          )}

          {draft && selected ? (
            <Card sx={{ p: "16px 18px" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: "12px",
                }}
              >
                <Typography variant="overline">{t("previewLabel")}</Typography>
                <Box sx={{ display: "flex", gap: "8px" }}>
                  <Button variant="outlined" size="small" onClick={resetToDefault}>
                    {t("resetDefault")}
                  </Button>
                  <Button variant="contained" color="secondary" size="small" onClick={sendTest}>
                    {t("sendTest")}
                  </Button>
                </Box>
              </Box>

              {/* ponytail: this card emulates an email client, not app chrome, so
                  the literal light inbox colors below are intentional. */}
              <Box
                sx={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid rgba(0,0,0,0.15)",
                  background: "#FFFFFF",
                  color: "#1A1A1A",
                }}
              >
                <Box sx={{ height: 5, background: "var(--mui-palette-primary-main)" }} />
                <Box sx={{ p: "22px 26px" }}>
                  <Typography
                    sx={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#1A1A1A",
                      mb: "4px",
                    }}
                  >
                    {sample.agency ?? "Troy Consultancy"}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#111",
                      mb: "16px",
                    }}
                  >
                    {fill(draft.subject, sample)}
                  </Typography>
                  {previewBody.map((paragraph, index) => (
                    <Typography
                      // biome-ignore lint/suspicious/noArrayIndexKey: preview paragraphs are positional and non-reorderable.
                      key={index}
                      sx={{
                        fontSize: 13.5,
                        lineHeight: 1.6,
                        color: "#333",
                        whiteSpace: "pre-line",
                        mb: "12px",
                      }}
                    >
                      {fill(paragraph, sample)}
                    </Typography>
                  ))}
                  <Box
                    sx={{
                      display: "inline-block",
                      background: "var(--mui-palette-primary-main)",
                      color: "#FFFFFF",
                      fontSize: 13,
                      fontWeight: 600,
                      borderRadius: "8px",
                      p: "10px 20px",
                      mt: "4px",
                    }}
                  >
                    {selected.cta}
                  </Box>
                  <Box
                    sx={{
                      mt: "22px",
                      pt: "16px",
                      borderTop: "1px solid rgba(0,0,0,0.1)",
                    }}
                  >
                    <Typography sx={{ fontSize: 11.5, color: "#888" }}>
                      {fill(selected.footer, sample)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Card>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
