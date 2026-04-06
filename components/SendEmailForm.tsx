"use client";

import { FormEvent, useState } from "react";

const INITIAL_FORM = {
  to: "",
  subject: "",
  message: "",
};

export function SendEmailForm({ fromEmail }: { fromEmail: string }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!fromEmail) {
      setError("Please log in before sending email.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          ...form,
        }),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: string;
        message?: string;
      };

      if (!response.ok || !result.success) {
        setError(result.error ?? "Failed to send email.");
        return;
      }

      setSuccess(result.message ?? "Email sent successfully.");
      setForm(INITIAL_FORM);
    } catch {
      setError("Failed to send email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          From
        </label>
        <input
          type="email"
          value={fromEmail}
          readOnly
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 outline-none"
          placeholder="Log in to load sender email"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Recipient Email
        </label>
        <input
          type="email"
          required
          value={form.to}
          onChange={(event) =>
            setForm((current) => ({ ...current, to: event.target.value }))
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900"
          placeholder="recipient@example.com"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Subject
        </label>
        <input
          type="text"
          required
          value={form.subject}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              subject: event.target.value,
            }))
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900"
          placeholder="Subject"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          required
          value={form.message}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              message: event.target.value,
            }))
          }
          className="min-h-40 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900"
          placeholder="Write your message"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-green-600">{success}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
