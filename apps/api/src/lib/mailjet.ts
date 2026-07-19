import Mailjet from "node-mailjet";

let client: Mailjet | null = null;

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.MAILJET_API_KEY &&
      process.env.MAILJET_API_SECRET &&
      process.env.MAILJET_FROM_EMAIL,
  );
}

function getClient(): Mailjet {
  const apiKey = process.env.MAILJET_API_KEY;
  const apiSecret = process.env.MAILJET_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error("MAILJET_API_KEY / MAILJET_API_SECRET are not set");
  }
  if (!client) client = Mailjet.apiConnect(apiKey, apiSecret);
  return client;
}

export interface SendEmailInput {
  to: { email: string; name?: string };
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const fromEmail = process.env.MAILJET_FROM_EMAIL;
  const fromName = process.env.MAILJET_FROM_NAME ?? "AI Recruiter";
  if (!fromEmail) throw new Error("MAILJET_FROM_EMAIL is not set");

  await getClient()
    .post("send", { version: "v3.1" })
    .request({
      Messages: [
        {
          From: { Email: fromEmail, Name: fromName },
          To: [{ Email: input.to.email, Name: input.to.name ?? input.to.email }],
          Subject: input.subject,
          HTMLPart: input.html,
          TextPart: input.text ?? "",
        },
      ],
    });
}
