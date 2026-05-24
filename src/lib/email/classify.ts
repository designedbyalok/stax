import { EmailIntent } from "@prisma/client";

/**
 * Regex-based intent classification for inbound emails.
 * Fast, deterministic, no LLM required.
 */
export function classifyEmailIntent(subject: string, bodyText: string): EmailIntent {
  const text = `${subject}\n${bodyText}`.toLowerCase();

  // 1. Rejection
  const rejectionPatterns = [
    /unfortunately/i,
    /not moving forward/i,
    /decided to move forward with other candidates/i,
    /pursue other candidates/i,
    /we regret to inform you/i,
    /will not be proceeding/i,
    /careful consideration/i,
    /another candidate/i,
  ];
  if (rejectionPatterns.some(p => p.test(text))) {
    return EmailIntent.REJECTION;
  }

  // 2. Interview Invite
  const interviewPatterns = [
    /interview/i,
    /schedule a time/i,
    /next steps/i,
    /would love to chat/i,
    /phone screen/i,
    /availability/i,
    /calendly\.com/i,
    /zoom\.us/i,
    /google meet/i,
  ];
  if (interviewPatterns.some(p => p.test(text))) {
    return EmailIntent.INTERVIEW_INVITE;
  }

  // 3. Offer
  const offerPatterns = [
    /offer letter/i,
    /pleased to offer/i,
    /extend an offer/i,
    /welcome to the team/i,
    /compensation package/i,
  ];
  if (offerPatterns.some(p => p.test(text))) {
    return EmailIntent.OFFER;
  }

  // 4. Outreach (cold emails, sourcing)
  const outreachPatterns = [
    /came across your profile/i,
    /impressed by your background/i,
    /reaching out/i,
    /exploring new opportunities/i,
    /open to a chat/i,
  ];
  if (outreachPatterns.some(p => p.test(text))) {
    return EmailIntent.OUTREACH;
  }

  return EmailIntent.GENERIC;
}
