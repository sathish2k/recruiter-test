export type JsonSchemaType = "string" | "number" | "integer" | "boolean";

export type Widget =
  | "text"
  | "textarea"
  | "password"
  | "select"
  | "switch"
  | "checkbox";

export interface JsonSchemaProperty {
  type: JsonSchemaType;

  format?: "email" | "password" | "tel" | "url" | "date";
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
  loading?: boolean;
  beforeSubmit?: import("react").ReactNode;
}
