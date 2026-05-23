import Link from "next/link";

export function LandingNav() {
  return (
    <div className="nav-wrap">
      <nav className="nav glass-dark">
        <div className="nav-logo">
          <span className="nav-logo-mark">
            <span />
            <span />
            <span />
          </span>
          Stax
        </div>
        <div className="nav-links">
          <a className="nav-link" href="#product">The board</a>
          <a className="nav-link" href="#features">Features</a>
          <a className="nav-link" href="#how">How it works</a>
          <a className="nav-link" href="#faq">FAQ</a>
        </div>
        <span className="nav-spacer" />
        <Link className="nav-signin" href="/login">Sign in</Link>
        <Link className="nav-cta" href="/signup">Start tracking</Link>
      </nav>
    </div>
  );
}
