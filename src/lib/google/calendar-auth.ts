import { google } from "googleapis";

// In production, these should be properly configured in Google Cloud Console
// For local development, they should be set in .env
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

// We need a stable callback URL
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const REDIRECT_URI = `${NEXT_PUBLIC_APP_URL}/api/integrations/google-calendar/callback`;

export function getGoogleOAuthClient() {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );
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
