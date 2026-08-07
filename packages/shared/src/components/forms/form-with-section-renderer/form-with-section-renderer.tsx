"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import { keyframes } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useTranslation } from "@recruit/sdk";
import { denseFormVars } from "@recruit/ui";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { type FieldValues, FormProvider, useForm } from "react-hook-form";
import { IconRenderer } from "../../renderers";
import { SlidingPillTabs } from "../../tabs/sliding-pill-tabs";
import { Field } from "../field/field";
import { useFieldEffects } from "../field/use-field-effects";
import { FormContainer } from "../form-container";
import { buildResolver, defaultFor } from "../form-renderer/form-renderer";
import type {
  FormSection,
  FormSectionField,
  FormValues,
  FormWithSectionsProps,
  JsonSchema,
  JsonSchemaProperty,
} from "../types";

const fieldName = (f: FormSectionField) => (typeof f === "string" ? f : f.name);
const fieldSpan = (f: FormSectionField) => (typeof f === "string" ? 1 : (f.span ?? 1));

/** Even-column shorthand → a MUI grid container; mirrors the real render so the
 * skeleton lands on the same tracks. */
function sectionGrid(section: FormSection) {
  const useShorthand = !section.gridContainer && !section.stackContainer;
  return {
    useShorthand,
    gridContainer: useShorthand
      ? { spacing: 2, columns: section.columns ?? 2 }
      : section.gridContainer,
  };
}

/** The cells a section actually draws — the same subset `renderEntry` keeps, so
 * the skeleton has one placeholder per real field and lands on the same tracks. */
function visibleFields(section: FormSection, schema: JsonSchema): FormSectionField[] {
  const led = new Set(
    Object.values(schema.properties).flatMap((prop) => [
      ...(prop.leading ? [prop.leading] : []),
      ...(prop.trailing ?? []),
    ]),
  );
  return (section.fields ?? [])
    .filter((field) => !(section.moreFields ?? []).includes(fieldName(field)))
    .filter((field) => fieldName(field) !== section.headerField)
    .filter((field) => !led.has(fieldName(field)));
}

function fieldGrids(fields: FormSectionField[], schema: JsonSchema, useShorthand: boolean) {
  return fields.map((field) => {
    if (typeof field === "object" && field.grid) return field.grid;
    const prop = schema.properties[fieldName(field)];
    if (prop?.grid) return prop.grid;
    return useShorthand ? { size: fieldSpan(field) } : undefined;
  });
}

function SkeletonField({ prop }: { prop?: JsonSchemaProperty }) {
  if (prop?.widget === "upload") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Skeleton variant="circular" width={64} height={64} />
        <Skeleton variant="rounded" width={130} height={36} sx={{ borderRadius: "999px" }} />
      </Box>
    );
  }
  // Display-only widgets have no control to stand in for — a heading is one
  // short bar, a callout its own block.
  if (prop?.widget === "heading") return <Skeleton variant="text" width={90} height={14} />;
  if (prop?.widget === "callout")
    return <Skeleton variant="rounded" height={92} sx={{ borderRadius: "16px" }} />;
  if (prop?.widget === "checkbox" || prop?.widget === "switch")
    return <Skeleton variant="text" width={150} height={22} />;
  const rows = prop?.widget === "textarea" ? (prop.rows ?? 4) : 0;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
      <Skeleton variant="text" width={90} height={14} />
      <Skeleton variant="rounded" height={rows ? rows * 22 : 44} sx={{ borderRadius: "12px" }} />
    </Box>
  );
}

/** Mirrors `renderEntry`: a group lays its children out through the same
 * container, a leaf draws the card. Walking the same tree is what keeps the
 * loading state on the real layout — a two-column form stays two columns. */
function SkeletonEntry({
  section,
  schema,
  inRail,
}: {
  section: FormSection;
  schema: JsonSchema;
  inRail: boolean;
}) {
  if (section.sections) {
    return (
      <Box sx={section.sticky ? { position: "sticky", top: "22px" } : undefined}>
        <FormContainer
          stackContainer={section.stackContainer ?? { spacing: 2 }}
          gridContainer={section.gridContainer}
          grids={section.sections.map((child) => child.grid)}
        >
          {section.sections.map((child, index) => (
            <SkeletonEntry
              key={child.title ?? index}
              section={child}
              schema={schema}
              inRail={inRail || Boolean(section.sticky)}
            />
          ))}
        </FormContainer>
      </Box>
    );
  }

  const { useShorthand, gridContainer } = sectionGrid(section);
  const fields = visibleFields(section, schema);
  const body = (
    <FormContainer
      stackContainer={section.stackContainer}
      gridContainer={gridContainer}
      grids={fieldGrids(fields, schema, useShorthand)}
    >
      {fields.map((field, index) => (
        <SkeletonField key={fieldName(field) ?? index} prop={schema.properties[fieldName(field)]} />
      ))}
    </FormContainer>
  );

  if (section.bare) return body;
  return (
    <Card
      variant="base"
      sx={{
        p: section.iconBadge ? "18px" : inRail ? "20px" : "22px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {section.title ? <Skeleton variant="text" width={130} height={20} /> : null}
      {body}
    </Card>
  );
}

function FormSectionsSkeleton({
  schema,
  sections,
  sectionsContainer,
  hasHeader,
  hasSidePanel,
  hasFooterActions,
}: {
  schema: JsonSchema;
  sections: FormSection[];
  sectionsContainer?: FormWithSectionsProps["sectionsContainer"];
  hasHeader: boolean;
  hasSidePanel: boolean;
  /** Actions sit under the form rather than in the header — stand them in there. */
  hasFooterActions: boolean;
}) {
  const footer = hasFooterActions ? (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "8px", pt: "2px" }}>
      <Skeleton variant="rounded" width={92} height={38} sx={{ borderRadius: "999px" }} />
      <Skeleton variant="rounded" width={132} height={38} sx={{ borderRadius: "999px" }} />
    </Box>
  ) : null;
  const tree = (
    <FormContainer
      stackContainer={sectionsContainer?.stackContainer ?? { spacing: 2 }}
      gridContainer={sectionsContainer?.gridContainer}
      grids={sections.map((section) => section.grid)}
    >
      {sections.map((section, index) => (
        <SkeletonEntry
          key={section.title ?? index}
          section={section}
          schema={schema}
          inRail={false}
        />
      ))}
    </FormContainer>
  );

  return (
    <Box>
      {hasHeader ? (
        <Box sx={{ mb: "18px" }}>
          <Skeleton variant="text" width={200} height={28} />
          <Skeleton variant="text" width={320} height={18} />
        </Box>
      ) : null}
      {hasSidePanel ? (
        // Backward-compat display side panel; config-driven forms carry their
        // own columns in `sections` and take the branch below.
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "8fr 4fr" },
            gap: "16px",
            alignItems: "start",
          }}
        >
          <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
            {tree}
            {footer}
          </Box>
          <Card
            variant="base"
            sx={{ p: "20px", display: "flex", flexDirection: "column", gap: "13px" }}
          >
            <Skeleton variant="text" width={130} height={20} />
            <Skeleton variant="rounded" height={44} />
            {[0, 1, 2, 3].map((row) => (
              <Box key={row} sx={{ display: "flex", justifyContent: "space-between" }}>
                <Skeleton variant="text" width={90} height={14} />
                <Skeleton variant="text" width={64} height={14} />
              </Box>
            ))}
          </Card>
        </Box>
      ) : (
        <>
          {tree}
          {footer}
        </>
      )}
    </Box>
  );
}

/** Widgets that render text only — never part of the submitted payload. */
const DISPLAY_ONLY = new Set<string | undefined>(["heading", "callout"]);

const savePop = keyframes`0%{transform:scale(.6);opacity:.5}60%{transform:scale(1.15)}100%{transform:scale(1)}`;

export function FormWithSectionsRenderer({
  id,
  schema,
  sections,
  defaultValues,
  onSubmit,
  title,
  description,
  submitLabel = "submit",
  submitIcon,
  savedLabel,
  onCancel,
  cancelLabel = "cancel",
  loading = false,
  sidePanel,
  sectionsContainer,
  draftLabel = "saveDraft",
  onSaveDraft,
  actions,
  addAnotherLabel,
  actionsPlacement = "header",
  widgets,
  isLoading = false,
}: FormWithSectionsProps) {
  const { t } = useTranslation(id);
  // Transient "Saved" confirmation on the submit button (spinner → check + pop).
  const [justSaved, setJustSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Set true by "Save & add another" just before submit, read in submitHandler.
  const addAnotherRef = useRef(false);
  const resolver = useMemo(() => buildResolver(schema), [schema]);
  const initial = useMemo(() => {
    const values: FieldValues = { ...defaultValues };
    for (const [key, prop] of Object.entries(schema.properties)) {
      if (values[key] === undefined) values[key] = defaultFor(prop);
    }
    return values;
  }, [schema, defaultValues]);

  // FormProvider (below) puts these on context, so a custom widget can watch a
  // sibling field — e.g. a preview that recolours from another control.
  const methods = useForm<FieldValues>({
    resolver,
    defaultValues: initial,
    mode: "onTouched",
  });
  const { control, handleSubmit, getValues, reset, formState } = methods;
  const { hiddenSet, disabledSet } = useFieldEffects(schema, control, methods.setValue);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  // Per-section active tab, for sections that render their fields as tabs.
  const [activeTab, setActiveTab] = useState<Record<string, string>>({});

  // `useForm` reads `defaultValues` once, at mount. An edit screen mounts this
  // before its record has loaded (it needs the schema to draw the skeleton), so
  // the values that arrive afterwards would never reach the fields. Seed them
  // when they actually change — compared by content, since the caller builds a
  // fresh object every render.
  const initialRef = useRef(initial);
  initialRef.current = initial;
  const defaultsKey = JSON.stringify(defaultValues ?? {});
  const seeded = useRef(defaultsKey);
  useEffect(() => {
    if (seeded.current === defaultsKey) return;
    seeded.current = defaultsKey;
    reset(initialRef.current);
  }, [defaultsKey, reset]);

  // A leaf section renders as one card of fields; a `sections` group lays its
  // children out through the same config-driven FormContainer (grid or stack),
  // taking its own `grid` slot in the parent. So a two-column form is just a
  // container grid + two groups sized `md: 8` / `md: 4` — no bespoke aside or
  // fixed column styles — and it collapses to one column on small screens.
  const renderEntry = (section: FormSection, key: string | number, inRail = false): ReactNode => {
    if (section.sections) {
      // `sticky` pins this column to the top while the rest of the form scrolls
      // (the design's side panel).
      return (
        <Box key={key} sx={section.sticky ? { position: "sticky", top: "22px" } : undefined}>
          <FormContainer
            stackContainer={section.stackContainer ?? { spacing: 2 }}
            gridContainer={section.gridContainer}
            grids={section.sections.map((child) => child.grid)}
          >
            {section.sections.map((child, index) =>
              renderEntry(child, child.title ?? index, inRail || Boolean(section.sticky)),
            )}
          </FormContainer>
        </Box>
      );
    }
    // A section lays its fields out the same way a page lays out elements.
    // `columns` is shorthand: an even grid where a field's `span` counts in
    // those columns rather than MUI's 12.
    const evenColumns = section.columns ?? 2;
    const useShorthand = !section.gridContainer && !section.stackContainer;
    const gridContainer = useShorthand
      ? { spacing: 2, columns: evenColumns }
      : section.gridContainer;
    // Condition-hidden fields drop out so their grid cell collapses (no gap).
    // Secondary fields stay folded away until the section is expanded.
    const moreOpen = expanded.has(String(key));
    const tabKey = String(key);
    const isMore = (name: string) => (section.moreFields ?? []).includes(name);
    // A field named as another's `leading`/`trailing` is drawn inside that
    // field, not as a cell of its own.
    const led = new Set(
      Object.values(schema.properties).flatMap((prop) => [
        ...(prop.leading ? [prop.leading] : []),
        ...(prop.trailing ?? []),
      ]),
    );
    const fields = (section.fields ?? [])
      .filter((field) => !hiddenSet.has(fieldName(field)))
      .filter((field) => moreOpen || !isMore(fieldName(field)))
      .filter((field) => fieldName(field) !== section.headerField)
      .filter((field) => !led.has(fieldName(field)))
      // A tabbed section shows the picked field only; its tabs carry the labels.
      .filter(
        (field) =>
          !section.tabbed ||
          fieldName(field) === (activeTab[tabKey] ?? fieldName((section.fields ?? [])[0])),
      );
    const body = fields.length ? (
      <FormContainer
        stackContainer={section.stackContainer}
        gridContainer={gridContainer}
        grids={fields.map((field) => {
          if (typeof field === "object" && field.grid) return field.grid;
          const prop = schema.properties[fieldName(field)];
          if (prop?.grid) return prop.grid;
          return useShorthand ? { size: fieldSpan(field) } : undefined;
        })}
      >
        {fields.map((field) => {
          const name = fieldName(field);
          const prop = schema.properties[name];
          // A name with no schema property is a layout spacer — an empty cell.
          if (!prop) return <Box key={name} />;
          const required = schema.required?.includes(name);
          return (
            // Stamped so anything outside the form (the completeness card) can
            // find a field and scroll the user to it.
            <Box key={name} data-field={name}>
              <Field
                name={name}
                prop={required ? { ...prop, required } : prop}
                leadingProp={prop.leading ? schema.properties[prop.leading] : undefined}
                trailingProps={
                  prop.trailing
                    ? Object.fromEntries(
                        prop.trailing.map((sibling) => [sibling, schema.properties[sibling]]),
                      )
                    : undefined
                }
                control={control}
                t={t}
                widgets={widgets}
                disabled={disabledSet.has(name)}
              />
            </Box>
          );
        })}
      </FormContainer>
    ) : null;

    const headerProp = section.headerField ? schema.properties[section.headerField] : undefined;
    const headerFieldNode =
      section.headerField && headerProp ? (
        <Box sx={{ flex: "none" }}>
          <Field
            name={section.headerField}
            prop={headerProp}
            control={control}
            t={t}
            widgets={widgets}
            disabled={disabledSet.has(section.headerField)}
          />
        </Box>
      ) : null;

    const moreToggle = section.moreFields?.length ? (
      <Box
        onClick={() =>
          setExpanded((current) => {
            const next = new Set(current);
            const id = String(key);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          })
        }
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          mt: "2px",
          fontSize: 12,
          fontWeight: 600,
          color: "surface.textSecondary",
          cursor: "pointer",
          alignSelf: "flex-start",
          "&:hover": { color: "text.primary" },
        }}
      >
        <IconRenderer name={moreOpen ? "expand-less" : "expand-more"} size={15} />
        {t(moreOpen ? (section.moreLabel?.hide ?? "") : (section.moreLabel?.show ?? ""))}
      </Box>
    ) : null;

    // A `bare` section is just a layout slot — the field (e.g. a callout) draws
    // its own container.
    if (section.bare) return <Box key={key}>{body}</Box>;

    return (
      <Card
        key={key}
        variant="base"
        sx={{
          p: section.iconBadge ? "18px" : inRail ? "20px" : "22px 24px",
          // The rail runs the design`s smaller control size.
          ...(inRail ? denseFormVars : {}),
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          // `iconBadge` (AI card) → diagonal orange-gradient fill; `filled` →
          // neutral fill; default keeps the plain card. `accent` = orange border.
          ...(section.iconBadge
            ? {
                background:
                  "linear-gradient(120deg,var(--mui-palette-surface-heroTint),transparent 55%),var(--mui-palette-surface-paper)",
              }
            : section.variant === "filled"
              ? { bgcolor: "surface.inset" }
              : {}),
          ...(section.accent
            ? { border: "1px solid", borderColor: "surface.primarySoftBorder" }
            : section.variant === "filled"
              ? { border: "none" }
              : {}),
        }}
      >
        {section.tabbed ? (
          <SlidingPillTabs
            items={(section.fields ?? []).map((field) => ({
              value: fieldName(field),
              render: () => t(schema.properties[fieldName(field)]?.title ?? fieldName(field)),
            }))}
            value={activeTab[tabKey] ?? fieldName((section.fields ?? [])[0])}
            onChange={(value) => setActiveTab((current) => ({ ...current, [tabKey]: value }))}
            sx={{ alignSelf: "flex-start" }}
          />
        ) : null}
        {section.title && !section.tabbed ? (
          section.iconBadge && section.icon ? (
            // Filled orange square badge + title/subtitle beside it (AI cards).
            <Box sx={{ display: "flex", gap: "11px", alignItems: "flex-start" }}>
              <Box
                sx={{
                  flex: "none",
                  width: 34,
                  height: 34,
                  borderRadius: "10px",
                  background: "var(--mui-palette-primary-main)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconRenderer name={section.icon} size={18} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>{t(section.title)}</Typography>
                {section.description ? (
                  <Typography
                    sx={{ fontSize: 11.5, color: "#D9B79A", mt: "2px", lineHeight: 1.45 }}
                  >
                    {t(section.description)}
                  </Typography>
                ) : null}
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  {section.icon ? (
                    <Box sx={{ color: "surface.accentBright", flex: "none", display: "flex" }}>
                      <IconRenderer name={section.icon} size={17} />
                    </Box>
                  ) : null}
                  <Typography
                    sx={
                      inRail
                        ? { fontSize: 14.5, fontWeight: 600 }
                        : { fontSize: 15, fontWeight: 700 }
                    }
                  >
                    {t(section.title)}
                  </Typography>
                </Box>
                {section.description ? (
                  <Typography sx={{ fontSize: 12, color: "text.disabled", mt: "4px" }}>
                    {t(section.description)}
                  </Typography>
                ) : null}
              </Box>
              {headerFieldNode}
            </Box>
          )
        ) : null}
        {body}
        {moreToggle}
      </Card>
    );
  };

  // Once a save succeeds the on-screen values become the new baseline, so the
  // form stops reporting itself dirty (what keeps a save bar on screen).
  // Reset from getValues(), not the submitted payload — the resolver strips
  // empty optional fields, and resetting to that would re-dirty every one.
  const submitHandler = async (values: FieldValues) => {
    const addAnother = addAnotherRef.current;
    addAnotherRef.current = false;
    // `heading` and `callout` are display-only — they seed a value like any
    // other property but hold nothing worth sending.
    const payload = Object.fromEntries(
      Object.entries(values).filter(([name]) => !DISPLAY_ONLY.has(schema.properties[name]?.widget)),
    );
    await onSubmit(payload as FormValues, { addAnother });
    // Add-another clears the form and stays; the caller skips navigation.
    if (addAnother) {
      reset(initial);
      return;
    }
    reset(getValues());
    if (savedLabel) {
      setJustSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setJustSaved(false), 2200);
    }
  };

  // A caller-supplied cluster gets everything it needs to drive the form.
  const actionsNode = actions?.({
    isDirty: formState.isDirty,
    isSubmitting: formState.isSubmitting,
    submit: () => void handleSubmit(submitHandler)(),
    reset: () => reset(initial),
    values: getValues(),
  });

  const submitting = loading || formState.isSubmitting;
  const defaultActions = (
    <Box sx={{ display: "flex", gap: "8px", flex: "none" }}>
      <Button
        variant="outlined"
        onClick={() => {
          reset(initial);
          onCancel?.();
        }}
        disabled={submitting}
        sx={{ fontWeight: 400 }}
      >
        {t(cancelLabel)}
      </Button>
      {onSaveDraft ? (
        <Button
          variant="outlined"
          onClick={() => onSaveDraft(getValues())}
          sx={{ fontWeight: 400 }}
        >
          {t(draftLabel)}
        </Button>
      ) : null}
      {addAnotherLabel ? (
        <Button
          variant="outlined"
          disabled={submitting}
          onClick={() => {
            addAnotherRef.current = true;
            void handleSubmit(submitHandler)();
          }}
          sx={{ fontWeight: 400 }}
        >
          {t(addAnotherLabel)}
        </Button>
      ) : null}
      <Button
        type="submit"
        variant="contained"
        loading={submitting}
        startIcon={
          submitting ? undefined : justSaved ? (
            <Box
              component="span"
              sx={{
                display: "inline-flex",
                animation: `${savePop} 250ms cubic-bezier(0,0,.2,1)`,
              }}
            >
              <IconRenderer name="check" size={16} />
            </Box>
          ) : submitIcon ? (
            <IconRenderer name={submitIcon} size={16} />
          ) : null
        }
      >
        {t(justSaved && savedLabel ? savedLabel : submitLabel)}
      </Button>
    </Box>
  );

  // A caller that supplies `actions` owns the cluster completely — returning
  // null means "show nothing" (the design reveals buttons only once dirty), not
  // "fall back to the built-in one".
  const cluster = actions ? actionsNode : defaultActions;
  // The built-in footer cluster right-aligns under the form column (below); a
  // custom cluster owns its own layout (e.g. a full-width sticky bar) and is
  // placed full-width after the grid.
  const footerBuiltIn = actionsPlacement === "footer" && !actions;
  // A bottom bar that appears only once the form is dirty (settings screens).
  const stickyBar =
    actionsPlacement === "sticky" && !actions && formState.isDirty ? (
      <Box
        sx={{
          position: "sticky",
          bottom: "16px",
          mt: "16px",
          zIndex: 5,
          display: "flex",
          justifyContent: "flex-end",
          p: "10px 14px",
          borderRadius: "14px",
          bgcolor: "surface.elevated",
          border: "1px solid",
          borderColor: "surface.border",
          boxShadow: "0 12px 34px rgba(0,0,0,.4)",
        }}
      >
        {defaultActions}
      </Box>
    ) : null;

  if (isLoading) {
    return (
      <FormSectionsSkeleton
        schema={schema}
        sections={sections}
        sectionsContainer={sectionsContainer}
        hasHeader={Boolean(title || description)}
        hasSidePanel={Boolean(sidePanel)}
        hasFooterActions={actionsPlacement === "footer"}
      />
    );
  }

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={handleSubmit(submitHandler)} noValidate>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            mb: "18px",
          }}
        >
          <Box>
            {title ? (
              <Typography sx={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.01em" }}>
                {t(title)}
              </Typography>
            ) : null}
            {description ? (
              <Typography sx={{ fontSize: 13, color: "text.secondary", mt: "4px" }}>
                {t(description)}
              </Typography>
            ) : null}
          </Box>
          {actionsPlacement === "header" ? cluster : null}
        </Box>

        {sidePanel ? (
          // Backward-compat display side panel (e.g. profile's workspace card):
          // sections stack in the main column, the node sits in a 340px column.
          // Config-driven forms use `sections` groups instead (below).
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "8fr 4fr" },
              gap: "16px",
              alignItems: "start",
            }}
          >
            <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
              <FormContainer
                stackContainer={sectionsContainer?.stackContainer ?? { spacing: 2 }}
                gridContainer={sectionsContainer?.gridContainer}
                grids={sections.map((section) => section.grid)}
              >
                {sections.map((section, sectionIndex) =>
                  renderEntry(section, section.title ?? sectionIndex),
                )}
              </FormContainer>
              {footerBuiltIn ? (
                <Box sx={{ display: "flex", justifyContent: "flex-end", pt: "2px" }}>
                  {defaultActions}
                </Box>
              ) : null}
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>{sidePanel}</Box>
          </Box>
        ) : (
          <>
            <FormContainer
              stackContainer={sectionsContainer?.stackContainer ?? { spacing: 2 }}
              gridContainer={sectionsContainer?.gridContainer}
              grids={sections.map((section) => section.grid)}
            >
              {sections.map((section, sectionIndex) =>
                renderEntry(section, section.title ?? sectionIndex),
              )}
            </FormContainer>
            {footerBuiltIn ? (
              <Box sx={{ display: "flex", justifyContent: "flex-end", pt: "2px" }}>
                {defaultActions}
              </Box>
            ) : null}
          </>
        )}

        {actionsPlacement === "footer" && actions ? cluster : null}
        {stickyBar}
      </Box>
    </FormProvider>
  );
}
