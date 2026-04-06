import "server-only";

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import {
  getAllowedEmailDomainMessage,
  isAllowedEmailDomain,
} from "@/lib/email-domain";

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function createSesClient() {
  return new SESClient({
    region: getRequiredEnv("AWS_REGION"),
    credentials: {
      accessKeyId: getRequiredEnv("AWS_ACCESS_KEY"),
      secretAccessKey: getRequiredEnv("AWS_SECRET_KEY"),
    },
  });
}

export async function sendEmail(input: {
  from: string;
  to: string;
  subject: string;
  message: string;
}) {
  const from = input.from.trim().toLowerCase();
  const to = input.to.trim();
  const subject = input.subject.trim();
  const message = input.message.trim();

  if (!from) {
    throw new Error("Logged-in sender email is required.");
  }

  if (!from.includes("@")) {
    throw new Error("Sender email is invalid.");
  }

  if (!isAllowedEmailDomain(from)) {
    throw new Error(getAllowedEmailDomainMessage());
  }

  if (!to) {
    throw new Error("Recipient email is required.");
  }

  if (!to.includes("@")) {
    throw new Error("Recipient email is invalid.");
  }

  if (!subject) {
    throw new Error("Subject is required.");
  }

  if (!message) {
    throw new Error("Message is required.");
  }

  const client = createSesClient();

  await client.send(
    new SendEmailCommand({
      Source: from,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: message,
            Charset: "UTF-8",
          },
        },
      },
    }),
  );
}
