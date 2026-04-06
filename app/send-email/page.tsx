import { SendEmailForm } from "@/components/SendEmailForm";
import { getSessionUserEmail, requireAuth } from "@/lib/auth";

export default async function SendEmailPage() {
  await requireAuth();
  const userEmail = (await getSessionUserEmail()) ?? "";

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-12">
      <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Send Email</h1>
        <p className="mt-2 text-sm text-gray-500">
          Simple AWS SES test form for local development.
        </p>
        <SendEmailForm fromEmail={userEmail} />
      </div>
    </main>
  );
}
