"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/board";
  const [submitting, setSubmitting] = useState(false);
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "1";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      toast.error("Invalid email or password.");
      setSubmitting(false);
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-[360px] space-y-6">
        <Link href="/" className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center">
            <span className="text-[11px] font-bold text-background">S</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">Stax</span>
        </Link>

        <div className="text-center space-y-1">
          <h1 className="text-base font-semibold tracking-tight">Welcome back</h1>
          <p className="text-xs text-muted-foreground">Log in to your account</p>
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
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="#"
                className="text-[11px] text-muted-foreground hover:text-foreground"
              >
                Forgot?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="h-9"
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full h-9">
            {submitting ? "Logging in…" : "Log in"}
          </Button>
        </form>

        {googleEnabled && (
          <>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full h-9"
              onClick={() => signIn("google", { callbackUrl })}
            >
              Continue with Google
            </Button>
          </>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-foreground hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
