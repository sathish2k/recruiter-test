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
  strengthMeter?: boolean;

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

export type FormValues = Record<string, unknown>;

export interface FormRendererProps {
  schema: JsonSchema;
  defaultValues?: FormValues;
  onSubmit: (data: FormValues) => void | Promise<void>;
  submitLabel?: string;
  loading?: boolean;
  t?: (key: string, fallback?: string) => string;
  beforeSubmit?: import("react").ReactNode;
}
