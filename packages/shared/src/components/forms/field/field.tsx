"use client";

import type { Control, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import { ChipsWidget } from "../chips/chips";
import { DaysWidget } from "../days/days";
import { MarkdownWidget } from "../markdown/markdown";
import { PasswordWidget } from "../password/password";
import { PhoneWidget } from "../phone/phone";
import { SegmentedWidget } from "../segmented/segmented";
import { SelectWidget } from "../select/select";
import { TextWidget } from "../text/text";
import { ToggleWidget } from "../toggle/toggle";
import type { JsonSchemaProperty, Translate, Widget, WidgetProps } from "../types";
import { UploadWidget } from "../upload/upload";

/**
 * Widget name → component. Adding a field type means writing a component that
 * takes WidgetProps and adding one line here; nothing else in the form layer
 * needs to know about it.
 */
export const WIDGETS: Record<Widget, (props: WidgetProps) => React.ReactNode> = {
  text: TextWidget,
  textarea: TextWidget,
  password: PasswordWidget,
  select: SelectWidget,
  segmented: SegmentedWidget,
  switch: ToggleWidget,
  checkbox: ToggleWidget,
  chips: ChipsWidget,
  markdown: MarkdownWidget,
  phone: PhoneWidget,
  upload: UploadWidget,
  days: DaysWidget,
};

/** Picks the widget from an explicit `widget`, then from the schema's shape. */
export function widgetFor(prop: JsonSchemaProperty): Widget {
  if (prop.widget) return prop.widget;
  if (prop.type === "array") return "chips";
  if (prop.enum) return "select";
  if (prop.type === "boolean") return "switch";
  if (prop.format === "password") return "password";
  return "text";
}

export function Field({
  name,
  prop,
  control,
  t,
}: {
  name: string;
  prop: JsonSchemaProperty;
  control: Control<FieldValues>;
  t: Translate;
}) {
  const Widget = WIDGETS[widgetFor(prop)] ?? TextWidget;
  // The title defaults to the field name so a schema without one still labels.
  const resolved: JsonSchemaProperty = { ...prop, title: prop.title ?? name };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Widget name={name} prop={resolved} field={field} fieldState={fieldState} t={t} />
      )}
    />
  );
}
