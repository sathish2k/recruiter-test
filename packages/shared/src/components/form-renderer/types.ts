export type JsonSchemaType = "string" | "number" | "integer" | "boolean" | "array";

export type Widget =
  | "text"
  | "textarea"
  | "markdown"
  | "password"
  | "select"
  | "segmented"
  | "switch"
  | "checkbox"
  | "chips";

export interface JsonSchemaProperty {
  type: JsonSchemaType;

  format?: "email" | "password" | "tel" | "url" | "date";
  items?: { type: JsonSchemaType };
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
  widget?: Widget;
  /** Field name this value must equal (e.g. confirm-password). Validated by
   * the form resolver; failure message comes from `errorMessage.matches`. */
  matchesField?: string;
  icon?: string;
  hideLabel?: boolean;
  help?: string;
  rows?: number;
  strengthMeter?: boolean | PasswordStrengthConfig;

  errorMessage?: string | Record<string, string>;
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

export interface PasswordStrengthConfig {
  /** Regex rules (as strings); each password match adds one to the score. */
  rules?: string[];
  /** Translation key (or literal) shown for each score level. */
  labels?: string[];
  /** Bar color for each score level. */
  colors?: string[];
}

export type FormValues = Record<string, unknown>;

export interface FormRendererProps {
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
}

/** A field slot in a section — a schema property key, optionally spanning
 * multiple grid columns. */
export type FormSectionField = string | { name: string; span?: number };

/** A titled group of schema fields rendered as its own card. */
export interface FormSection {
  /** Section heading translation key. */
  title?: string;
  /** Section sub-text translation key. */
  description?: string;
  /** Grid columns for the section's fields (default 2). */
  columns?: number;
  fields: FormSectionField[];
}

export interface FormWithSectionsProps extends Omit<FormRendererProps, "beforeSubmit"> {
  sections: FormSection[];
  /** Page heading translation key rendered above the sections. */
  title?: string;
  /** Page sub-heading translation key. */
  description?: string;
  /** Icon name for the submit button. */
  submitIcon?: string;
  /** Rendered in a 340px column beside the sections (design side panel). */
  sidePanel?: import("react").ReactNode;
  /** Translation key for the save-draft button (rendered when onSaveDraft is set). */
  draftLabel?: string;
  /** Called with the current form values (no validation) when Save draft is clicked. */
  onSaveDraft?: (values: FormValues) => void | Promise<void>;
}
