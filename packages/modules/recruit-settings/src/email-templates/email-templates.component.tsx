"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import OutlinedInput from "@mui/material/OutlinedInput";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import { IconRenderer, Modal, useModal, useToast } from "@recruit/shared";
import { useEffect, useMemo, useRef, useState } from "react";
import { EmailPreview } from "./email-preview";
import type { EmailTemplatesConfiguration } from "./email-templates.configuration";
import { assistEmailBody, resetEmailTemplate, sendTestEmail } from "./email-templates.datasource";

type TemplateStatus = "enabled" | "draft" | "disabled";

export interface EmailTemplate {
  id: string;
  key: string;
  icon: string;
  name: string;
  description: string;
  category: "auth" | "biz" | "custom";
  subject: string;
  preheader: string;
  heading: string;
  variables: string[];
  body: string[];
  cta: string;
  ctaUrl: string;
  footer: string;
  sampleTo: string;
  status: TemplateStatus;
  isDefault: boolean;
}

interface Draft {
  name: string;
  subject: string;
  preheader: string;
  heading: string;
  cta: string;
  bodyText: string;
  status: TemplateStatus;
}

const STATUSES: TemplateStatus[] = ["enabled", "draft", "disabled"];
const STATUS_DOT: Record<TemplateStatus, string> = {
  enabled: "success.main",
  draft: "surface.track",
  disabled: "error.main",
};

/** Body text is stored as paragraphs; a blank line is the separator. */
const toParagraphs = (text: string) =>
  text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

const draftOf = (template: EmailTemplate): Draft => ({
  name: template.name,
  subject: template.subject,
  preheader: template.preheader,
  heading: template.heading,
  cta: template.cta,
  bodyText: template.body.join("\n\n"),
  status: template.status,
});

export function EmailTemplatesComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<EmailTemplatesConfiguration>(id);
  const { data, mutation, mutate } = useFetch<EmailTemplate[]>(id);
  const templates = useMemo(() => data ?? [], [data]);
  const { show } = useToast();
  const resetConfirm = useModal();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [query, setQuery] = useState("");
  const [varOpen, setVarOpen] = useState(false);
  const [varQuery, setVarQuery] = useState("");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [testOpen, setTestOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [busy, setBusy] = useState(false);
  // Sample values are per-screen scratch data — the design lets you edit them
  // to see the template with your own names before sending a test.
  const [sample, setSample] = useState<Record<string, string>>(config.sample ?? {});

  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  const selected = templates.find((tpl) => tpl.id === selectedId) ?? templates[0] ?? null;
  const selectedKey = selected?.id;

  useEffect(() => {
    if (templates.length && !templates.some((tpl) => tpl.id === selectedId)) {
      setSelectedId(templates[0]?.id ?? null);
    }
  }, [templates, selectedId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: resync the draft only when a different template is selected.
  useEffect(() => {
    setDraft(selected ? draftOf(selected) : null);
    setVarOpen(false);
    setTestOpen(false);
  }, [selectedKey]);

  // The design files templates under fixed categories, with anything unmatched
  // falling into CUSTOM, and filters name + blurb as you type.
  const grouped = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matches = (tpl: EmailTemplate) =>
      !term ||
      tpl.name.toLowerCase().includes(term) ||
      tpl.description.toLowerCase().includes(term);

    const claimed = new Set<string>();
    const groups: { label: string; icon: string; items: EmailTemplate[] }[] = [];

    for (const category of config.categories ?? []) {
      const items = category.keys
        .map((key) => templates.find((tpl) => tpl.key === key))
        .filter((tpl): tpl is EmailTemplate => Boolean(tpl) && matches(tpl as EmailTemplate));
      for (const tpl of items) claimed.add(tpl.id);
      if (items.length) groups.push({ label: category.label, icon: category.icon, items });
    }

    const rest = templates.filter((tpl) => !claimed.has(tpl.id) && matches(tpl));
    if (rest.length) groups.push({ label: "categories.custom", icon: "edit", items: rest });
    return groups;
  }, [templates, query, config.categories]);

  // Only the variables this template declares, in the configured group order.
  const variableGroups = useMemo(() => {
    if (!selected) return [];
    const term = varQuery.trim().toLowerCase();
    const declared = new Set(selected.variables);
    const claimed = new Set<string>();
    const groups: { label: string; items: string[] }[] = [];

    for (const group of config.variableGroups ?? []) {
      const items = group.variables.filter(
        (name) => declared.has(name) && (!term || name.includes(term)),
      );
      for (const name of items) claimed.add(name);
      if (items.length) groups.push({ label: group.label, items });
    }
    const rest = selected.variables.filter(
      (name) => !claimed.has(name) && (!term || name.includes(term)),
    );
    if (rest.length) groups.push({ label: "variableGroups.workspace", items: rest });
    return groups;
  }, [selected, varQuery, config.variableGroups]);

  const insertVariable = (variable: string) => {
    if (!draft) return;
    const token = `{${variable}}`;
    const element = bodyRef.current;
    const start = element?.selectionStart ?? draft.bodyText.length;
    const end = element?.selectionEnd ?? start;
    const next = draft.bodyText.slice(0, start) + token + draft.bodyText.slice(end);
    setDraft({ ...draft, bodyText: next });
    setVarOpen(false);
    requestAnimationFrame(() => {
      if (!element) return;
      element.focus();
      const caret = start + token.length;
      element.setSelectionRange(caret, caret);
    });
  };

  const appendFragment = (fragment: string) => {
    if (!draft) return;
    const element = bodyRef.current;
    const start = element?.selectionStart ?? draft.bodyText.length;
    const end = element?.selectionEnd ?? start;
    setDraft({
      ...draft,
      bodyText: draft.bodyText.slice(0, start) + fragment + draft.bodyText.slice(end),
    });
    requestAnimationFrame(() => {
      if (!element) return;
      element.focus();
      const caret = start + fragment.length;
      element.setSelectionRange(caret, caret);
    });
  };

  const save = async (patch?: Partial<Draft>) => {
    if (!selected || !draft) return;
    const next = { ...draft, ...patch };
    setDraft(next);
    await mutation.update?.({
      id: selected.id,
      name: next.name,
      subject: next.subject,
      preheader: next.preheader,
      heading: next.heading,
      cta: next.cta,
      body: toParagraphs(next.bodyText),
      status: next.status,
    });
    await mutate();
  };

  const setStatus = async (status: TemplateStatus) => {
    if (!draft) return;
    await save({ status });
    show(t("toast.statusChanged", { status: t(`status.${status}`).toLowerCase() }), draft.name);
  };

  const createNew = async () => {
    const created = (await mutation.create?.({})) as { data?: { id?: string } } | undefined;
    await mutate();
    if (created?.data?.id) setSelectedId(created.data.id);
    show(t("toast.created"));
  };

  const remove = async () => {
    if (!selected) return;
    const removed = selected;
    await mutation.delete?.(removed.id);
    setSelectedId(templates.find((tpl) => tpl.id !== removed.id)?.id ?? null);
    await mutate();
    show(t("toast.deleted"), removed.name);
  };

  const resetToDefault = async () => {
    if (!selected) return;
    resetConfirm.close();
    await resetEmailTemplate(selected.id);
    await mutate();
    show(t("toast.reset"), selected.name);
  };

  const runAssist = async (action: string) => {
    if (!draft) return;
    setBusy(true);
    try {
      const result = await assistEmailBody(action, draft.bodyText);
      setDraft({ ...draft, bodyText: result.data.body });
      show(t("toast.aiApplied"), t(`ai.${action}`));
    } catch {
      show(t("toast.aiFailed"));
    } finally {
      setBusy(false);
    }
  };

  const sendTest = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      // Save first, so the test is the template as edited, not as last stored.
      await save();
      const result = (await sendTestEmail(selected.id, testEmail.trim(), sample)) as {
        data?: { to?: string };
      };
      setTestOpen(false);
      show(t("toast.testSent"), result.data?.to ?? testEmail);
    } catch {
      show(t("toast.testFailed"));
    } finally {
      setBusy(false);
    }
  };

  const statusLocked = selected?.category === "auth";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{t("title")}</Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: "6px" }}>
        {t("subtitle")}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "300px 1fr" },
          gap: "16px",
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
                const status = isSelected && draft ? draft.status : tpl.status;
                return (
                  <Box
                    key={tpl.id}
                    component="button"
                    type="button"
                    title={t(`status.${status}`)}
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
                      bgcolor: isSelected ? "surface.primarySoftBg" : "transparent",
                      border: "1px solid",
                      borderColor: isSelected ? "surface.primarySoftBorder" : "transparent",
                      "&:hover": {
                        bgcolor: isSelected ? "surface.primarySoftBg" : "surface.hoverSubtle",
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
                        bgcolor: "surface.primarySoftBg",
                        border: "1px solid var(--mui-palette-surface-primarySoftBorder)",
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
                        bgcolor: STATUS_DOT[status],
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          ))}
        </Card>

        <Box sx={{ display: "flex", flexDirection: "column", gap: "14px", minWidth: 0 }}>
          {draft && selected ? (
            <>
              <Card>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                    mb: "14px",
                  }}
                >
                  <InputBase
                    value={draft.name}
                    onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                    placeholder={t("namePlaceholder")}
                    title={t("nameTitle")}
                    sx={{
                      minWidth: 260,
                      fontSize: 15,
                      fontWeight: 700,
                      borderBottom: "1px dashed var(--mui-palette-surface-border)",
                      "&:focus-within": { borderBottomColor: "primary.main" },
                      "& .MuiInputBase-input": { p: "2px 0", fontSize: 15, fontWeight: 700 },
                    }}
                  />
                  <Tooltip title={statusLocked ? t("lockedStatus") : ""} placement="top">
                    <Box
                      sx={{
                        display: "flex",
                        bgcolor: "surface.inset",
                        border: "1px solid var(--mui-palette-surface-controlBorder)",
                        borderRadius: "999px",
                        p: "3px",
                        gap: "3px",
                        opacity: statusLocked ? 0.55 : 1,
                      }}
                    >
                      {STATUSES.map((status) => {
                        const on = draft.status === status;
                        return (
                          <Box
                            key={status}
                            component="button"
                            type="button"
                            disabled={statusLocked}
                            onClick={() => setStatus(status)}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              p: "5px 11px",
                              border: "none",
                              borderRadius: "999px",
                              bgcolor: on ? "surface.pillActive" : "transparent",
                              color: on ? "text.primary" : "text.secondary",
                              fontSize: 11.5,
                              fontWeight: 600,
                              fontFamily: "inherit",
                              whiteSpace: "nowrap",
                              cursor: statusLocked ? "not-allowed" : "pointer",
                            }}
                          >
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "999px",
                                flex: "none",
                                bgcolor: STATUS_DOT[status],
                              }}
                            />
                            {t(`status.${status}`)}
                          </Box>
                        );
                      })}
                    </Box>
                  </Tooltip>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: "12px",
                    mb: "12px",
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary" }}>
                      {t("subjectLabel")}
                    </Typography>
                    <OutlinedInput
                      fullWidth
                      value={draft.subject}
                      onChange={(event) => setDraft({ ...draft, subject: event.target.value })}
                      placeholder={t("subjectPlaceholder")}
                    />
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary" }}>
                      {t("preheaderLabel")}
                    </Typography>
                    <OutlinedInput
                      fullWidth
                      value={draft.preheader}
                      onChange={(event) => setDraft({ ...draft, preheader: event.target.value })}
                      placeholder={t("preheaderHint")}
                    />
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary" }}>
                      {t("headingLabel")}
                    </Typography>
                    <OutlinedInput
                      fullWidth
                      value={draft.heading}
                      onChange={(event) => setDraft({ ...draft, heading: event.target.value })}
                      placeholder={t("headingPlaceholder")}
                    />
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary" }}>
                      {t("ctaLabel")}
                    </Typography>
                    <OutlinedInput
                      fullWidth
                      value={draft.cta}
                      onChange={(event) => setDraft({ ...draft, cta: event.target.value })}
                    />
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    flexWrap: "wrap",
                    position: "relative",
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => setVarOpen((open) => !open)}
                    startIcon={<IconRenderer name="code-block" size={14} />}
                    sx={{ borderRadius: "999px", fontSize: 12, fontWeight: 700 }}
                  >
                    {t("insertVariable")}
                  </Button>
                  <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
                    {t("insertVariableHint")}
                  </Typography>

                  {varOpen ? (
                    <ClickAwayListener onClickAway={() => setVarOpen(false)}>
                      <Paper
                        variant="dropdown"
                        sx={{
                          position: "absolute",
                          top: "calc(100% + 8px)",
                          left: 0,
                          zIndex: 35,
                          width: 290,
                          p: "8px",
                        }}
                      >
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
                            mb: "4px",
                          }}
                        >
                          <IconRenderer name="search" size={16} sx={{ color: "text.disabled" }} />
                          <InputBase
                            autoFocus
                            value={varQuery}
                            onChange={(event) => setVarQuery(event.target.value)}
                            placeholder={t("searchVariables")}
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              fontSize: 12.5,
                              "& .MuiInputBase-input": { p: 0, height: "auto" },
                            }}
                          />
                        </Box>
                        <Box sx={{ maxHeight: 230, overflowY: "auto" }}>
                          {variableGroups.length === 0 ? (
                            <Typography
                              sx={{
                                p: "14px 10px",
                                textAlign: "center",
                                fontSize: 12,
                                color: "text.disabled",
                              }}
                            >
                              {t("noVariables")}
                            </Typography>
                          ) : null}
                          {variableGroups.map((group) => (
                            <Box key={group.label}>
                              <Typography
                                sx={{
                                  fontSize: 10,
                                  letterSpacing: ".08em",
                                  fontWeight: 700,
                                  color: "text.disabled",
                                  p: "8px 10px 4px",
                                }}
                              >
                                {t(group.label)}
                              </Typography>
                              {group.items.map((variable) => (
                                <Box
                                  key={variable}
                                  component="button"
                                  type="button"
                                  onClick={() => insertVariable(variable)}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "10px",
                                    width: "100%",
                                    p: "7px 10px",
                                    border: "none",
                                    borderRadius: "8px",
                                    bgcolor: "transparent",
                                    cursor: "pointer",
                                    "&:hover": { bgcolor: "surface.hoverSubtle" },
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: 12,
                                      fontWeight: 700,
                                      fontFamily: "ui-monospace, monospace",
                                      color: "surface.infoFg",
                                    }}
                                  >
                                    {`{${variable}}`}
                                  </Typography>
                                  <Typography sx={{ fontSize: 11, color: "text.disabled" }} noWrap>
                                    {sample[variable] || "—"}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          ))}
                        </Box>
                      </Paper>
                    </ClickAwayListener>
                  ) : null}
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: "7px", mt: "12px" }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary" }}>
                    {t("bodyLabel")}{" "}
                    <Box component="span" sx={{ color: "text.disabled", fontWeight: 400 }}>
                      {t("bodyHint")}
                    </Box>
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                    {(config.toolbar ?? []).map((button) => (
                      <Tooltip key={button.icon} title={t(button.label)}>
                        <IconButton
                          onClick={() => appendFragment(button.fragment)}
                          sx={{ width: 28, height: 28, borderRadius: "7px" }}
                        >
                          <IconRenderer name={button.icon} size={15} />
                        </IconButton>
                      </Tooltip>
                    ))}
                    <Box sx={{ flex: 1 }} />
                    {(config.aiActions ?? []).map((action) => (
                      <Button
                        key={action.action}
                        variant="outlined"
                        color="primary"
                        size="small"
                        disabled={busy}
                        onClick={() => runAssist(action.action)}
                        startIcon={<IconRenderer name="sparkle" size={13} />}
                        sx={{ borderRadius: "999px", fontSize: 11.5, fontWeight: 600 }}
                      >
                        {t(action.label)}
                      </Button>
                    ))}
                  </Box>

                  <OutlinedInput
                    fullWidth
                    multiline
                    minRows={6}
                    value={draft.bodyText}
                    inputRef={bodyRef}
                    onChange={(event) => setDraft({ ...draft, bodyText: event.target.value })}
                    placeholder={t("bodyPlaceholder")}
                  />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                    mt: "16px",
                  }}
                >
                  {selected.category === "custom" ? (
                    <Button variant="outlined" onClick={remove}>
                      {t("delete")}
                    </Button>
                  ) : null}
                  <Button
                    variant="contained"
                    disabled={busy}
                    onClick={async () => {
                      await save();
                      show(t("toast.saved"), draft.name);
                    }}
                  >
                    {t("save")}
                  </Button>
                </Box>
              </Card>

              <Card>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    flexWrap: "wrap",
                    mb: "14px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "text.secondary",
                    }}
                  >
                    <IconRenderer name="visibility" size={15} sx={{ color: "text.disabled" }} />
                    {t("preview.label")}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        bgcolor: "surface.inset",
                        border: "1px solid var(--mui-palette-surface-controlBorder)",
                        borderRadius: "999px",
                        p: "3px",
                        gap: "3px",
                      }}
                    >
                      {(["desktop", "mobile"] as const).map((option) => {
                        const on = device === option;
                        return (
                          <Box
                            key={option}
                            component="button"
                            type="button"
                            onClick={() => setDevice(option)}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              p: "4px 11px",
                              border: "none",
                              borderRadius: "999px",
                              bgcolor: on ? "surface.pillActive" : "transparent",
                              color: on ? "text.primary" : "text.secondary",
                              fontSize: 11.5,
                              fontWeight: 600,
                              fontFamily: "inherit",
                              cursor: "pointer",
                            }}
                          >
                            <IconRenderer name={option} size={13} />
                            {t(`preview.${option}`)}
                          </Box>
                        );
                      })}
                    </Box>

                    {selected.isDefault ? (
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => resetConfirm.open()}
                        sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary" }}
                      >
                        {t("resetDefault")}
                      </Button>
                    ) : null}

                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setTestOpen((open) => !open)}
                      startIcon={<IconRenderer name="send" size={14} />}
                      sx={{ fontSize: 12, fontWeight: 700 }}
                    >
                      {t("sendTest")}
                    </Button>

                    {testOpen ? (
                      <ClickAwayListener onClickAway={() => setTestOpen(false)}>
                        <Paper
                          variant="dropdown"
                          sx={{
                            position: "absolute",
                            top: "calc(100% + 8px)",
                            right: 0,
                            zIndex: 35,
                            width: 280,
                            p: "14px",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "text.secondary",
                              mb: "8px",
                            }}
                          >
                            {t("recipient")}
                          </Typography>
                          <OutlinedInput
                            fullWidth
                            autoFocus
                            type="email"
                            value={testEmail}
                            onChange={(event) => setTestEmail(event.target.value)}
                            placeholder={t("recipientPlaceholder")}
                          />
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: "8px",
                              mt: "11px",
                            }}
                          >
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => setTestOpen(false)}
                            >
                              {t("cancel")}
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              disabled={busy}
                              onClick={sendTest}
                            >
                              {t("send")}
                            </Button>
                          </Box>
                        </Paper>
                      </ClickAwayListener>
                    ) : null}
                  </Box>
                </Box>

                <Box
                  sx={{
                    bgcolor: "surface.inset",
                    border: "1px solid var(--mui-palette-surface-border)",
                    borderRadius: "12px",
                    p: "12px 14px",
                    mb: "14px",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10.5,
                      letterSpacing: ".08em",
                      fontWeight: 600,
                      color: "text.disabled",
                      mb: "9px",
                    }}
                  >
                    {t("preview.dataLabel")}
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
                      gap: "10px",
                    }}
                  >
                    {selected.variables.map((variable) => (
                      <Box
                        key={variable}
                        sx={{ display: "flex", flexDirection: "column", gap: "4px" }}
                      >
                        <Typography
                          sx={{
                            fontSize: 10.5,
                            color: "text.disabled",
                            fontFamily: "ui-monospace, monospace",
                          }}
                        >
                          {`{${variable}}`}
                        </Typography>
                        <OutlinedInput
                          value={sample[variable] ?? ""}
                          onChange={(event) =>
                            setSample({ ...sample, [variable]: event.target.value })
                          }
                          sx={{ "& input": { fontSize: 12, p: "7px 10px" } }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>

                <EmailPreview
                  template={selected}
                  draft={draft}
                  sample={sample}
                  device={device}
                  fromName={config.fromName}
                  fromEmail={config.fromEmail}
                  postalAddress={config.postalAddress}
                  labels={{
                    to: t("preview.to"),
                    justNow: t("preview.justNow"),
                    codeLabel: t("preview.codeLabel"),
                    fallback: t("preview.fallback"),
                    footerWhy: t(
                      selected.category === "auth"
                        ? "preview.footerWhyAuth"
                        : "preview.footerWhyBiz",
                    ),
                  }}
                />

                <Typography
                  sx={{ fontSize: 11, color: "text.disabled", mt: "10px", textAlign: "center" }}
                >
                  {t("preview.caption")}
                </Typography>
              </Card>
            </>
          ) : (
            <Card>
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{t("empty")}</Typography>
            </Card>
          )}
        </Box>
      </Box>

      <Modal
        open={resetConfirm.isOpen}
        onClose={resetConfirm.close}
        title={t("resetTitle")}
        description={t("resetDescription")}
        footer={
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "8px", mt: "18px" }}>
            <Button variant="outlined" onClick={resetConfirm.close}>
              {t("cancel")}
            </Button>
            <Button variant="contained" onClick={resetToDefault}>
              {t("confirmReset")}
            </Button>
          </Box>
        }
      />
    </Box>
  );
}
