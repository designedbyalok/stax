export function CTA() {
  return (
    <div className="cta reveal" id="cta">
      <div className="cta-glow" />
      <div className="cta-eyebrow">{"// closed beta · spring 2026"}</div>
      <h2 className="cta-title">
        Every job, <em className="italic">in its place.</em>
      </h2>
      <p className="cta-sub">
        Join the beta. We&apos;ll send you an invite when we open the next batch — no
        spam, no marketing, just one email.
      </p>
      <form className="email-pill" action="/signup" method="get">
        <label htmlFor="cta-email" className="sr-only">
          Email address
        </label>
        <input
          id="cta-email"
          type="email"
          name="email"
          placeholder="you@where-you-are.com"
        />
        <button type="submit">Request invite →</button>
      </form>
    </div>
  );
}
