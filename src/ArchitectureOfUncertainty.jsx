const C = {
  bg: "#f8f9fb", surface: "#ffffff", surfaceRaised: "#f0f2f5",
  border: "#d8dde6", borderHover: "#b0b8c8",
  text: "#1a2332", textSoft: "#4a5568", textDim: "#8494a7", white: "#111827",
  blue: "#2563eb", blueDim: "#dbeafe",
  green: "#16a34a", greenDim: "#dcfce7",
  red: "#dc2626", redDim: "#fef2f2",
  amber: "#b45309", amberDim: "#fef3c7",
  orange: "#ea580c", teal: "#0d9488",
  violet: "#7c3aed", violetDim: "#ede9fe",
};

function Q({ children, attr }) {
  return (
    <blockquote style={{ borderLeft: `3px solid ${C.amber}`, margin: "24px 0", padding: "12px 24px", background: C.amberDim, borderRadius: "0 6px 6px 0" }}>
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 16, fontStyle: "italic", color: C.text, lineHeight: 1.7 }}>{children}</div>
      {attr && <div style={{ fontSize: 12, color: C.amber, marginTop: 8, fontFamily: "'IBM Plex Sans'" }}>— {attr}</div>}
    </blockquote>
  );
}

function P({ children, style }) {
  return <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14.5, color: C.textSoft, lineHeight: 1.85, margin: "14px 0 0", ...style }}>{children}</p>;
}

function H2({ children }) {
  return <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 22, fontWeight: 700, color: C.white, margin: "40px 0 8px", letterSpacing: -0.3 }}>{children}</h2>;
}

function H3({ children }) {
  return <h3 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 16, fontWeight: 700, color: C.text, margin: "28px 0 6px" }}>{children}</h3>;
}

function Em({ children }) {
  return <em style={{ color: C.blue, fontStyle: "normal", fontWeight: 600 }}>{children}</em>;
}

function MatrixCell({ label, desc, color, icon }) {
  return (
    <div style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 8, padding: "16px 18px" }}>
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 700, color }}>{label}</div>
      <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: C.textSoft, marginTop: 6, lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

function HierarchyBar({ level, label, desc, color, width }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
      <div style={{ width: `${width}%`, minWidth: 80, height: 32, background: `${color}20`, border: `1px solid ${color}50`, borderRadius: 4, display: "flex", alignItems: "center", padding: "0 12px" }}>
        <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10, fontWeight: 700, color, textTransform: "uppercase" }}>{level}</span>
      </div>
      <div>
        <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, fontWeight: 600, color: C.text }}>{label}</div>
        <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: C.textDim, lineHeight: 1.4 }}>{desc}</div>
      </div>
    </div>
  );
}

export default function ArchitectureOfUncertainty({ onBack }) {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1a2332 0%, #2d3748 100%)", padding: "48px 32px 40px", borderBottom: `3px solid ${C.amber}` }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          {onBack && <button onClick={onBack} style={{ background: "none", border: "none", color: "#8494a7", fontSize: 12, fontFamily: "'IBM Plex Sans'", cursor: "pointer", marginBottom: 16, padding: 0 }}>← Back to course</button>}
          <div style={{ fontSize: 10, letterSpacing: 4, color: C.amber, fontWeight: 600, textTransform: "uppercase", fontFamily: "'IBM Plex Mono'" }}>Explainer</div>
          <h1 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 32, fontWeight: 700, color: "#fff", margin: "10px 0 0", lineHeight: 1.25 }}>The Architecture of Uncertainty</h1>
          <p style={{ fontFamily: "'IBM Plex Sans'", fontSize: 15, color: "#8494a7", margin: "12px 0 0", lineHeight: 1.7 }}>What we know, what we don't, and what ain't so.</p>
        </div>
      </div>

      {/* Content */}
      <article style={{ maxWidth: 780, margin: "0 auto", padding: "32px 32px 80px" }}>

        <H2>Two Quotes That Frame Everything</H2>

        <P>In February 2002, Secretary of Defense Donald Rumsfeld offered what many dismissed as verbal gymnastics:</P>

        <Q attr="Donald Rumsfeld, DoD Press Briefing, Feb 12 2002">There are known knowns — things we know we know. We also know there are known unknowns — things we know we don't know. But there are also unknown unknowns — the ones we don't know we don't know.</Q>

        <P>The press laughed. Philosophers recognized something sharper: a practical epistemology — a theory of knowledge states — delivered in plain language.</P>

        <div style={{ margin: "16px 0", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden" }}>
          <a href="https://www.c-span.org/clip/news-conference/donald-rumsfeld-there-are-known-unknowns/5087522" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", textDecoration: "none", color: C.text }}>
            <div style={{ width: 40, height: 40, borderRadius: 6, background: "#1a2332", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderLeft: "14px solid #fff", marginLeft: 3 }} />
            </div>
            <div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 600 }}>Watch: Rumsfeld's "Known Unknowns" Press Briefing</div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: C.textDim }}>C-SPAN · Feb 12, 2002 DoD Briefing</div>
            </div>
          </a>
        </div>

        <P>But Rumsfeld's framework has a blind spot. It assumes our "known knowns" are actually true. Enter a quote often attributed to Mark Twain (though its true origin is uncertain — fitting, given the subject):</P>

        <Q attr="Attributed to Mark Twain">It ain't what you don't know that gets you into trouble. It's what you know for sure that just ain't so.</Q>

        <P>Together, these quotes sketch a map of how knowledge fails us. But they treat knowledge as a purely cognitive matter — as if we're all disinterested seekers of truth limited only by the boundaries of our minds. For the complete picture, add Upton Sinclair:</P>

        <Q attr="Upton Sinclair">It is difficult to get a man to understand something when his salary depends upon his not understanding it.</Q>

        <P>Now we have the complete picture: not just the architecture of uncertainty, but the <Em>political economy of ignorance</Em>.</P>

        {/* ── THE MATRIX ─────────────────────────────────── */}
        <H2>The Complete Matrix</H2>

        <P>Rumsfeld gave us three quadrants. Twain's addition completes the fourth:</P>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "20px 0" }}>
          <MatrixCell icon="✅" label="Known Knowns" desc="The foundation of competent action. We know gravity pulls downward; we design accordingly." color={C.green} />
          <MatrixCell icon="❓" label="Known Unknowns" desc="Manageable. We know we don't know tomorrow's weather, so we build in margins, buy insurance, hedge bets. The domain of quantifiable risk." color={C.blue} />
          <MatrixCell icon="💀" label="Unknown Unknowns" desc="Humbling. Threats we haven't imagined. Taleb calls these 'Black Swans' — events that blindside us because they lay outside our mental models." color={C.violet} />
          <MatrixCell icon="🔥" label="False Certainties" desc="Catastrophic. They feel like strength. They present as competence. We don't hedge against things we're 'sure' about — so when they're wrong, we're fully exposed." color={C.red} />
        </div>

        <P>Each quadrant carries different risks, but the bottom two are where the real danger lives. Unknown unknowns breed appropriate humility in thoughtful people. False certainties breed confident action in the wrong direction.</P>

        {/* ── EPISTEMOLOGY VS ONTOLOGY ────────────────────── */}
        <H2>Epistemology vs. Ontology: The Deeper Cut</H2>

        <P>These frameworks are <Em>epistemological</Em> — they concern states of knowledge. What do we know? How confident are we? Where are our blind spots?</P>

        <P>But there's a prior question that epistemology cannot answer on its own: <Em>What actually exists?</Em></P>

        <P>This is <Em>ontology</Em> — the study of being, of what is. And the distinction matters enormously.</P>

        <div style={{ background: C.blueDim, border: `1px solid ${C.blue}35`, borderRadius: 8, padding: "18px 22px", margin: "20px 0" }}>
          <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 700, color: C.blue, marginBottom: 8 }}>AN M&V EXAMPLE</div>
          <P style={{ marginTop: 0 }}>You're modeling building energy consumption. You've identified outdoor air temperature as the key driver. Your regression fits beautifully. R² = 0.94. You're confident.</P>
          <P><strong>Epistemologically</strong>, you have a "known known" — temperature drives consumption, and you can quantify it precisely.</P>
          <P><strong>Ontologically</strong>, a question lurks: What mechanisms <em>actually exist</em> that affect this building's energy use? Maybe occupancy patterns shifted. Maybe a control sequence changed. Maybe humidity matters more than you think.</P>
          <P style={{ color: C.blue, fontWeight: 600 }}>Epistemological confidence can blind us to ontological reality. Our models become maps we mistake for territory.</P>
        </div>

        <Q attr="George Box, 1976">All models are wrong, but some are useful.</Q>

        <P>The question is whether we remember the first clause while exploiting the second.</P>

        <div style={{ margin: "16px 0", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden" }}>
          <a href="https://fs.blog/all-models-are-wrong/" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", textDecoration: "none", color: C.text }}>
            <div style={{ width: 40, height: 40, borderRadius: 6, background: C.blueDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>📖</div>
            <div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 600 }}>Read: "All Models Are Wrong" — Understanding George Box's Insight</div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: C.textDim }}>Farnam Street · Deep dive into Box's epistemology</div>
            </div>
          </a>
        </div>

        {/* ── POLITICAL ECONOMY ───────────────────────────── */}
        <H2>The Political Economy of Ignorance</H2>

        <P>Rumsfeld and Twain frame ignorance as a cognitive problem. Sinclair reframes it as a <Em>structural</Em> one.</P>

        <P>This isn't about stupidity or even bias in the usual sense. It's about how <Em>incentive structures shape what questions get asked</Em>, what evidence gets weighted, and what conclusions feel "reasonable."</P>

        <P>The tobacco executive who genuinely can't see the link between smoking and cancer. The mortgage broker in 2006 who sincerely believes subprime loans are safe. The consultant whose methodology always seems to recommend more consulting.</P>

        <P>Sinclair's insight transforms our matrix. False certainties aren't just cognitive errors — they're often <Em>produced by systems that reward them</Em>. Unknown unknowns aren't just failures of imagination — they're often questions that nobody has an incentive to ask.</P>

        <div style={{ background: C.surfaceRaised, border: `1px solid ${C.border}`, borderRadius: 8, padding: "18px 22px", margin: "24px 0" }}>
          <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>Questions worth asking:</div>
          <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, color: C.textSoft, lineHeight: 2 }}>
            Who benefits if this conclusion is true?<br />
            Who funded this research?<br />
            What would happen to the analyst's career if they reached the opposite conclusion?<br />
            What questions are <em>not</em> being asked, and why?
          </div>
        </div>

        <Q attr="John Kenneth Galbraith">Faced with the choice between changing one's mind and proving that there is no need to do so, almost everyone gets busy on the proof.</Q>

        <P>When salary depends on the proof, expect the proof to be especially vigorous.</P>

        {/* ── HIERARCHY OF ERROR ──────────────────────────── */}
        <H2>The Hierarchy of Error</H2>

        <P>Not all failures of knowledge are equal:</P>

        <div style={{ margin: "20px 0" }}>
          <HierarchyBar level="Manageable" label="Known Unknowns" desc="We budget for uncertainty, run sensitivity analyses, maintain reserves." color={C.green} width={40} />
          <HierarchyBar level="Dangerous" label="Unknown Unknowns" desc="We can't defend against threats we haven't imagined. Scenario planning, red teams, and pre-mortems surface some." color={C.blue} width={60} />
          <HierarchyBar level="More dangerous" label="False Certainties" desc="They feel like strength. Admitting them requires acknowledging a failure of judgment, not just updating a belief." color={C.amber} width={80} />
          <HierarchyBar level="Most dangerous" label="Incentivized False Certainties" desc="They have institutional defenders. Backed by money, status, and career risk. They don't resist correction — they punish it." color={C.red} width={100} />
        </div>

        {/* ── PRACTICAL IMPLICATIONS ──────────────────────── */}
        <H2>Practical Implications</H2>

        <H3>For known unknowns</H3>
        <P>Quantify them. Use probability distributions, not point estimates. Communicate uncertainty explicitly. This is the domain of good statistical practice.</P>

        <H3>For unknown unknowns</H3>
        <P>Cultivate <Em>ontological humility</Em>. Regularly ask: what exists that my model doesn't capture? Seek disconfirming evidence. Invite outside perspectives that might see what you've missed.</P>

        <H3>For false certainties</H3>
        <P>Institutionalize devil's advocacy. Revisit foundational assumptions periodically — especially successful ones. Pay attention to anomalies rather than explaining them away. Create psychological safety for admitting "I was wrong."</P>

        <H3>For incentivized ignorance</H3>
        <P>Separate analysis from advocacy. Create independence for reviewers and auditors. Protect and reward dissent. Follow the money — and discount accordingly.</P>

        <Q attr="Karl Popper">Scientific progress comes not from confirming what we believe but from falsifying it — actively trying to prove ourselves wrong.</Q>

        <P>But Popper's framework assumes good faith — that we <em>want</em> to find the truth. Sinclair reminds us that's not always the case. Sometimes the system wants the false certainty to survive.</P>

        {/* ── CONCLUSION ──────────────────────────────────── */}
        <H2>The Virtue of Structured Doubt</H2>

        <P>Rumsfeld's taxonomy, completed by Twain's warning and grounded by Sinclair's realism, gives us a practical framework for intellectual humility — and institutional skepticism.</P>

        <P>The goal isn't to eliminate uncertainty — that's impossible — but to <Em>locate it accurately</Em>. And to recognize that some "certainties" are defended not because they're true but because they're profitable.</P>

        <Q attr="Richard Feynman, 1974 Caltech Commencement">The first principle is that you must not fool yourself — and you are the easiest person to fool.</Q>

        <P>To which Sinclair might add: <em>especially when you're being paid to be fooled.</em></P>

        <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", borderRadius: 8, padding: "24px 28px", margin: "32px 0 0", color: "#fff" }}>
          <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 15, fontWeight: 600, lineHeight: 1.7 }}>
            The architecture of uncertainty isn't a confession of weakness. It's the foundation of rigor. And in a world of motivated reasoning, it's an act of resistance.
          </div>
        </div>

        {/* ── FURTHER READING ────────────────────────────── */}
        <H2>Further Reading & Viewing</H2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          {[
            { title: "The Black Swan", author: "Nassim Nicholas Taleb (2007)", desc: "The definitive treatment of unknown unknowns and our blindness to improbable events.", url: "https://www.goodreads.com/book/show/242472.The_Black_Swan" },
            { title: "Cargo Cult Science", author: "Richard Feynman (1974)", desc: "Caltech commencement address on scientific integrity and self-deception.", url: "https://calteches.library.caltech.edu/51/2/CargoCult.htm" },
            { title: "The Unknown Known", author: "Errol Morris (2013 Documentary)", desc: "A probing documentary interview with Rumsfeld about certainty, language, and power.", url: "https://www.imdb.com/title/tt2390962/" },
            { title: "The Rumsfeld Matrix", author: "The Uncertainty Project", desc: "Interactive tool for categorizing knowledge states in decision-making.", url: "https://www.theuncertaintyproject.org/tools/rumsfeld-matrix" },
          ].map((r, i) => (
            <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "14px 16px", textDecoration: "none", color: C.text, transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.blue}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 700 }}>{r.title}</div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: C.amber, marginTop: 2 }}>{r.author}</div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: C.textDim, marginTop: 6, lineHeight: 1.5 }}>{r.desc}</div>
            </a>
          ))}
        </div>
      </article>
    </div>
  );
}
