import type { Module } from "@recruit/sdk";
import { CLIENT_DETAIL_ACTIVITY_COMPONENT } from "./client-detail-activity/bootstrap";
import { CLIENT_DETAIL_AGREEMENT_COMPONENT } from "./client-detail-agreement/bootstrap";
import { CLIENT_DETAIL_CONTACTS_COMPONENT } from "./client-detail-contacts/bootstrap";
import { CLIENT_DETAIL_HEADER_COMPONENT } from "./client-detail-header/bootstrap";
import { CLIENT_DETAIL_STATS_COMPONENT } from "./client-detail-stats/bootstrap";
import { CLIENT_DETAIL_SUBMISSIONS_COMPONENT } from "./client-detail-submissions/bootstrap";
import { CLIENT_DETAIL_WORKSPACE_COMPONENT } from "./client-detail-workspace/bootstrap";
import { CLIENT_FORM_COMPONENT } from "./client-form/bootstrap";
import { CLIENT_STATS_COMPONENT } from "./client-stats/bootstrap";
import { CLIENTS_COMPONENT } from "./clients/bootstrap";

export const ClientModule: Module = {
  id: "Client.Module",
  components: [
    CLIENTS_COMPONENT,
    CLIENT_STATS_COMPONENT,
    CLIENT_FORM_COMPONENT,
    CLIENT_DETAIL_HEADER_COMPONENT,
    CLIENT_DETAIL_STATS_COMPONENT,
    CLIENT_DETAIL_SUBMISSIONS_COMPONENT,
    CLIENT_DETAIL_WORKSPACE_COMPONENT,
    CLIENT_DETAIL_CONTACTS_COMPONENT,
    CLIENT_DETAIL_AGREEMENT_COMPONENT,
    CLIENT_DETAIL_ACTIVITY_COMPONENT,
  ],
};
