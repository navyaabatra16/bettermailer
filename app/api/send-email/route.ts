import { NextResponse } from "next/server";
import { createSentEmail } from "@/lib/mailbox";
import { sendEmail } from "@/lib/ses";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      from?: string;
      to?: string;
      subject?: string;
      message?: string;
    };

    await sendEmail({
      from: body.from ?? "",
      to: body.to ?? "",
      subject: body.subject ?? "",
      message: body.message ?? "",
    });

    await createSentEmail({
      ownerEmail: body.from ?? "",
      recipientEmail: body.to ?? "",
      subject: body.subject ?? "",
      body: body.message ?? "",
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send email.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 },
    );
  }
}
