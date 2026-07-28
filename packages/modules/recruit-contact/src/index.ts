import type { Module } from "@recruit/sdk";
import { CONTACT_DETAIL_BRIEFING_COMPONENT } from "./contact-detail-briefing/bootstrap";
import { CONTACT_DETAIL_CLIENT_COMPONENT } from "./contact-detail-client/bootstrap";
import { CONTACT_DETAIL_HEADER_COMPONENT } from "./contact-detail-header/bootstrap";
import { CONTACT_DETAIL_INFO_COMPONENT } from "./contact-detail-info/bootstrap";
import { CONTACT_DETAIL_RELATIONSHIP_COMPONENT } from "./contact-detail-relationship/bootstrap";
import { CONTACT_DETAIL_STATS_COMPONENT } from "./contact-detail-stats/bootstrap";
import { CONTACT_DETAIL_WAITING_COMPONENT } from "./contact-detail-waiting/bootstrap";
import { CONTACT_DETAIL_WORKSPACE_COMPONENT } from "./contact-detail-workspace/bootstrap";
import { CONTACT_FORM_COMPONENT } from "./contact-form/bootstrap";
import { CONTACTS_COMPONENT } from "./contacts/bootstrap";

export const ContactModule: Module = {
  id: "Contact.Module",
  components: [
    CONTACTS_COMPONENT,
    CONTACT_FORM_COMPONENT,
    CONTACT_DETAIL_HEADER_COMPONENT,
    CONTACT_DETAIL_BRIEFING_COMPONENT,
    CONTACT_DETAIL_STATS_COMPONENT,
    CONTACT_DETAIL_WAITING_COMPONENT,
    CONTACT_DETAIL_WORKSPACE_COMPONENT,
    CONTACT_DETAIL_INFO_COMPONENT,
    CONTACT_DETAIL_RELATIONSHIP_COMPONENT,
    CONTACT_DETAIL_CLIENT_COMPONENT,
  ],
};
