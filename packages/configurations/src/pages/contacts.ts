import type { Configuration } from "@recruit/sdk";

export const ContactPages: Record<string, Configuration> = {
  "Recruit.Contacts.Page": {
    id: "Recruit.Contacts.Page",
    elements: [{ id: "contacts", type: "component", componentType: "Recruit.Contacts.Component" }],
  },
  "Recruit.ContactForm.Page": {
    id: "Recruit.ContactForm.Page",
    elements: [
      { id: "contact-form", type: "component", componentType: "Recruit.ContactForm.Component" },
    ],
  },
};
