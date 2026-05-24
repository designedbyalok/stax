import { LoginForm } from "./LoginForm";

// Force per-request rendering so process.env (AUTH_GOOGLE_*) is evaluated at
// runtime on the server, not baked in at build time.
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const googleEnabled =
    !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

  return <LoginForm googleEnabled={googleEnabled} />;
}
