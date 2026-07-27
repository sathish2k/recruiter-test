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
import { useMemo, useRef, useState } from "react";
import { type FieldValues, FormProvider, useForm } from "react-hook-form";
import { IconRenderer } from "../../renderers";
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

function fieldGrids(section: FormSection, schema: JsonSchema, useShorthand: boolean) {
  return (section.fields ?? []).map((field) => {
    const prop = schema.properties[fieldName(field)];
    if (prop?.grid) return prop.grid;
    return useShorthand ? { size: fieldSpan(field) } : undefined;
  });
}

/** Groups are layout-only; the skeleton just needs the leaf field cards. */
function leafSections(sections: FormSection[]): FormSection[] {
  return sections.flatMap((section) =>
    section.sections ? leafSections(section.sections) : [section],
  );
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
  const rows = prop?.widget === "textarea" ? (prop.rows ?? 4) : 0;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
      <Skeleton variant="text" width={90} height={14} />
      <Skeleton variant="rounded" height={rows ? rows * 22 : 44} sx={{ borderRadius: "12px" }} />
    </Box>
  );
}

function FormSectionsSkeleton({
  schema,
  sections,
  hasHeader,
  hasSidePanel,
}: {
  schema: JsonSchema;
  sections: FormSection[];
  hasHeader: boolean;
  hasSidePanel: boolean;
}) {
  return (
    <Box>
      {hasHeader ? (
        <Box sx={{ mb: "18px" }}>
          <Skeleton variant="text" width={200} height={28} />
          <Skeleton variant="text" width={320} height={18} />
        </Box>
      ) : null}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: hasSidePanel ? "8fr 4fr" : "1fr" },
          gap: "16px",
          alignItems: "start",
        }}
      >
        <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
          <FormContainer stackContainer={{ spacing: 2 }} grids={[]}>
            {leafSections(sections).map((section, index) => {
              const { useShorthand, gridContainer } = sectionGrid(section);
              return (
                <Card
                  key={section.title ?? index}
                  variant="base"
                  sx={{ p: "20px 22px", display: "flex", flexDirection: "column", gap: "16px" }}
                >
                  {section.title ? <Skeleton variant="text" width={130} height={20} /> : null}
                  <FormContainer
                    stackContainer={section.stackContainer}
                    gridContainer={gridContainer}
                    grids={fieldGrids(section, schema, useShorthand)}
                  >
                    {(section.fields ?? []).map((field, fieldIndex) => (
                      <SkeletonField
                        key={fieldName(field) ?? fieldIndex}
                        prop={schema.properties[fieldName(field)]}
                      />
                    ))}
                  </FormContainer>
                </Card>
              );
            })}
          </FormContainer>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <Skeleton variant="rounded" width={92} height={38} sx={{ borderRadius: "999px" }} />
            <Skeleton variant="rounded" width={132} height={38} sx={{ borderRadius: "999px" }} />
          </Box>
        </Box>
        {hasSidePanel ? (
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
        ) : null}
      </Box>
    </Box>
  );
}

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
    const fields = (section.fields ?? []).filter((field) => !hiddenSet.has(fieldName(field)));
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
            <Field
              key={name}
              name={name}
              prop={required ? { ...prop, required } : prop}
              control={control}
              t={t}
              widgets={widgets}
              disabled={disabledSet.has(name)}
            />
          );
        })}
      </FormContainer>
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
                  "linear-gradient(120deg,rgba(242,106,27,.18),rgba(28,28,27,0) 55%),#1C1C1B",
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
        {section.title ? (
          section.iconBadge && section.icon ? (
            // Filled orange square badge + title/subtitle beside it (AI cards).
            <Box sx={{ display: "flex", gap: "11px", alignItems: "flex-start" }}>
              <Box
                sx={{
                  flex: "none",
                  width: 34,
                  height: 34,
                  borderRadius: "10px",
                  background: "linear-gradient(135deg,#FF8A3C,#E4560F)",
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
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: "9px" }}>
                {section.icon ? (
                  <Box sx={{ color: "surface.accentBright", flex: "none", display: "flex" }}>
                    <IconRenderer name={section.icon} size={17} />
                  </Box>
                ) : null}
                <Typography
                  sx={
                    inRail ? { fontSize: 14.5, fontWeight: 600 } : { fontSize: 15, fontWeight: 700 }
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
          )
        ) : null}
        {body}
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
    await onSubmit(values as FormValues, { addAnother });
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
                animation: `${savePop} .45s cubic-bezier(.3,1.4,.4,1)`,
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
        hasHeader={Boolean(title || description)}
        hasSidePanel={Boolean(sidePanel)}
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
