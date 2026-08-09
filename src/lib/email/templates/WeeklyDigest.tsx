import * as React from "react";

type Item = {
  roleTitle: string;
  companyName: string;
  daysSinceApplied?: number;
  interviewDate?: string;
};

type Props = {
  firstName: string;
  followUps: Item[];
  upcomingInterviews: Item[];
  appUrl: string;
};

export function WeeklyDigest({
  firstName,
  followUps,
  upcomingInterviews,
  appUrl,
}: Props) {
  const total = followUps.length + upcomingInterviews.length;
  const previewText =
    total > 0
      ? `${total} thing${total > 1 ? "s" : ""} need your attention this week`
      : "You're all caught up on Stax";

  return (
    <html lang="en">
      <head>
        <title>{previewText}</title>
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
            maxWidth: 520,
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
            {total > 0
              ? `You have ${total} thing${total > 1 ? "s" : ""} that need your attention this week.`
              : "Nothing pressing this week — you're all caught up."}
          </p>

          {followUps.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h2
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "#71717a",
                  margin: "0 0 12px",
                }}
              >
                Follow ups
              </h2>
              {followUps.map((item, i) => (
                <div
                  key={`${item.companyName}-${item.roleTitle}`}
                  style={{
                    padding: "12px 0",
                    borderBottom:
                      i === followUps.length - 1 ? "none" : "1px solid #e4e4e7",
                  }}
                >
                  <div
                    style={{ fontSize: 14, fontWeight: 500, color: "#18181b" }}
                  >
                    {item.roleTitle}
                  </div>
                  <div style={{ fontSize: 13, color: "#71717a", marginTop: 2 }}>
                    {item.companyName}
                    {item.daysSinceApplied != null && (
                      <> · {item.daysSinceApplied} days since you applied</>
                    )}
                  </div>
                </div>
              ))}
            </section>
          )}

          {upcomingInterviews.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h2
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "#71717a",
                  margin: "0 0 12px",
                }}
              >
                Upcoming interviews
              </h2>
              {upcomingInterviews.map((item, i) => (
                <div
                  key={`${item.companyName}-${item.roleTitle}`}
                  style={{
                    padding: "12px 0",
                    borderBottom:
                      i === upcomingInterviews.length - 1
                        ? "none"
                        : "1px solid #e4e4e7",
                  }}
                >
                  <div
                    style={{ fontSize: 14, fontWeight: 500, color: "#18181b" }}
                  >
                    {item.roleTitle}
                  </div>
                  <div style={{ fontSize: 13, color: "#71717a", marginTop: 2 }}>
                    {item.companyName}
                    {item.interviewDate && <> · {item.interviewDate}</>}
                  </div>
                </div>
              ))}
            </section>
          )}

          <a
            href={appUrl}
            style={{
              display: "inline-block",
              backgroundColor: "#18181b",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 500,
              padding: "10px 16px",
              borderRadius: 6,
              textDecoration: "none",
              marginTop: 8,
            }}
          >
            Open Stax
          </a>

          <p
            style={{
              fontSize: 11,
              color: "#a1a1aa",
              marginTop: 32,
              marginBottom: 0,
            }}
          >
            You&apos;re receiving this because email digests are on. Turn them off in{" "}
            <a
              href={`${appUrl}/settings/notifications`}
              style={{ color: "#a1a1aa", textDecoration: "underline" }}
            >
              settings
            </a>
            .
          </p>
        </div>
      </body>
    </html>
  );
}

export default WeeklyDigest;
