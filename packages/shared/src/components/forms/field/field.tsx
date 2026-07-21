"use client";

import type { Control, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import { CheckboxGroupWidget } from "../checkbox-group/checkbox-group";
import { ChipsWidget } from "../chips/chips";
import { ColorWidget } from "../color/color";
import { DateWidget } from "../date/date";
import { DaysWidget } from "../days/days";
import { MarkdownWidget } from "../markdown/markdown";
import { MultiSelectWidget } from "../multiselect/multiselect";
import { NumberWidget } from "../number/number";
import { PasswordWidget } from "../password/password";
import { PhoneWidget } from "../phone/phone";
import { RadioWidget } from "../radio/radio";
import { SegmentedWidget } from "../segmented/segmented";
import { SelectWidget } from "../select/select";
import { SwitchRowWidget } from "../switch-row/switch-row";
import { TextWidget } from "../text/text";
import { ToggleWidget } from "../toggle/toggle";
import type {
  BuiltInWidget,
  JsonSchemaProperty,
  Translate,
  Widget,
  WidgetProps,
  Widgets,
} from "../types";
import { UploadWidget } from "../upload/upload";

/**
 * Widget name → component. Adding a field type means writing a component that
 * takes WidgetProps and adding one line here; nothing else in the form layer
 * needs to know about it.
 */
export const WIDGETS: Record<BuiltInWidget, (props: WidgetProps) => React.ReactNode> = {
  text: TextWidget,
  textarea: TextWidget,
  password: PasswordWidget,
  select: SelectWidget,
  segmented: SegmentedWidget,
  switch: ToggleWidget,
  "switch-row": SwitchRowWidget,
  checkbox: ToggleWidget,
  chips: ChipsWidget,
  markdown: MarkdownWidget,
  phone: PhoneWidget,
  upload: UploadWidget,
  days: DaysWidget,
  radio: RadioWidget,
  "checkbox-group": CheckboxGroupWidget,
  multiselect: MultiSelectWidget,
  number: NumberWidget,
  date: DateWidget,
  time: DateWidget,
  datetime: DateWidget,
  color: ColorWidget,
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
  control,
  t,
  widgets,
}: {
  name: string;
  prop: JsonSchemaProperty;
  control: Control<FieldValues>;
  t: Translate;
  widgets?: Widgets;
}) {
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
        const props: WidgetProps = { name, prop: resolved, field, fieldState, t };
        // Called, not mounted — an inline arrow in a `widgets` literal is a new
        // function identity every render, which as a component type would
        // remount the field (and drop focus) on each keystroke. The fragment
        // narrows a widget's ReactNode to the ReactElement Controller wants.
        return <>{custom ? custom(props) : <Builtin {...props} />}</>;
      }}
    />
  );
}
