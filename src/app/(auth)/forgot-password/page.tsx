"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StaxMark } from "@/components/StaxMark";

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();

    try {
      const res = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok && res.status === 429) {
        toast.error("Too many requests. Try again later.");
        setSubmitting(false);
        return;
      }
    } catch {
      // Even on failure, we treat the UX as success to avoid leaking
      // whether the email exists.
    }

    setSent(true);
    setSubmitting(false);
  }

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

        {sent ? (
          <div className="space-y-4 text-center">
            <h1 className="text-base font-semibold tracking-tight">
              Check your inbox
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If an account exists for that email, we&apos;ve sent a reset link.
              The link will expire in 60 minutes.
            </p>
            <p className="text-xs text-muted-foreground">
              Didn&apos;t get it? Check spam, then{" "}
              <button
                type="button"
                className="text-foreground underline"
                onClick={() => setSent(false)}
              >
                try again
              </button>
              .
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ← Back to log in
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center space-y-1">
              <h1 className="text-base font-semibold tracking-tight">
                Reset your password
              </h1>
              <p className="text-xs text-muted-foreground">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            <form className="space-y-3" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  className="h-9"
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full h-9">
                {submitting ? "Sending…" : "Send reset link"}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              Remembered it?{" "}
              <Link href="/login" className="text-foreground hover:underline">
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
