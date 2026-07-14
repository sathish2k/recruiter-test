import type { ExportConfig, JsonSchema } from "@recruit/shared";

export interface ToolbarConfiguration {
  manageClientsRouteId?: string;
  export?: ExportConfig;
  addForm?: JsonSchema;
}

const addForm: JsonSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      title: "fields.role",
      placeholder: "fields.rolePlaceholder",
    },
    client: {
      type: "string",
      title: "fields.client",
      placeholder: "fields.clientPlaceholder",
    },
    location: {
      type: "string",
      title: "fields.location",
      placeholder: "fields.locationPlaceholder",
    },
    empType: {
      type: "string",
      title: "fields.empType",
      enum: ["Full-time", "Contract", "Part-time"],
    },
    level: {
      type: "string",
      title: "fields.level",
      enum: ["Junior", "Mid", "Senior", "Staff"],
    },
  },
  required: ["title"],
  errorMessage: { required: { title: "fields.roleRequired" } },
};

export const ToolbarConfig: ToolbarConfiguration = {
  manageClientsRouteId: "Recruit.Clients.Route",
  export: {
    types: [
      { label: "exportTypes.pdf", value: "pdf", icon: "pdf", color: "#E89A9A" },
      {
        label: "exportTypes.excel",
        value: "xlsx",
        icon: "excel",
        color: "#8FD6AC",
      },
      {
        label: "exportTypes.word",
        value: "docx",
        icon: "word",
        color: "#9BB8D9",
      },
    ],
  },
  addForm,
};
