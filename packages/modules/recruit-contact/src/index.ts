import type { Module } from "@recruit/sdk";
import { CONTACT_FORM_COMPONENT } from "./contact-form/bootstrap";
import { CONTACTS_COMPONENT } from "./contacts/bootstrap";

export const ContactModule: Module = {
  id: "Contact.Module",
  components: [CONTACTS_COMPONENT, CONTACT_FORM_COMPONENT],
};
