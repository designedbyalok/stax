import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuthClient } from "@/lib/google/calendar-auth";
import { encrypt } from "@/lib/crypto/encrypt";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/settings/integrations?error=NoCode", req.url));
  }

  try {
    const oauth2Client = getGoogleOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    if (!tokens.refresh_token) {
      // If we don't get a refresh token, it means the user previously authorized and we only got an access token.
      // We need to force them to re-consent to get a refresh token.
      // But we passed prompt=consent in connect, so it should be there.
      console.warn("No refresh token received. We may need to force re-consent.");
    }

    // Get user email from Google's userinfo endpoint. A plain fetch
    // with the access token avoids pulling in the @googleapis/oauth2
    // package just for one field.
    let email = "Unknown";
    try {
      const infoRes = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        { headers: { Authorization: `Bearer ${tokens.access_token}` } }
      );
      if (infoRes.ok) {
        const info = (await infoRes.json()) as { email?: string };
        email = info.email || "Unknown";
      }
    } catch (e) {
      console.warn("Failed to fetch Google userinfo:", e);
    }

    const refreshToken = tokens.refresh_token || tokens.access_token || "";
    
    // Encrypt token
    const { encryptedData, iv } = encrypt(refreshToken);

    // Upsert integration
    await prisma.googleIntegration.upsert({
      where: { userId: auth.userId },
      update: {
        email,
        encryptedToken: encryptedData,
        iv,
      },
      create: {
        userId: auth.userId,
        email,
        encryptedToken: encryptedData,
        iv,
      },
    });

    return NextResponse.redirect(new URL("/settings/integrations?success=1", req.url));
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(new URL("/settings/integrations?error=OAuthFailed", req.url));
  }
}
