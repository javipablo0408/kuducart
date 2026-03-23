"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCustomerAuth } from "@/hooks/use-customer-auth";

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useCustomerAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="bg-white p-8 ring-1 ring-zinc-200">
        <h1 className="text-4xl font-semibold tracking-tight">Login</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Sign in to access your customer account.
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 w-full bg-zinc-50 px-4 outline-none ring-1 ring-zinc-200 focus:ring-zinc-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 w-full bg-zinc-50 px-4 outline-none ring-1 ring-zinc-200 focus:ring-zinc-400"
          />
        </div>

        <button
          type="button"
          disabled={isLoading}
          onClick={async () => {
            setError(null);
            try {
              await login(email, password);
              router.push("/account");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Could not sign in.");
            }
          }}
          className="mt-6 h-12 w-full bg-zinc-900 text-sm font-medium uppercase tracking-[0.16em] text-white disabled:opacity-70"
        >
          {isLoading ? "Loading..." : "Continue with Email"}
        </button>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <p className="mt-6 text-sm text-zinc-700">
          Don&apos;t have an account?{" "}
          <Link href="/account/register" className="font-medium underline">
            Register
          </Link>
        </p>
        <p className="mt-2 text-sm text-zinc-700">
          Forgot your password?{" "}
          <Link href="/account/forgot-password" className="font-medium underline">
            Recover access
          </Link>
        </p>
      </div>
    </div>
  );
}
