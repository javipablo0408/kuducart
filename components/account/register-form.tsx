"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCustomerAuth } from "@/hooks/use-customer-auth";

export function RegisterForm() {
  const router = useRouter();
  const { register, isLoading } = useCustomerAuth();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="bg-white p-8 ring-1 ring-zinc-200">
        <h1 className="text-4xl font-semibold tracking-tight">Create Account</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Join our curated community of global collectors.
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="First name"
            value={form.first_name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, first_name: event.target.value }))
            }
            className="h-12 w-full bg-zinc-50 px-4 outline-none ring-1 ring-zinc-200 focus:ring-zinc-400"
          />
          <input
            type="text"
            placeholder="Last name"
            value={form.last_name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, last_name: event.target.value }))
            }
            className="h-12 w-full bg-zinc-50 px-4 outline-none ring-1 ring-zinc-200 focus:ring-zinc-400"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, email: event.target.value }))
            }
            className="h-12 w-full bg-zinc-50 px-4 outline-none ring-1 ring-zinc-200 focus:ring-zinc-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, password: event.target.value }))
            }
            className="h-12 w-full bg-zinc-50 px-4 outline-none ring-1 ring-zinc-200 focus:ring-zinc-400"
          />
        </div>

        <button
          type="button"
          disabled={isLoading}
          onClick={async () => {
            setError(null);
            try {
              await register(form);
              router.push("/account");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Could not create account.");
            }
          }}
          className="mt-6 h-12 w-full bg-[#596041] text-sm font-medium uppercase tracking-[0.16em] text-white disabled:opacity-70"
        >
          {isLoading ? "Creating..." : "Sign Up"}
        </button>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <p className="mt-6 text-sm text-zinc-700">
          Already have an account?{" "}
          <Link href="/account/login" className="font-medium underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
