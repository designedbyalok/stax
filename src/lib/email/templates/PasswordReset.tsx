import * as React from "react";

type Props = {
  firstName: string;
  resetUrl: string;
  expiresInMinutes: number;
};

export function PasswordReset({ firstName, resetUrl, expiresInMinutes }: Props) {
  return (
    <html>
      <head>
        <title>Reset your Stax password</title>
      </head>
      <body
        style={{
          backgroundColor: "#f4f4f5",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
          padding: "32px 0",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            padding: 32,
            maxWidth: 480,
            margin: "0 auto",
          }}
        >
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>
            Hey {firstName || "there"},
          </h1>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "#52525b",
              margin: "0 0 24px",
            }}
          >
            Someone (hopefully you) asked to reset the password for your Stax
            account. Click the button below to choose a new one. The link is
            valid for {expiresInMinutes} minutes.
          </p>

          <a
            href={resetUrl}
            style={{
              display: "inline-block",
              backgroundColor: "#18181b",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 500,
              padding: "10px 16px",
              borderRadius: 6,
              textDecoration: "none",
              marginBottom: 24,
            }}
          >
            Reset password
          </a>

          <p
            style={{
              fontSize: 12,
              color: "#71717a",
              lineHeight: 1.6,
              marginBottom: 16,
            }}
          >
            Or copy and paste this link into your browser:
            <br />
            <span style={{ wordBreak: "break-all", color: "#52525b" }}>
              {resetUrl}
            </span>
          </p>

          <p
            style={{
              fontSize: 11,
              color: "#a1a1aa",
              lineHeight: 1.6,
              borderTop: "1px solid #e4e4e7",
              paddingTop: 16,
              marginBottom: 0,
            }}
          >
            If you didn&apos;t request this, you can safely ignore this email — your
            password won&apos;t change.
          </p>
        </div>
      </body>
    </html>
  );
}

export default PasswordReset;
