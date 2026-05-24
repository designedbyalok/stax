"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StaxMark } from "@/components/StaxMark";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      toast.error("Missing or invalid reset link.");
      return;
    }
    setSubmitting(true);

    const data = new FormData(e.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      setSubmitting(false);
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Reset failed" }));
        toast.error(error || "This link is invalid or expired.");
        setSubmitting(false);
        return;
      }

      toast.success("Password updated. You can now log in.");
      router.push("/login");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-base font-semibold tracking-tight">
          Reset link missing
        </h1>
        <p className="text-xs text-muted-foreground">
          The reset link is missing its token. Request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block text-xs text-foreground underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center space-y-1">
        <h1 className="text-base font-semibold tracking-tight">
          Choose a new password
        </h1>
        <p className="text-xs text-muted-foreground">
          Pick something at least 8 characters.
        </p>
      </div>

      <form className="space-y-3" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            autoFocus
            className="h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-9"
          />
        </div>
        <Button type="submit" disabled={submitting} className="w-full h-9">
          {submitting ? "Updating…" : "Update password"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/login" className="hover:text-foreground">
          ← Back to log in
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-[360px] space-y-6">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 text-foreground"
        >
          <StaxMark size={22} strokeWidth={3} gap={2} />
          <span className="text-sm font-semibold tracking-tight">Stax</span>
        </Link>

        <Suspense
          fallback={<div className="text-xs text-muted-foreground">Loading…</div>}
        >
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
