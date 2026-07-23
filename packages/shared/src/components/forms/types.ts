import type { ControllerFieldState, ControllerRenderProps, FieldValues } from "react-hook-form";

/** Resolves a translation key, optionally falling back to literal English. */
export type Translate = (key: string, fallback?: string) => string;

export type JsonSchemaType = "string" | "number" | "integer" | "boolean" | "array" | "object";

/** Built-in widgets — every one of these ships in the form layer. */
export type BuiltInWidget =
  | "text"
  | "textarea"
  | "markdown"
  | "password"
  | "select"
  | "segmented"
  | "switch"
  | "switch-row"
  | "checkbox"
  | "chips"
  | "phone"
  | "upload"
  | "attachments"
  | "callout"
  | "days"
  | "radio"
  | "checkbox-group"
  | "multiselect"
  | "number"
  | "date"
  | "time"
  | "datetime"
  | "color";

/**
 * A widget name a schema may use: a built-in, or any other string resolved from
 * the form's `widgets` map — the field-level twin of a table's custom cell
 * `type`. `(string & {})` keeps autocomplete on the built-ins while still
 * accepting a custom name.
 */
export type Widget = BuiltInWidget | (string & {});

/**
 * One-off field widgets passed to a form renderer via `widgets`, keyed by a
 * custom `widget` name; each receives the field context and returns the
 * control — the mirror of TableRenderer's `cells`. A custom entry wins over a
 * built-in of the same name, so a screen can also override one locally.
 *
 * Called as a plain function (not mounted as a component), so an inline arrow
 * in the `widgets` literal doesn't remount the field on every render.
 */
export type Widgets = Record<string, (props: WidgetProps) => import("react").ReactNode>;

export interface JsonSchemaProperty {
  type: JsonSchemaType;

  format?: "email" | "password" | "tel" | "url" | "date";
  items?: { type?: JsonSchemaType; enum?: Array<string | number> };
  enum?: Array<string | number>;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  default?: string | number | boolean;

  title?: string;
  enumNames?: string[];
  placeholder?: string;
  /** Set by the renderer from the schema's `required` list — drives the label
   * asterisk. Not authored per-field; declare requirements in `schema.required`. */
  required?: boolean;
  widget?: Widget;
  /** Field name this value must equal (e.g. confirm-password). Validated by
   * the form resolver; failure message comes from `errorMessage.matches`. */
  matchesField?: string;
  icon?: string;
  /** `callout`: `"card"` (default, bordered tip) or `"banner"` (filled accent
   * strip — icon + help text, no title). */
  variant?: "card" | "banner";
  /** `switch-row`: soft chip beside the title, e.g. a plan gate. A t-key. */
  badge?: string;
  /** `switch-row`: ICON_REGISTRY name rendered inside the badge. */
  badgeIcon?: string;
  hideLabel?: boolean;
  help?: string;
  rows?: number;
  /** Renders the field non-editable (e.g. a sign-in email). Honored by `text`;
   * the value is still seeded and read, so strip it in `onSubmit` if the API
   * rejects it. */
  readOnly?: boolean;
  strengthMeter?: boolean | PasswordStrengthConfig;

  /** `phone`: dial codes offered by the country picker. Defaults to DIAL_CODES. */
  dialCodes?: DialCode[];
  /** Fetches this field's options from the API instead of using `enum`.
   * Works for `select` and `phone`. */
  optionSource?: OptionSource;
  /** Renders a `select` as a type-ahead. Implied when `optionSource` is set. */
  searchable?: boolean;
  /** `select`: show a coloured initials avatar beside each option and the chosen
   * value (a person/contact picker). */
  avatar?: boolean;
  /** Placement when the form uses `gridContainer`. */
  grid?: FieldGrid;
  /** `phone`: country pre-selected when the field is empty. Defaults to `IN`. */
  defaultIso?: string;
  /** `radio`/`checkbox-group`: lay the options out in a row rather than stacked. */
  row?: boolean;
  /** `checkbox-group`: how many columns to grid the options into. Ignored when
   * `row` is set. */
  columns?: number;
  /** `number`: input step. `minimum`/`maximum` bound it. */
  step?: number;
  /** `number`: unit shown inside the field (a translation key), e.g. a currency
   * or a percent sign. */
  unit?: string;
  /** `number`: which end `unit` sits on. Default "start". */
  unitPosition?: "start" | "end";
  /** `date`/`time`/`datetime`: bounds passed to the native picker. */
  min?: string;
  max?: string;
  /** `upload`: accepted mime types, e.g. "image/png,image/svg+xml". */
  accept?: string;
  /** `upload`: rejected above this size, in megabytes. */
  maxSizeMb?: number;
  /** `upload`: label on the button (translation key). */
  uploadLabel?: string;
  /** `upload`: second, quieter help line under the first. */
  helpSecondary?: string;
  /** `upload`: shape of the preview tile. */
  preview?: "square" | "circle";
  /** `days`: the toggles, in order. `value` is what gets stored. */
  dayOptions?: { value: string; label: string }[];
  /** `days`: quick-pick shortcuts under the toggles. */
  dayPresets?: { label: string; values: string[] }[];

  errorMessage?: string | Record<string, string>;
}

/** Value stored by an `upload` field. */
export interface UploadValue {
  /** Stored or object URL — what the preview renders. */
  url: string;
  /** Set only when the user picked a file this session. */
  file?: File | null;
}

/** One item in an `attachments` field. Existing files carry `url`; a file
 * picked this session carries `file` (the caller uploads it, then swaps in the
 * returned `url`). */
export interface Attachment {
  name: string;
  size?: number;
  type?: string;
  url?: string;
  file?: File;
}

export interface SelectOption {
  value: string;
  label: string;
  /** The original row, when options came from an endpoint. */
  raw?: Record<string, unknown>;
}

/** Where a select (or the phone picker) gets its options. */
export interface OptionSource {
  /** API path, e.g. `/reference`. */
  url: string;
  /** Dot path into the response body, e.g. `data.timezones`. */
  path?: string;
  /** Field names on each row. Default `value` / `label`. */
  valueKey?: string;
  labelKey?: string;
  /** Set for lists too large to ship: typing re-queries with this param
   * instead of filtering locally. */
  searchParam?: string;
  /** Extra query params sent with every request. */
  params?: Record<string, string>;
  /** Debounce for server-side search. Default 250ms. */
  debounceMs?: number;
}

export interface DialCode {
  /** ISO-3166 alpha-2, shown in the chip. */
  iso: string;
  /** Dial prefix including the plus, e.g. "+91". */
  code: string;
  country: string;
}

export interface JsonSchema {
  type: "object";
  title?: string;
  description?: string;
  properties: Record<string, JsonSchemaProperty>;
  required?: string[];
  errorMessage?: {
    required?: Record<string, string>;
    [keyword: string]: unknown;
  };
}

/** One rung of the strength meter. Each carries its own rule, label and colour,
 * so there are no parallel arrays to keep index-aligned. */
export interface PasswordStrengthLevel {
  /** Regex (as a string); matching it earns this level. */
  rule: string;
  /** Translation key for the label shown at this score. */
  label: string;
  /** English shown when the key has no translation. */
  fallback?: string;
  /** Palette path (`success.main`) or CSS colour for the filled bars. */
  color: string;
}

export interface PasswordStrengthConfig {
  /** Ordered weakest → strongest. The bar count matches the level count. */
  levels: PasswordStrengthLevel[];
}

export type FormValues = Record<string, unknown>;

export interface FormRendererProps extends FormLayoutProps {
  /** Component id — the form resolves all text via useTranslation(id). */
  id: string;
  schema: JsonSchema;
  defaultValues?: FormValues;
  onSubmit: (data: FormValues) => void | Promise<void>;
  /** Translation key for the submit button (default "submit"). */
  submitLabel?: string;
  /** When set, renders a Cancel button beside Submit (footer row) that calls it. */
  onCancel?: () => void;
  /** Translation key for the cancel button (default "cancel"). */
  cancelLabel?: string;
  loading?: boolean;
  beforeSubmit?: import("react").ReactNode;
  /** One-off widgets for `widget` names the form layer doesn't ship (see Widgets). */
  widgets?: Widgets;
}

/** A field slot in a section — a schema property key, optionally spanning
 * multiple grid columns (`span`) or placed with its own responsive `grid`. A
 * `name` that isn't a schema property renders as an empty spacer cell, so a
 * half-width field can sit beside a gap (e.g. secondary email). */
export type FormSectionField = string | { name: string; span?: number; grid?: FieldGrid };

/** A titled group of schema fields rendered as its own card. */
export interface FormSection extends FormLayoutProps {
  /** Section heading translation key. */
  title?: string;
  /** Section sub-text translation key. */
  description?: string;
  /** Skip the section card chrome and render the fields bare — for a single
   * display widget (e.g. a callout) that draws its own container. */
  bare?: boolean;
  /** Draw the card with the accent (orange) border instead of the neutral one —
   * for a highlighted section like a fee agreement. */
  accent?: boolean;
  /** ICON_REGISTRY name shown (accent-coloured) before the section title. */
  icon?: string;
  /**
   * Shorthand for an even `gridContainer`: `columns: 3` lays the fields out in
   * three equal columns, and a field's `span` counts in those columns. Ignored
   * when the section sets `gridContainer` or `stackContainer` explicitly.
   */
  columns?: number;
  /** Where this section sits when the form lays sections out in a grid — a
   * responsive `size` (e.g. `{ xs: 12, md: 8 }`) is how a two-column form is
   * expressed and how it collapses to one column on small screens. */
  grid?: FieldGrid;
  /** A layout **group**: instead of its own card, this entry stacks the child
   * sections vertically and takes its `grid` slot in the parent grid. Two groups
   * sized `md: 8` / `md: 4` give the "form column + side panel" layout, fully
   * from config (no bespoke aside/sidePanel plumbing). Mutually exclusive with
   * `fields`. */
  sections?: FormSection[];
  /** The schema fields in this section (omit for a `sections` group). */
  fields?: FormSectionField[];
}

/** Passed to a custom `actions` renderer so callers can drive the form's
 * buttons themselves — enable on dirty, submit, reset, read current values. */
export interface FormActionsState {
  isDirty: boolean;
  isSubmitting: boolean;
  /** Runs validation, then onSubmit. */
  submit: () => void;
  /** Restores the form to its initial values. */
  reset: () => void;
  values: FormValues;
}

export interface FormLayoutProps {
  /** Vertical stack — the default when neither container is set. */
  stackContainer?: { spacing?: number; direction?: "column" | "row" };
  /** Columns; each field places itself with its own `grid`. */
  gridContainer?: Pick<import("@mui/material/Grid").GridProps, "spacing" | "direction" | "columns">;
}

export interface FormWithSectionsProps extends Omit<FormRendererProps, "beforeSubmit"> {
  sections: FormSection[];
  /** Lays the sections themselves out — stack (default) or a grid, so two
   * sections can sit side by side. Each section places itself via its `grid`. */
  sectionsContainer?: FormLayoutProps;
  /** Page heading translation key rendered above the sections. */
  title?: string;
  /** Page sub-heading translation key. */
  description?: string;
  /** Icon name for the submit button. */
  submitIcon?: string;
  /** Translation key shown on the submit button for ~2s after a successful save
   * (with a check + pop). Defaults to `submitLabel` (no distinct saved state). */
  savedLabel?: string;
  /** Rendered in a 340px column beside the sections (design side panel). */
  sidePanel?: import("react").ReactNode;
  /** Translation key for the save-draft button (rendered when onSaveDraft is set). */
  draftLabel?: string;
  /** Called with the current form values (no validation) when Save draft is clicked. */
  onSaveDraft?: (values: FormValues) => void | Promise<void>;
  /** Replaces the built-in Cancel/Save cluster with your own buttons. */
  actions?: (state: FormActionsState) => import("react").ReactNode;
  /** Where the button cluster sits. Defaults to the header, above the sections. */
  actionsPlacement?: "header" | "footer";
  /** Renders a skeleton mirroring the section/field layout instead of the form —
   * pass while the record is still loading. */
  isLoading?: boolean;
}

/** Every widget takes exactly this. Adding a widget means writing a component
 * with this signature and registering it — nothing in FormRenderer changes. */
export interface WidgetProps {
  name: string;
  prop: JsonSchemaProperty;
  field: ControllerRenderProps<FieldValues, string>;
  fieldState: ControllerFieldState;
  t: Translate;
}

/** Grid placement for a field, mirroring the engine's LayoutElement. */
export interface FieldGrid {
  size?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  offset?: number | { xs?: number; sm?: number; md?: number; lg?: number };
}
