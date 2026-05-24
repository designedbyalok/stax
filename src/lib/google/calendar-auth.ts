import { google } from "googleapis";

// We share the same OAuth client with Auth.js v5 (AUTH_GOOGLE_ID/SECRET).
// Older `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` names are kept as a fallback
// so existing local setups don't break. Resolved lazily inside the helper so
// missing env doesn't silently produce an empty client_id at module load.
function readEnv() {
  const clientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret =
    process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
  const appUrl =
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
  return {
    clientId,
    clientSecret,
    redirectUri: `${appUrl.replace(/\/$/, "")}/api/integrations/google-calendar/callback`,
  };
}

export function getGoogleOAuthClient() {
  const { clientId, clientSecret, redirectUri } = readEnv();
  if (!clientId || !clientSecret) {
    // Fail loudly instead of letting Google reject with the cryptic
    // "Missing required parameter: client_id" error.
    throw new Error(
      "Google OAuth env missing: set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET"
    );
  }
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getGoogleAuthUrl() {
  const oauth2Client = getGoogleOAuthClient();
  
  // Generate a url that asks permissions for Google Calendar scopes
  const scopes = [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
  ];

  return oauth2Client.generateAuthUrl({
    // 'offline' gets refresh_token
    access_type: "offline",
    // If you only need one scope you can pass it as a string
    scope: scopes,
    // Enable incremental authorization. Recommended as a best practice.
    include_granted_scopes: true,
    prompt: "consent", // Force consent screen to get refresh token
  });
}
