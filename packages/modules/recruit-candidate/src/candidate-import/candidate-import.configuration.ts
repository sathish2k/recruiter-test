import type { JsonSchema } from "@recruit/shared";
import { CandidateFormConfiguration } from "../candidate-form/candidate-form.configuration";

export interface CandidateImportConfiguration {
  /** The candidate form's own schema. It is both the extraction contract (every
   * `extract` field is asked of a CV) and the CSV column vocabulary, so import
   * follows the form without a second list to maintain. */
  schema: JsonSchema;
  /** Fields shown as columns in the review table. */
  reviewFields: string[];
  /** File types the CV path accepts, and how many at once. */
  accept: string;
  maxFiles: number;
  listRouteId: string;
  editRouteId: string;
}

export const CandidateImportConfiguration: CandidateImportConfiguration = {
  schema: CandidateFormConfiguration.schema,
  reviewFields: ["firstName", "lastName", "email", "mobile", "currentJobTitle"],
  accept: "application/pdf,.doc,.docx,.txt",
  maxFiles: 25,
  listRouteId: "Recruit.Candidates.Route",
  editRouteId: "Recruit.CandidateEdit.Route",
};
