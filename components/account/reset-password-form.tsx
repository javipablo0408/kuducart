"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { resetCustomerPasswordWithToken } from "@/services/customer-auth";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const tokenFromQuery = searchParams.get("token") ?? "";
  const [token, setToken] = useState(tokenFromQuery);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="bg-white p-8 ring-1 ring-zinc-200">
        <h1 className="text-4xl font-semibold tracking-tight">Reset password</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Paste your reset token and choose a new password.
        </p>

        <textarea
          placeholder="Reset token"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          className="mt-6 min-h-24 w-full bg-zinc-50 px-4 py-3 outline-none ring-1 ring-zinc-200 focus:ring-zinc-400"
        />
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-3 h-12 w-full bg-zinc-50 px-4 outline-none ring-1 ring-zinc-200 focus:ring-zinc-400"
        />

        <button
          type="button"
          disabled={isLoading}
          onClick={async () => {
            setIsLoading(true);
            setMessage(null);
            try {
              await resetCustomerPasswordWithToken(token.trim(), password);
              setMessage("Password reset successfully. You can now sign in.");
            } catch (err) {
              setMessage(
                err instanceof Error ? err.message : "Could not reset password.",
              );
            } finally {
              setIsLoading(false);
            }
          }}
          className="mt-4 h-12 w-full bg-zinc-900 text-sm font-medium uppercase tracking-[0.16em] text-white disabled:opacity-70"
        >
          {isLoading ? "Updating..." : "Reset password"}
        </button>

        {message ? <p className="mt-4 text-sm text-zinc-700">{message}</p> : null}
      </div>
    </div>
  );
}
