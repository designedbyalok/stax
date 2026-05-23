const QUOTES = [
  {
    text: "I was applying to ten jobs a day and losing my mind in spreadsheets. Stax is the first thing that's let me actually <em>see</em> my search.",
    name: "Lina K.",
    role: "Software engineer · 134 cards",
    color: "#c25a2e",
    initial: "L",
  },
  {
    text: "I keep a list of roles I'm passively watching. Stax makes it feel like a <em>quiet workshop</em> — open it once a week, never feel behind.",
    name: "Marcus P.",
    role: "Senior PM · 22 cards",
    color: "#4a6b3f",
    initial: "M",
  },
  {
    text: "Switching careers means hundreds of small notes per role. The card-as-workspace finally fits how I actually think about <em>each company</em>.",
    name: "Priya R.",
    role: "UX, career switcher · 48 cards",
    color: "#6a4a8c",
    initial: "P",
  },
  {
    text: "Hundred-plus applications, three months out from graduation. The Monday digest is the only thing keeping me from <em>ghosting myself</em>.",
    name: "Devon T.",
    role: "New grad · 217 cards",
    color: "#5c8eb1",
    initial: "D",
  },
];

export function Quotes() {
  return (
    <div className="section" id="quotes">
      <div className="container">
        <div className="reveal">
          <div className="section-eyebrow">// in the wild</div>
          <h2 className="section-title">
            Built for the way real <em>job searches feel.</em>
          </h2>
        </div>

        <div className="quotes reveal-stagger">
          {QUOTES.map((q, i) => (
            <div key={i} className="quote">
              <p
                className="quote-text"
                dangerouslySetInnerHTML={{ __html: q.text }}
              />
              <div className="quote-author">
                <div className="quote-avatar" style={{ background: q.color }}>
                  {q.initial}
                </div>
                <div>
                  <div className="quote-name">{q.name}</div>
                  <div className="quote-role">{q.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
