export type ParsedEmail = {
  messageId: string;
  senderEmail: string;
  senderName: string | null;
  subject: string;
  date: Date;
  bodyHtml: string | null;
  bodyText: string | null;
  toAddress: string;
};

/**
 * Normalize Postmark Inbound JSON payload into a clean format.
 */
export function normalizePostmarkEmail(payload: any): ParsedEmail {
  const messageId = payload.MessageID || payload.Headers?.find((h: any) => h.Name === "Message-ID")?.Value || Date.now().toString();
  
  // Extract real sender from From field
  const senderEmail = payload.FromFull?.Email || payload.From || "";
  const senderName = payload.FromFull?.Name || null;
  
  // Try to find Original-Sender if it was forwarded via certain clients
  // A robust forward parser would look at body text, but for MVP we rely on headers or original sender
  
  // Clean subject
  let subject = payload.Subject || "(No Subject)";
  subject = subject.replace(/^(Fwd|Fw|Forward|RE|Reply):\s*/i, "").trim();

  // Ensure valid date
  let date = new Date();
  if (payload.Date) {
    const parsed = new Date(payload.Date);
    if (!isNaN(parsed.getTime())) date = parsed;
  }

  const toAddress = payload.ToFull?.[0]?.Email || payload.To || "";

  // Get body
  let bodyHtml = payload.HtmlBody || null;
  let bodyText = payload.TextBody || null;

  // Very basic cleanup of Gmail forwarding wrappers in text
  if (bodyText) {
    const fwMatch = bodyText.match(/---------- Forwarded message ---------[ \S\s]*?Subject: (.*?)\n[ \S\s]*?To:.*?\n\n([\S\s]*)/i);
    if (fwMatch) {
      // If we cleanly matched a Gmail forward, we could extract the nested content,
      // but for V2 we just store the whole text and let the UI render it.
      // Doing full email thread parsing is complex.
    }
  }

  return {
    messageId,
    senderEmail,
    senderName,
    subject,
    date,
    bodyHtml,
    bodyText,
    toAddress,
  };
}
