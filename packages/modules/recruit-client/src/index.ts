import type { Module } from "@recruit/sdk";
import { CLIENT_DETAIL_COMPONENT } from "./client-detail/bootstrap";
import { CLIENT_FORM_COMPONENT } from "./client-form/bootstrap";
import { CLIENT_STATS_COMPONENT } from "./client-stats/bootstrap";
import { CLIENTS_COMPONENT } from "./clients/bootstrap";

export const ClientModule: Module = {
  id: "Client.Module",
  components: [
    CLIENTS_COMPONENT,
    CLIENT_STATS_COMPONENT,
    CLIENT_FORM_COMPONENT,
    CLIENT_DETAIL_COMPONENT,
  ],
};
