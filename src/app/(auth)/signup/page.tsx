"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { track } from "@/lib/analytics";

export default function SignupPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "1";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Signup failed" }));
        toast.error(error || "Signup failed");
        setSubmitting(false);
        return;
      }

      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      track("signup", { provider: "credentials" });

      if (signInRes?.error) {
        toast.error("Account created — please log in.");
        router.push("/login");
        return;
      }

      router.push("/board");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSubmitting(false);
    }
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
          <h1 className="text-base font-semibold tracking-tight">Create your account</h1>
          <p className="text-xs text-muted-foreground">Track applications in seconds</p>
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required autoComplete="name" className="h-9" />
          </div>
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="h-9"
            />
            <p className="text-[10px] text-muted-foreground">At least 8 characters</p>
          </div>
          <Button type="submit" disabled={submitting} className="w-full h-9">
            {submitting ? "Creating account…" : "Create account"}
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
              onClick={() => signIn("google", { callbackUrl: "/board" })}
            >
              Continue with Google
            </Button>
          </>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
