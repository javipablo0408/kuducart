import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/account/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="px-6 py-16 text-sm text-zinc-600">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
