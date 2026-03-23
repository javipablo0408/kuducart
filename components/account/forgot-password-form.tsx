"use client";

import Link from "next/link";
import { useState } from "react";
import { requestCustomerPasswordReset } from "@/services/customer-auth";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="bg-white p-8 ring-1 ring-zinc-200">
        <h1 className="text-4xl font-semibold tracking-tight">Forgot password</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Request a reset token to set a new password.
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-6 h-12 w-full bg-zinc-50 px-4 outline-none ring-1 ring-zinc-200 focus:ring-zinc-400"
        />

        <button
          type="button"
          disabled={isLoading}
          onClick={async () => {
            setIsLoading(true);
            setMessage(null);
            try {
              await requestCustomerPasswordReset(email);
              setMessage(
                "Request sent. If the email exists, a reset token was generated in Medusa.",
              );
            } catch (err) {
              setMessage(
                err instanceof Error
                  ? err.message
                  : "Could not request password reset.",
              );
            } finally {
              setIsLoading(false);
            }
          }}
          className="mt-4 h-12 w-full bg-zinc-900 text-sm font-medium uppercase tracking-[0.16em] text-white disabled:opacity-70"
        >
          {isLoading ? "Sending..." : "Request reset"}
        </button>

        {message ? <p className="mt-4 text-sm text-zinc-700">{message}</p> : null}

        <p className="mt-6 text-sm">
          <Link href="/account/reset-password" className="underline">
            Already have a token? Reset password
          </Link>
        </p>
      </div>
    </div>
  );
}
