"use client";

import Box from "@mui/material/Box";
import { denseFormVars } from "@recruit/ui";
import type { Control, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import { PasswordWidget } from "../password/password";
import { TextWidget } from "../text/text";
import type {
  BuiltInWidget,
  JsonSchemaProperty,
  Translate,
  Widget,
  WidgetProps,
  Widgets,
} from "../types";
import { VerificationCodeWidget } from "../verification-code/verification-code";
import { FieldLabel, FieldOptionalContext, FieldRequiredContext } from "./field-shell";

/**
 * Widget name → component. Adding a field type means writing a component that
 * takes WidgetProps and adding one line here; nothing else in the form layer
 * needs to know about it.
 */
export const WIDGETS: Partial<Record<BuiltInWidget, (props: WidgetProps) => React.ReactNode>> = {
  text: TextWidget,
  textarea: TextWidget,
  password: PasswordWidget,
  "verification-code": VerificationCodeWidget,
};

/** Picks the widget from an explicit `widget`, then from the schema's shape. */
export function widgetFor(prop: JsonSchemaProperty): Widget {
  if (prop.widget) return prop.widget;
  // An array constrained to `enum` is a fixed choice list; without one it's
  // free-text tags.
  if (prop.type === "array") return prop.enum ? "checkbox-group" : "chips";
  if (prop.type === "number" || prop.type === "integer") return "number";
  if (prop.format === "date") return "date";
  if (prop.enum) return "select";
  if (prop.type === "boolean") return "switch";
  if (prop.format === "password") return "password";
  return "text";
}

export function Field({
  name,
  prop,
  leadingProp,
  trailingProps,
  control,
  t,
  widgets,
  disabled,
}: {
  name: string;
  prop: JsonSchemaProperty;
  /** Resolved by the renderer from `prop.leading` — the small control drawn
   * before this field, under this field's label. */
  leadingProp?: JsonSchemaProperty;
  /** Resolved by the renderer from `prop.trailing`, keyed by field name. */
  trailingProps?: Record<string, JsonSchemaProperty>;
  control: Control<FieldValues>;
  t: Translate;
  widgets?: Widgets;
  /** Set by the renderer from `disabledWhen` / a checkbox's `syncFields`. */
  disabled?: boolean;
}) {
  // Several controls, one label: the outer shell owns the label and the row
  // renders label-less inside it (salutation + first name, or a salary range).
  const grouped = (prop.leading && leadingProp) || prop.trailing?.length;
  const inLabel = leadingProp?.selectVariant === "label";
  if (grouped) {
    return (
      <FieldRequiredContext.Provider value={Boolean(prop.required)}>
        <FieldOptionalContext.Provider
          value={prop.optional ? t("fields.optional", "optional") : null}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <FieldLabel label={t(prop.title ?? name)} />
              {inLabel && prop.leading && leadingProp ? (
                <Field
                  name={prop.leading}
                  prop={{ ...leadingProp, hideLabel: true }}
                  control={control}
                  t={t}
                  widgets={widgets}
                />
              ) : null}
            </Box>
            <Box sx={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
              {!inLabel && prop.leading && leadingProp ? (
                <Box sx={{ flex: "none", width: leadingProp.width }}>
                  <Field
                    name={prop.leading}
                    prop={{ ...leadingProp, hideLabel: true }}
                    control={control}
                    t={t}
                    widgets={widgets}
                  />
                </Box>
              ) : null}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Field
                  name={name}
                  prop={{ ...prop, leading: undefined, trailing: undefined, hideLabel: true }}
                  control={control}
                  t={t}
                  widgets={widgets}
                  disabled={disabled}
                />
              </Box>
              {(prop.trailing ?? []).map((sibling) =>
                trailingProps?.[sibling] ? (
                  <Box key={sibling} sx={{ flex: 1, minWidth: 0 }}>
                    <Field
                      name={sibling}
                      prop={{ ...trailingProps[sibling], hideLabel: true }}
                      control={control}
                      t={t}
                      widgets={widgets}
                    />
                  </Box>
                ) : null,
              )}
            </Box>
          </Box>
        </FieldOptionalContext.Provider>
      </FieldRequiredContext.Provider>
    );
  }

  // Custom is checked first, so a screen can add a widget the form layer lacks
  // — or override a built-in — without touching WIDGETS.
  const key = widgetFor(prop);
  const custom = widgets?.[key];
  const Builtin = WIDGETS[key as BuiltInWidget] ?? TextWidget;
  // The title defaults to the field name so a schema without one still labels.
  const resolved: JsonSchemaProperty = { ...prop, title: prop.title ?? name };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        // A schema can swap the helper line per selected value — the design
        // explains what "Prospect" means only while Prospect is chosen.
        const conditionalHelp = resolved.helpWhen?.[String(field.value ?? "")];
        const shown = conditionalHelp ? { ...resolved, help: conditionalHelp } : resolved;
        const props: WidgetProps = { name, prop: shown, field, fieldState, t, disabled, control };
        // Called, not mounted — an inline arrow in a `widgets` literal is a new
        // function identity every render, which as a component type would
        // remount the field (and drop focus) on each keystroke. The fragment
        // narrows a widget's ReactNode to the ReactElement Controller wants.
        const body = (
          <FieldRequiredContext.Provider value={Boolean(resolved.required)}>
            <FieldOptionalContext.Provider
              value={resolved.optional ? t("fields.optional", "optional") : null}
            >
              {custom ? custom(props) : <Builtin {...props} />}
            </FieldOptionalContext.Provider>
          </FieldRequiredContext.Provider>
        );
        // A single field can opt into the design`s smaller control size even in
        // the wide column — the vars scope to this field alone.
        return resolved.dense ? <Box sx={denseFormVars}>{body}</Box> : body;
      }}
    />
  );
}
