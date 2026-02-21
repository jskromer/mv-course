import { useState } from "react";

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
  indigo: "#4f46e5", indigoDim: "#e0e7ff",
};

function P({ children, style }) {
  return <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14.5, color: C.textSoft, lineHeight: 1.85, margin: "14px 0 0", ...style }}>{children}</p>;
}
function Em({ children }) {
  return <em style={{ color: C.blue, fontStyle: "normal", fontWeight: 600 }}>{children}</em>;
}
function Q({ children, attr }) {
  return (
    <blockquote style={{ borderLeft: `3px solid ${C.amber}`, margin: "24px 0", padding: "12px 24px", background: C.amberDim, borderRadius: "0 6px 6px 0" }}>
      <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 16, fontStyle: "italic", color: C.text, lineHeight: 1.7 }}>{children}</div>
      {attr && <div style={{ fontSize: 12, color: C.amber, marginTop: 8, fontFamily: "'IBM Plex Sans'" }}>— {attr}</div>}
    </blockquote>
  );
}


const LAYERS = [
  {
    num: 1, title: "Orientation", subtitle: "Get the Ground Under Them",
    color: C.green, bg: C.greenDim, icon: "🌱",
    goal: "Students learn why uncertainty matters before learning what it is.",
    approach: [
      "Begin with real failures: DR baselines gone wrong, mispriced guarantees, wrong counterfactuals creating mistrust.",
      "Use simple graphics showing: observed performance → the counterfactual → the gap between them.",
      "Introduce uncertainty not as \"error bars\" but as the problem of agreeing on the world we think we're modeling.",
    ],
    keyMessage: "Uncertainty is not a nuisance. It is the very substance of the counterfactual.",
    example: { label: "Fire Station Analogy", text: "A fire station's energy use during a demand response event. Did they actually reduce consumption? The counterfactual — what they would have used — is never observed. The gap between what happened and what would have happened is where all M&V lives." },
  },
  {
    num: 2, title: "The Three Uncertainties", subtitle: "Give Them Language",
    color: C.blue, bg: C.blueDim, icon: "🏷️",
    goal: "Students distinguish epistemic, aleatory, and ontological uncertainty.",
    approach: [
      "Epistemic — what we don't know but could learn. A fire station baseline with only 3 months of data. Fixable with more data.",
      "Aleatory — irreducible randomness. Weather variation year to year. You can't eliminate it, only characterize it.",
      "Ontological — the world changed. Adding EV chargers to a building breaks the baseline entirely. The entity you modeled no longer exists.",
    ],
    keyMessage: "If you cannot name the uncertainty, you cannot manage it.",
    threeCards: [
      { label: "Epistemic", icon: "📚", desc: "Reducible. More data, better instruments, longer baselines.", color: C.green, example: "Fire station baseline → collect more months" },
      { label: "Aleatory", icon: "🎲", desc: "Irreducible randomness. Characterize it; don't pretend to eliminate it.", color: C.blue, example: "Weather variation → probability distributions" },
      { label: "Ontological", icon: "🌊", desc: "The world changed. The thing you modeled is gone.", color: C.red, example: "EV chargers added → baseline is broken" },
    ],
  },
  {
    num: 3, title: "Entropy", subtitle: "Introduce Structure, Not Math",
    color: C.violet, bg: C.violetDim, icon: "📐",
    goal: "Students understand systems as having state spaces and dispersion.",
    approach: [
      "Show entropy visually: tight distribution = low entropy, wide and messy = high entropy.",
      "Link entropy to counterfactual compressibility: low entropy → simple baseline. High entropy → baseline becomes a negotiation.",
      "Buildings with predictable schedules and weather-driven loads have low entropy. Mixed-use, multi-tenant, occupancy-driven buildings have high entropy.",
    ],
    keyMessage: "Entropy tells you how much of the world your model must compress.",
    example: { label: "Two Buildings", text: "A single-tenant warehouse with electric heating: tight scatter, low entropy, simple 3PH model works beautifully. A university campus with labs, dining halls, and event spaces: wide scatter, high entropy — the baseline becomes a negotiation, not a calculation." },
  },
  {
    num: 4, title: "Ontology + Ontological Events", subtitle: "The Breakthrough Layer",
    color: C.orange, bg: "#fff7ed", icon: "⚡",
    goal: "Students understand that the world they model can change, and that this is the hardest uncertainty.",
    approach: [
      "Use a timeline of energy system evolution: stable grid → demand response → batteries → AI controls.",
      "Show how baselines break when the ontology changes.",
      "Teach students to detect ontological events: control changes, new tariffs, new EVs, new interventions.",
    ],
    keyMessage: "Uncertainty is dominated by how much the world itself can change.",
    timeline: [
      { era: "Pre-2010", label: "Stable Grid", desc: "Fixed rates, predictable loads, static baselines" },
      { era: "2010–2018", label: "DR & Renewables", desc: "Time-varying rates, curtailment, solar variability" },
      { era: "2018–2024", label: "Electrification", desc: "EVs, heat pumps, battery storage change load shapes" },
      { era: "2024+", label: "AI & Autonomy", desc: "Predictive controls, GEBs, continuous optimization" },
    ],
  },
  {
    num: 5, title: "Counterfactual Design", subtitle: "From Analysis → Agency",
    color: C.teal, bg: "#f0fdfa", icon: "🔧",
    goal: "Students become designers of counterfactuals, not consumers.",
    approach: [
      "Teach counterfactuals as contracts and governance tools, not statistical tricks.",
      "Introduce preregistration: what model, what variables, what boundaries, what protections against ontological drift.",
      "Have students design counterfactuals for: DR, efficiency, storage, electrification.",
    ],
    keyMessage: "A counterfactual is a design. It succeeds when stakeholders trust it.",
    checklist: [
      "Model form specified and justified",
      "Independent variables identified with data sources",
      "Boundary conditions defined (what's in, what's out)",
      "Ontological event detection protocol",
      "Uncertainty quantification method",
      "Stakeholder agreement on all of the above",
    ],
  },
  {
    num: 6, title: "Ethics, Trust, and Communication", subtitle: "Communication Is Love",
    color: C.amber, bg: C.amberDim, icon: "💛",
    goal: "Students grasp that uncertainty management is ethical responsibility and relationship-building.",
    approach: [
      "Communication is love. Designing counterfactuals is an ethical act of care.",
      "Teach how to communicate: what is known, what is unknown, what might change, and how uncertainty will be governed.",
      "Show how uncertainty frameworks support equity, fairness in settlement, transparency in carbon markets, community trust.",
    ],
    keyMessage: "Uncertainty is not removed. It is shared, understood, and governed.",
    principles: [
      { label: "Equity", desc: "Uncertainty should not fall disproportionately on the party with less power." },
      { label: "Transparency", desc: "All assumptions, limitations, and risks should be visible to all stakeholders." },
      { label: "Governance", desc: "There should be a pre-agreed process for handling ontological events and model failures." },
      { label: "Trust", desc: "The counterfactual succeeds when both parties would defend it to a third." },
    ],
  },
];

function LayerCard({ layer, expanded, onToggle }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${expanded ? layer.color : C.border}`, borderRadius: 8, marginBottom: 12, transition: "border-color 0.2s", overflow: "hidden" }}>
      <button onClick={onToggle} style={{
        width: "100%", background: expanded ? layer.bg : "transparent", border: "none",
        padding: "18px 22px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, textAlign: "left",
      }}>
        <span style={{ fontSize: 24 }}>{layer.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: layer.color, fontWeight: 700 }}>LAYER {layer.num}</span>
            <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 16, fontWeight: 700, color: C.text }}>{layer.title}</span>
          </div>
          <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: C.textDim, marginTop: 2 }}>{layer.subtitle}</div>
        </div>
        <span style={{ fontSize: 18, color: C.textDim, transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
      </button>

      {expanded && (
        <div style={{ padding: "0 22px 22px" }}>
          <div style={{ background: `${layer.color}10`, borderRadius: 6, padding: "10px 14px", marginBottom: 16 }}>
            <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, fontWeight: 700, color: layer.color, textTransform: "uppercase", letterSpacing: 0.5 }}>Goal</div>
            <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, color: C.text, marginTop: 4, lineHeight: 1.6 }}>{layer.goal}</div>
          </div>

          <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Teaching approach</div>
          {layer.approach.map((a, i) => (
            <div key={i} style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, color: C.textSoft, lineHeight: 1.7, padding: "6px 0 6px 16px", borderLeft: `2px solid ${layer.color}30`, marginBottom: 6 }}>{a}</div>
          ))}

          {/* Three uncertainty cards */}
          {layer.threeCards && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, margin: "16px 0" }}>
              {layer.threeCards.map((c, i) => (
                <div key={i} style={{ background: `${c.color}08`, border: `1px solid ${c.color}25`, borderRadius: 6, padding: "12px 14px" }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{c.icon}</div>
                  <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 700, color: c.color }}>{c.label}</div>
                  <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: C.textSoft, marginTop: 4, lineHeight: 1.5 }}>{c.desc}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10, color: C.textDim, marginTop: 6, fontStyle: "italic" }}>{c.example}</div>
                </div>
              ))}
            </div>
          )}

          {/* Timeline */}
          {layer.timeline && (
            <div style={{ margin: "16px 0", position: "relative", paddingLeft: 20 }}>
              <div style={{ position: "absolute", left: 5, top: 6, bottom: 6, width: 2, background: `${layer.color}30` }} />
              {layer.timeline.map((t, i) => (
                <div key={i} style={{ position: "relative", paddingLeft: 20, paddingBottom: 14 }}>
                  <div style={{ position: "absolute", left: -18, top: 6, width: 10, height: 10, borderRadius: "50%", background: layer.color }} />
                  <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10, color: layer.color, fontWeight: 700 }}>{t.era}</div>
                  <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 600, color: C.text }}>{t.label}</div>
                  <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: C.textDim, lineHeight: 1.5 }}>{t.desc}</div>
                </div>
              ))}
            </div>
          )}

          {/* Checklist */}
          {layer.checklist && (
            <div style={{ background: C.surfaceRaised, borderRadius: 6, padding: "12px 16px", margin: "16px 0" }}>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, fontWeight: 700, color: C.teal, marginBottom: 8 }}>PREREGISTRATION CHECKLIST</div>
              {layer.checklist.map((c, i) => (
                <div key={i} style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: C.textSoft, padding: "4px 0", display: "flex", gap: 8 }}>
                  <span style={{ color: C.teal }}>☐</span> {c}
                </div>
              ))}
            </div>
          )}

          {/* Principles */}
          {layer.principles && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "16px 0" }}>
              {layer.principles.map((p, i) => (
                <div key={i} style={{ background: C.amberDim, border: `1px solid ${C.amber}25`, borderRadius: 6, padding: "10px 14px" }}>
                  <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, fontWeight: 700, color: C.amber }}>{p.label}</div>
                  <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: C.textSoft, marginTop: 4, lineHeight: 1.5 }}>{p.desc}</div>
                </div>
              ))}
            </div>
          )}

          {/* Example box */}
          {layer.example && (
            <div style={{ background: C.surfaceRaised, borderRadius: 6, padding: "12px 16px", margin: "16px 0", borderLeft: `3px solid ${layer.color}` }}>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, fontWeight: 700, color: layer.color, marginBottom: 4 }}>{layer.example.label}</div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: C.textSoft, lineHeight: 1.6 }}>{layer.example.text}</div>
            </div>
          )}

          {/* Key message */}
          <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", borderRadius: 6, padding: "14px 18px", marginTop: 16 }}>
            <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.6, fontStyle: "italic" }}>"{layer.keyMessage}"</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UncertaintyPedagogy({ onBack }) {
  const [expanded, setExpanded] = useState(0);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1a2332 0%, #2d3748 100%)", padding: "48px 32px 40px", borderBottom: `3px solid ${C.teal}` }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          {onBack && <button onClick={onBack} style={{ background: "none", border: "none", color: "#8494a7", fontSize: 12, fontFamily: "'IBM Plex Sans'", cursor: "pointer", marginBottom: 16, padding: 0 }}>← Back to course</button>}
          <div style={{ fontSize: 10, letterSpacing: 4, color: C.teal, fontWeight: 600, textTransform: "uppercase", fontFamily: "'IBM Plex Mono'" }}>Pedagogy Framework</div>
          <h1 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 32, fontWeight: 700, color: "#fff", margin: "10px 0 0", lineHeight: 1.25 }}>The Uncertainty Guide</h1>
          <p style={{ fontFamily: "'IBM Plex Sans'", fontSize: 15, color: "#8494a7", margin: "12px 0 0", lineHeight: 1.7 }}>A 6-layer pedagogy for M&V and counterfactual design.</p>
        </div>
      </div>

      {/* Content */}
      <article style={{ maxWidth: 780, margin: "0 auto", padding: "32px 32px 80px" }}>

        <P style={{ fontSize: 15 }}>This pedagogy takes students from surface-level understanding → to structural thinking → to design agency → to ethical practice → to emergent systems awareness. It forms a complete curriculum arc for uncertainty in measurement and verification.</P>

        <Q>The goal: transform students from asking "What's the right baseline?" to asking "How does this system behave, and how do we design a fair, transparent counterfactual that governs uncertainty for all stakeholders?"</Q>

        {/* Arc visual */}
        <div style={{ display: "flex", gap: 4, margin: "24px 0 8px", alignItems: "flex-end" }}>
          {LAYERS.map((l, i) => (
            <div key={i} style={{ flex: 1, height: 28 + i * 12, background: `${l.color}20`, border: `1px solid ${l.color}40`, borderRadius: "4px 4px 0 0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              onClick={() => setExpanded(i)}>
              <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 9, fontWeight: 700, color: l.color }}>{l.num}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
          {LAYERS.map((l, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", fontFamily: "'IBM Plex Sans'", fontSize: 8.5, color: C.textDim, lineHeight: 1.3, padding: "2px 0" }}>{l.subtitle}</div>
          ))}
        </div>

        {/* Layers */}
        {LAYERS.map((layer, i) => (
          <LayerCard key={i} layer={layer} expanded={expanded === i} onToggle={() => setExpanded(expanded === i ? -1 : i)} />
        ))}

        {/* Pedagogical arc summary */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "24px 22px", margin: "28px 0" }}>
          <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>The Pedagogical Arc</div>
          {[
            { phase: "1", label: "Make them curious", desc: "Why uncertainty? Why counterfactuals? Why care?", color: C.green },
            { phase: "2", label: "Give them vocabulary", desc: "The three uncertainties + entropy.", color: C.blue },
            { phase: "3", label: "Give them structure", desc: "Ontology, ontological events, system evolution.", color: C.violet },
            { phase: "4", label: "Give them agency", desc: "Let them design counterfactuals.", color: C.teal },
            { phase: "5", label: "Give them responsibility", desc: "Ethical communication + governance.", color: C.amber },
            { phase: "6", label: "Give them purpose", desc: "Their work contributes to shared order in a chaotic, evolving system.", color: C.red },
          ].map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < 5 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${p.color}15`, border: `1.5px solid ${p.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono'", fontSize: 11, fontWeight: 700, color: p.color, flexShrink: 0 }}>{p.phase}</div>
              <div>
                <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 600, color: C.text }}>{p.label}</span>
                <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: C.textDim, marginLeft: 8 }}>{p.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Transformation */}
        <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", borderRadius: 8, padding: "28px 28px", margin: "24px 0 0", color: "#fff" }}>
          <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: C.teal, textTransform: "uppercase", marginBottom: 12 }}>The Transformation</div>
          <P style={{ color: "#94a3b8", marginTop: 0 }}>This pedagogy helps students become:</P>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
            {[
              "Interpreters of complexity",
              "Designers of governance structures",
              "Communicators of uncertainty",
              "Agents of stability in a shifting energy ontology",
            ].map((r, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "10px 14px", fontFamily: "'IBM Plex Sans'", fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{r}</div>
            ))}
          </div>
          <P style={{ color: "#cbd5e1", marginTop: 16, fontSize: 14, fontWeight: 600 }}>Exactly the evolution M&V requires for the next 30 years.</P>
        </div>

        {/* Video */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>Related Reading</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <a href="https://en.wikipedia.org/wiki/Uncertainty_quantification" target="_blank" rel="noopener noreferrer" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "14px 16px", textDecoration: "none", color: C.text }}>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 700 }}>Uncertainty Quantification</div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: C.teal, marginTop: 2 }}>Wikipedia</div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: C.textDim, marginTop: 6, lineHeight: 1.5 }}>Epistemic vs. aleatory uncertainty in scientific modeling.</div>
            </a>
            <a href="https://calteches.library.caltech.edu/51/2/CargoCult.htm" target="_blank" rel="noopener noreferrer" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "14px 16px", textDecoration: "none", color: C.text }}>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 700 }}>Cargo Cult Science</div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: C.amber, marginTop: 2 }}>Richard Feynman, 1974</div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: C.textDim, marginTop: 6, lineHeight: 1.5 }}>On scientific integrity and the discipline of not fooling yourself.</div>
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
