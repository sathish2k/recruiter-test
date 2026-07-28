import type {
  Control,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
} from "react-hook-form";
import type { CompletenessCheck } from "./completeness/completeness";

/** Resolves a translation key, optionally falling back to literal English. */
export type Translate = (key: string, fallback?: string | Record<string, unknown>) => string;

export type JsonSchemaType = "string" | "number" | "integer" | "boolean" | "array" | "object";

/** Built-in widgets — every one of these ships in the form layer. */
export type BuiltInWidget =
  | "text"
  | "textarea"
  | "markdown"
  | "password"
  | "select"
  | "segmented"
  | "tiles"
  | "email-list"
  | "switch"
  | "switch-row"
  | "checkbox"
  | "chips"
  | "phone"
  | "upload"
  | "attachments"
  | "callout"
  | "repeater"
  | "resumeAutofill"
  | "days"
  | "radio"
  | "checkbox-group"
  | "multiselect"
  | "number"
  | "number-map"
  | "slider"
  | "date"
  | "time"
  | "datetime"
  | "color"
  | "heading"
  | "completeness"
  | "facts"
  | "generated-doc"
  | "verification-code"
  | "choice-chips";

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

/** A predicate over another field's current value — drives `condition`
 * (show/hide) and `disabledWhen` (enable/disable). Exactly one operator. */
export interface FieldCondition {
  /** Field name whose value is tested. */
  field: string;
  equals?: string | number | boolean;
  notEquals?: string | number | boolean;
  in?: Array<string | number | boolean>;
  /** True while the field holds a non-blank value (`false` inverts it). */
  filled?: boolean;
  /** True once the field holds at least this many digits, ignoring a leading
   * dial code — a phone field is never "empty", it starts at `+91`. */
  digitsMin?: number;
}

/** On a checkbox: while checked, live-copy each `from[i]` into `to[i]` and render
 * the `to` fields disabled (the "shipping same as billing" pattern, from config). */
export interface SyncFields {
  from: string[];
  to: string[];
}

/** One option of a `choice-chips` field. `label` is a translation key; `meta`
 * and `symbol` are literal (an offset, a currency sign). */
export interface ChoiceOption {
  value: string;
  label: string;
  meta?: string;
  symbol?: string;
}

export interface JsonSchemaProperty {
  /** Value → dot colour, drawn before the label in the control and the menu —
   * the design`s client-status lifecycle. */
  optionDots?: Record<string, string>;
  /** Value → help translation key, replacing `help` while that value is selected. */
  helpWhen?: Record<string, string>;
  /** Append the design`s dimmed " · optional" suffix to the label. */
  optional?: boolean;
  /** Draw this control at the design`s smaller size, as the rail`s fields are —
   * for a dense control sitting in the wide column. */
  dense?: boolean;
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
  /** Translation namespace for `enum` option labels: each option is shown as
   * `t("<enumL10n>.<value>")` (an empty value maps to `<enumL10n>.none`). Lets a
   * select localise its choices from config, with no component-side `enumNames`. */
  enumL10n?: string;
  /** Opt this field into document extraction (the resume-autofill card). The
   * form's schema *is* the extraction contract, so marking a field here is the
   * only change needed for it to be parsed out of an upload and prefilled —
   * nothing is hardcoded server-side. `hint` guides the model when the field
   * name alone is ambiguous; for an `array` with `itemSchema` (a repeater) the
   * whole row shape is requested. */
  extract?: boolean | { hint?: string; overwrite?: boolean };
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
   * strip — icon + help text, no title). `resumeAutofill`: `"hero"` draws the
   * design's tall drop zone for the top of a form rather than the rail's strip. */
  variant?: "card" | "banner" | "hero";
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
  /** Leading "none" row in a searchable select, e.g. "No parent company". */
  emptyOption?: string;
  /** `select`: show a coloured initials avatar beside each option and the chosen
   * value (a person/contact picker). */
  avatar?: boolean;
  /** `select`: `"pill"` is the design's section-header category chip (rounded,
   * borderless-looking); `"compact"` is the short prefix control that sits
   * beside another field (the salutation before a first name). */
  selectVariant?: "pill" | "compact" | "label";
  /** Schema property rendered as a small control immediately before this
   * field's own, sharing its label — the design's salutation + first name. */
  leading?: string;
  /** Schema properties rendered after this field's own control, sharing its
   * label — the design's "Salary range" row of currency, from and to. */
  trailing?: string[];
  /** `select`: option value → predicate that must hold for it to be selectable.
   * An option whose predicate fails is greyed and shows `optionDisabledHint`;
   * if the current value becomes unselectable the field falls to the first
   * option that is. */
  optionEnabledWhen?: Record<string, FieldCondition>;
  /** Suffix on a disabled option's label, e.g. "— add details first". A t-key. */
  optionDisabledHint?: string;
  /** Fixed width for a `leading` companion control (the design gives the
   * salary currency 104px). */
  width?: number;
  /** `chips`: label for the header suggest action. */
  suggestLabel?: string;
  /** `chips`: show the "= AI-extracted" legend beside the label. */
  suggestLegend?: boolean;
  /** `repeater`: open with one blank row instead of an empty list. */
  startEmptyRow?: boolean;
  /** `generated-doc`: headline shown before the document exists. */
  emptyTitle?: string;
  /** `generated-doc`: label on the build action. */
  generateLabel?: string;
  /** `facts`: label/value provenance rows. */
  facts?: { label: string; path: string }[];
  /** `completeness`: the quality checks the card scores. */
  checks?: CompletenessCheck[];
  /** `heading`: rule above the label, separating it from the block before. */
  divider?: boolean;
  /** Show this field only while the predicate holds; hidden fields are stripped
   * from the payload and skipped in validation. */
  condition?: FieldCondition;
  /** Render this field disabled (greyed, value kept + still submitted) while the
   * predicate holds. */
  disabledWhen?: FieldCondition;
  /** `checkbox`: while checked, copy `from`→`to` (kept in sync) and disable the
   * `to` fields. Replaces bespoke "same as billing" widgets. */
  syncFields?: SyncFields;
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
  /** `number-map`: field on each option row holding the fallback shown as that
   * row's placeholder — the workspace default a requirement overrides. */
  defaultKey?: string;
  /** `slider`: captions under the track ends (translation keys), e.g.
   * "50 · broad" / "95 · strict". The value readout uses `unit` as its suffix. */
  minLabel?: string;
  maxLabel?: string;
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
  /** `repeater`: the fields of one row (a sub-record); stored as an array of
   * objects. Nested field names are `<name>.<index>.<key>`. */
  itemSchema?: Record<string, JsonSchemaProperty>;
  /** `choice-chips`: the options offered, each able to carry a second line. */
  choices?: ChoiceOption[];
  /** `choice-chips`: `"stacked"` puts the detail under the label in a rounded
   * card (the date-format picker) rather than beside it in a pill. */
  choiceLayout?: "inline" | "stacked";
  /** Palette path for `icon` when the default accent is wrong — the design
   * tones each rejection group differently. */
  iconColor?: string;
  /** Dimmed note beside the label, where `help` would sit below it. */
  labelHint?: string;
  /** `callout` banner colouring. Defaults to the accent orange. */
  tone?: "accent" | "info" | "warning";
  /** Array fields a display-only counter sums — see the wizard's
   * `selection-count`, which totals the ticked rejection reasons. */
  countFields?: string[];
  /** Puts `help` under the label instead of under the control — for text that
   * explains the choice rather than correcting the input. */
  helpPlacement?: "above" | "below";
  /** `repeater`: translation key for the "add row" button. */
  addLabel?: string;
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
  /** Dot colour drawn before the label, when the schema maps one. */
  dot?: string;
  value: string;
  label: string;
  /** The original row, when options came from an endpoint. */
  raw?: Record<string, unknown>;
  /** Shown greyed and not selectable — the design's "add details first" rows. */
  disabled?: boolean;
  /** Dimmed note after the label, in the menu only (not the closed control). */
  hint?: string;
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
  /** `meta.addAnother` is true when the user hit "Save & add another" — the
   * caller persists but skips navigation (the renderer clears the form). */
  onSubmit: (data: FormValues, meta?: { addAnother?: boolean }) => void | Promise<void>;
  /** Translation key for the submit button (default "submit"). */
  submitLabel?: string;
  /** When set, renders a Cancel button beside Submit (footer row) that calls it. */
  onCancel?: () => void;
  /** Translation key for the cancel button (default "cancel"). */
  cancelLabel?: string;
  loading?: boolean;
  beforeSubmit?: import("react").ReactNode;
  /**
   * Wraps the rendered fields — a screen whose design puts the fields on their
   * own surface (a panel card) with the actions outside it. Receives the field
   * block, returns whatever should stand in for it.
   */
  wrapFields?: (fields: import("react").ReactNode) => import("react").ReactNode;
  /**
   * Replaces the default submit row. The returned tree is still inside the
   * `<form>`, so a `type="submit"` button in it submits normally — which is how
   * a design can place Back/Skip/Continue outside the field surface.
   */
  actions?: (state: FormActionsState) => import("react").ReactNode;
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
  /**
   * Field names hidden behind a "more" toggle at the foot of the section — the
   * design keeps secondary handles out of the way until asked for. The two
   * labels are translation keys for the collapsed and expanded states.
   */
  moreFields?: string[];
  moreLabel?: { show: string; hide: string };
  /** Section sub-text translation key. */
  description?: string;
  /** Field name pulled out of the body and rendered at the right of the card
   * header — the design's Attachments category pill. */
  headerField?: string;
  /** Show one field at a time behind pill tabs labelled from each field's
   * title — the design's Description / Requirements / Benefits editor. */
  tabbed?: boolean;
  /** Skip the section card chrome and render the fields bare — for a single
   * display widget (e.g. a callout) that draws its own container. */
  bare?: boolean;
  /** Draw the card with the accent (orange) border instead of the neutral one —
   * for a highlighted section like a fee agreement. */
  accent?: boolean;
  /** ICON_REGISTRY name shown (accent-coloured) before the section title. */
  icon?: string;
  /** Render `icon` inside a filled orange square badge (the design's AI cards)
   * rather than as a bare inline glyph. */
  iconBadge?: boolean;
  /** Card look: `"text"` (default — bordered card) or `"filled"` (solid neutral-
   * tinted panel, no border). Composable with `accent`/`icon`. */
  variant?: "text" | "filled";
  /** On a `sections` group: stick the column to the top of the viewport while the
   * rest of the form scrolls (the design's side panel). */
  sticky?: boolean;
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
  /** Columns; each field places itself with its own `grid`. `alignItems:
   * "flex-end"` bottom-aligns the controls in a row (e.g. a labelled field
   * beside an unlabelled one). */
  gridContainer?: Pick<
    import("@mui/material/Grid").GridProps,
    "spacing" | "direction" | "columns"
  > & {
    alignItems?: "flex-start" | "center" | "flex-end" | "stretch" | "baseline";
    /** CSS grid template, for columns MUI`s 12-column split cannot express — the
     * design`s fixed-width side rail (`minmax(0,1fr) 340px`). Children place
     * themselves in order and their `grid.size` is ignored; it collapses to a
     * single column below `md`. */
    templateColumns?: string;
  };
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
  /** When set, the built-in cluster gains a middle "Save & add another" button
   * (create screens); on that submit the renderer clears the form and stays. */
  addAnotherLabel?: string;
  /** Where the button cluster sits. `"sticky"` = a bottom bar shown only while the
   * form is dirty. Defaults to the header, above the sections. */
  actionsPlacement?: "header" | "footer" | "sticky";
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
  /** Set by the renderer from `disabledWhen` / a checkbox's `syncFields`: render
   * the control disabled, but keep the value in form state so it still submits. */
  disabled?: boolean;
  /** The form's control, so a widget can watch sibling fields — e.g. a select
   * whose options unlock as the fields they depend on are filled. */
  control?: Control<FieldValues>;
}

/** Grid placement for a field, mirroring the engine's LayoutElement. */
export interface FieldGrid {
  size?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  offset?: number | { xs?: number; sm?: number; md?: number; lg?: number };
}
