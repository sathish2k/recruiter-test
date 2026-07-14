export interface EmailTemplatesConfiguration {
  /** Sample variable values used to render the live preview. */
  sample: Record<string, string>;
}

export const EmailTemplatesConfiguration: EmailTemplatesConfiguration = {
  sample: {
    candidate_name: "Savannah Nguyen",
    role: "Senior Backend Engineer",
    company: "Nortech",
    agency: "Troy Consultancy",
    recruiter_name: "Riya Kapoor",
    interview_date: "Thursday, Jul 18",
    interview_time: "10:00 AM PT",
    offer_deadline: "Friday, Jul 25",
  },
};
