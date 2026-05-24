import { ApiApplication } from "@/lib/api-client";

export type MatchResult = {
  confidence: number;
  autoAttach: boolean;
  candidates: Array<{ application: ApiApplication; score: number }>;
};

/**
 * Score-based matching pipeline for mapping emails to applications.
 */
export function matchEmailToApplication(
  subject: string,
  bodyText: string,
  senderEmail: string,
  applications: ApiApplication[]
): MatchResult {
  const text = `${subject}\n${bodyText}`.toLowerCase();
  
  // Extract domain from sender email (e.g. "hr@company.com" -> "company.com")
  const senderDomain = senderEmail.split("@")[1]?.toLowerCase();
  // Filter out common personal email domains
  const commonDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];
  const isCorporateDomain = senderDomain && !commonDomains.includes(senderDomain);

  const scored = applications.map((app) => {
    let score = 0;
    const company = app.companyName.toLowerCase();
    
    // 1. Direct link match (if the body contains a job posting URL that exactly matches)
    if (app.originalUrl && text.includes(app.originalUrl.toLowerCase())) {
      score += 100;
    }

    // 2. Domain match
    if (isCorporateDomain) {
      // If company name matches domain part (e.g. "Stripe" in "stripe.com")
      const domainWithoutTld = senderDomain.split(".")[0];
      if (company.includes(domainWithoutTld) || domainWithoutTld.includes(company.replace(/\s+/g, ""))) {
        score += 50;
      }
    }

    // 3. Subject / Body exact company match
    if (subject.toLowerCase().includes(company)) {
      score += 30;
    } else if (bodyText.toLowerCase().includes(company)) {
      score += 15;
    }

    // 4. Role title match
    const roleTokens = app.roleTitle.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    let matchedTokens = 0;
    for (const token of roleTokens) {
      if (subject.toLowerCase().includes(token)) matchedTokens++;
    }
    if (matchedTokens > 0) {
      score += (matchedTokens / roleTokens.length) * 20;
    }

    // 5. Recency boost (recently updated cards are more likely)
    const daysSinceUpdate = (Date.now() - new Date(app.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 7) score += 10;
    else if (daysSinceUpdate < 30) score += 5;

    return { application: app, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Filter out zero scores
  const candidates = scored.filter(c => c.score > 0);
  
  if (candidates.length === 0) {
    return { confidence: 0, autoAttach: false, candidates: [] };
  }

  const bestScore = candidates[0].score;
  const runnerUpScore = candidates.length > 1 ? candidates[1].score : 0;

  // Confidence is normalized (0 to 1) based on max possible score (~100+)
  const confidence = Math.min(bestScore / 100, 1);
  
  // Auto-attach if confidence is high AND it's significantly better than the runner-up
  const autoAttach = bestScore >= 50 && (bestScore - runnerUpScore > 20);

  return { confidence, autoAttach, candidates };
}
