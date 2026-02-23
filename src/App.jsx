import { useState, useEffect } from "react";

/* ───── Palette (warm cream, matching CFdesigns family) ───── */
const C = {
  bg: "#f5f0e8", surface: "#ebe5d9", card: "#ffffff",
  border: "#d4cbbf", white: "#1a1612", text: "#3d3529",
  textSoft: "#6b5f52", textDim: "#998d7e",
  copper: "#b5632e", copperDim: "rgba(181,99,46,0.08)",
  rose: "#c0392b", roseDim: "rgba(192,57,43,0.06)",
  blue: "#2c6fad", blueDim: "rgba(44,111,173,0.06)",
  amber: "#a67c28", amberDim: "rgba(166,124,40,0.08)",
  violet: "#7c5cbf", violetDim: "rgba(124,92,191,0.06)",
  green: "#2d7d46", greenDim: "rgba(45,125,70,0.08)",
};

/* ───── Routing ───── */
const ROUTES = {
  "": "home",
  "#/options": "options",
  "#/glossary": "glossary",
  "#/history": "history",
};

export default function App() {
  const getPage = () => ROUTES[window.location.hash] || "home";
  const [page, setPage] = useState(getPage());

  useEffect(() => {
    const handler = () => setPage(getPage());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = (p) => {
    const hash = Object.entries(ROUTES).find(([, v]) => v === p)?.[0] || "";
    if (hash) window.location.hash = hash; else history.pushState(null, "", window.location.pathname);
    setPage(p);
    window.scrollTo(0, 0);
  };

  const goHome = () => navigate("home");

  if (page === "options") return <OptionsTranslation onBack={goHome} />;
  if (page === "glossary") return <Glossary onBack={goHome} />;
  if (page === "history") return <History onBack={goHome} />;

  return <Landing onNavigate={navigate} />;
}

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
function Landing({ onNavigate }) {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'IBM Plex Sans', sans-serif", color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Hero */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "72px 32px 64px", background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)` }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: 5, color: C.amber, fontWeight: 600, textTransform: "uppercase", marginBottom: 20, fontFamily: "'IBM Plex Mono', monospace" }}>
            Reference Guide
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: C.white, margin: "0 0 20px", letterSpacing: -0.5, lineHeight: 1.2 }}>
            IPMVP Translation Guide
          </h1>
          <p style={{ fontSize: 16, color: C.textSoft, lineHeight: 1.75, maxWidth: 560, margin: "0 auto 16px" }}>
            If you already work with IPMVP terminology, this guide shows how Options A–D map to a designed framework built around three decisions every M&V professional actually faces.
          </p>
          <p style={{ fontSize: 13, color: C.textDim, marginTop: 24 }}>
            Looking for the course?
          </p>
          <a href="https://cfdesigns.vercel.app" style={{ textDecoration: "none" }}>
            <div style={{
              display: "inline-block", background: C.copper, color: "#fff", border: "none",
              borderRadius: 8, padding: "12px 32px", fontSize: 14, fontWeight: 600,
              cursor: "pointer", marginTop: 8, transition: "opacity 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = 0.85}
              onMouseLeave={e => e.currentTarget.style.opacity = 1}>
              Start the Counterfactual Designs Course →
            </div>
          </a>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 32px" }}>

        {/* What this site is */}
        <div style={{ background: C.amberDim, border: `1px solid ${C.amber}40`, borderRadius: 10, padding: "24px 32px", marginBottom: 40 }}>
          <p style={{ fontSize: 15, color: C.text, lineHeight: 1.7, margin: 0 }}>
            <strong>This is not the course.</strong> This is a reference for people who encounter IPMVP language in their work —
            in contracts, reports, or industry standards — and want to understand how those terms connect to the
            statistical and engineering concepts taught in the <a href="https://cfdesigns.vercel.app" style={{ color: C.copper, fontWeight: 600 }}>Counterfactual Designs</a> course.
          </p>
        </div>

        {/* Navigation cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 48 }}>
          {[
            {
              id: "options", color: C.blue,
              title: "Options → Three Dimensions",
              desc: "How Options A–D map to Boundary × Model Form × Duration. The same design space, different coordinates.",
            },
            {
              id: "glossary", color: C.green,
              title: "Terminology Glossary",
              desc: "IPMVP terms translated to plain language, with notes on how definitions have evolved since 1996.",
            },
            {
              id: "history", color: C.violet,
              title: "A Note on History",
              desc: "IPMVP terminology was arbitrated by committee, not designed. Why that matters for how you use it.",
            },
          ].map(item => (
            <div key={item.id} onClick={() => onNavigate(item.id)} style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
              padding: "24px 24px", cursor: "pointer", transition: "border-color 0.2s",
              borderTop: `3px solid ${item.color}`,
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = item.color}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.borderTopColor = item.color; }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.white, marginBottom: 10, lineHeight: 1.3 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Quick Translation Table */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: C.copper, fontWeight: 600, textTransform: "uppercase", marginBottom: 16, fontFamily: "'IBM Plex Mono', monospace" }}>
            Quick Reference
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.white, margin: "0 0 8px" }}>
            "I know IPMVP. Where do I go?"
          </h2>
          <p style={{ fontSize: 14, color: C.textSoft, lineHeight: 1.7, marginBottom: 20 }}>
            Each row shows what you'd find in IPMVP language and where to learn the underlying skill in the course.
          </p>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
            {[
              { ipmvp: "Option C whole-facility analysis", course: "Counterfactual Workbench", link: "https://cfdesigns.vercel.app/#/workbench", desc: "Fit change-point models to whole-building data, validate, calculate savings" },
              { ipmvp: "ASHRAE Guideline 14 validation", course: "Workbench → Validate step", link: "https://cfdesigns.vercel.app/#/workbench", desc: "CV(RMSE) ≤ 15%, NMBE ± 5% — framed as engineering thresholds, not compliance" },
              { ipmvp: "Regression-based models", course: "Statistical Foundations", link: "https://cfdesigns.vercel.app/#/fundamentals", desc: "Linear models, residuals, goodness of fit from first principles" },
              { ipmvp: "Baseline period selection", course: "Duration Explainer", link: "https://cfdesigns.vercel.app/#/duration", desc: "Coverage vs. relevance tradeoffs in choosing how much past to model" },
              { ipmvp: "Measurement boundary", course: "Boundary Explainer", link: "https://cfdesigns.vercel.app/#/boundary", desc: "Where you draw the line determines what the model sees" },
              { ipmvp: "Non-routine adjustments", course: "NRA Case Studies", link: "https://cfdesigns.vercel.app/#/cases", desc: "Server room addition and chiller failure — two real NRA scenarios" },
              { ipmvp: "Option D simulation", course: "Simulation Explainer", link: "https://cfdesigns.vercel.app/#/simulation", desc: "Physics-based counterfactuals using EnergyPlus, calibration, Bayesian methods" },
              { ipmvp: "Savings uncertainty", course: "Workbench → Savings step", link: "https://cfdesigns.vercel.app/#/workbench", desc: "Fractional savings uncertainty at 95% confidence" },
            ].map((row, i) => (
              <a key={i} href={row.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 2fr",
                  padding: "14px 20px", borderBottom: i < 7 ? `1px solid ${C.border}` : "none",
                  background: i % 2 === 0 ? C.card : C.bg,
                  cursor: "pointer", transition: "background 0.15s",
                  alignItems: "center",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = C.copperDim}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? C.card : C.bg}>
                  <div style={{ fontSize: 13, color: C.textSoft, fontStyle: "italic" }}>{row.ipmvp}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.copper }}>→ {row.course}</div>
                  <div style={{ fontSize: 12, color: C.textDim }}>{row.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Companion links */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 40 }}>
          <a href="https://cfdesigns.vercel.app" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 24px", cursor: "pointer", transition: "border-color 0.2s", height: "100%" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.copper}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              <div style={{ fontSize: 10, color: C.copper, fontWeight: 600, letterSpacing: 2, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>The Course</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.white }}>Counterfactual Designs</div>
              <div style={{ fontSize: 12, color: C.textSoft, marginTop: 4 }}>Statistical foundations, the workbench, and the three-dimension framework</div>
            </div>
          </a>
          <a href="https://bayesian-mv.vercel.app" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 24px", cursor: "pointer", transition: "border-color 0.2s", height: "100%" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.violet}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              <div style={{ fontSize: 10, color: C.violet, fontWeight: 600, letterSpacing: 2, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>Companion</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.white }}>Bayesian M&V Module</div>
              <div style={{ fontSize: 12, color: C.textSoft, marginTop: 4 }}>Same data, different inference — posterior distributions instead of point estimates</div>
            </div>
          </a>
        </div>

        {/* Terminology note */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "24px 28px", marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.textDim, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
            A Note on Terminology
          </div>
          <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.7, margin: 0 }}>
            IPMVP terminology has evolved significantly since its inception as NEMVP in 1996. The Option definitions referenced on this site align with the public domain versions of IPMVP published before the Efficiency Valuation Organization (EVO) placed the document under copyright. For a detailed accounting of how each Option definition has changed across every major revision — from the 1996 NEMVP through the 2022 Core Concepts — see Appendix II of <em>The Role of the Measurement and Verification Professional</em> (Kromer, River Publishers, 2024). The current EVO-copyrighted version of IPMVP may differ from the definitions presented here.
          </p>
        </div>
      </div>

      {/* Author */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px 48px" }}>
        <a href="https://counterfactual-designs.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
          <div style={{ background: "linear-gradient(135deg, #2c2418 0%, #3d3529 100%)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.copper}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#d4a76a", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>From the Author</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#f5f0e8", marginBottom: 4 }}>counterfactual-designs.com</div>
              <div style={{ fontSize: 12, color: "#c4b8a8", lineHeight: 1.5 }}>Steve Kromer's practice — consulting, training, and publications.</div>
            </div>
            <div style={{ fontSize: 24, color: "#d4a76a", marginLeft: 24, flexShrink: 0 }}>→</div>
          </div>
        </a>
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "32px", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: C.textDim }}>
          © 2025 Steve Kromer · SKEE · Based on <em>The Role of the M&V Professional</em> (River Publishers, 2024)
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE WRAPPER (shared layout for sub-pages)
   ═══════════════════════════════════════════════════════════════ */
function PageWrapper({ children, onBack, title }) {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'IBM Plex Sans', sans-serif", color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ display: "flex", alignItems: "center", padding: "10px 24px", borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: C.copper, fontSize: 13, fontWeight: 600, fontFamily: "'IBM Plex Sans'", padding: 0 }}>← IPMVP Reference</button>
        <span style={{ color: C.border, margin: "0 12px" }}>|</span>
        <span style={{ fontSize: 12, color: C.textDim }}>{title}</span>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 32px" }}>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   OPTIONS A–D → THREE DIMENSIONS TRANSLATION
   ═══════════════════════════════════════════════════════════════ */
function OptionsTranslation({ onBack }) {
  const [expanded, setExpanded] = useState(null);

  const options = [
    {
      letter: "A", name: "Retrofit Isolation — Key Parameter Measurement",
      boundary: "Single system or equipment", model: "Engineering calculations (stipulated values)", duration: "Short-term or spot measurements",
      threeD: "Narrow boundary · Physical/engineering model · Typically short duration",
      cfNote: "You measure the key parameter (e.g., motor kW) and calculate savings using stipulated values for operating hours. The counterfactual is an engineering estimate, not a statistical model.",
      when: "When you can isolate and directly measure the retrofit's effect — a motor swap, a lighting upgrade, a VFD installation.",
      courseLink: null,
      courseLinkLabel: null,
    },
    {
      letter: "B", name: "Retrofit Isolation — All Parameter Measurement",
      boundary: "Single system or equipment", model: "Statistical regression or engineering model", duration: "Continuous measurement through baseline and reporting periods",
      threeD: "Narrow boundary · Statistical or physical model · Full project duration",
      cfNote: "Like Option A, but you measure all relevant parameters continuously. This enables regression modeling at the system level — a statistical counterfactual scoped to a single system.",
      when: "When system-level metering is available and you need to account for varying operating conditions (weather, production, etc.).",
      courseLink: "https://cfdesigns.vercel.app/#/workbench",
      courseLinkLabel: "The workbench teaches the same regression skills — just at whole-building scale",
    },
    {
      letter: "C", name: "Whole Facility",
      boundary: "Whole building (utility meter or sub-meter)", model: "Statistical regression (change-point models, TOWT, etc.)", duration: "Continuous metering, typically 12+ months baseline",
      threeD: "Wide boundary · Statistical model · Full project duration",
      cfNote: "This is the workbench scenario. You model whole-building energy as a function of weather (and possibly other drivers), then predict what energy use would have been post-retrofit. The difference is savings.",
      when: "When multiple measures are installed simultaneously, when system-level isolation isn't practical, or when the whole-building approach captures interactive effects.",
      courseLink: "https://cfdesigns.vercel.app/#/workbench",
      courseLinkLabel: "This is exactly what the Counterfactual Workbench teaches",
    },
    {
      letter: "D", name: "Calibrated Simulation",
      boundary: "Whole building or major system", model: "Physics-based simulation (EnergyPlus, eQUEST, etc.)", duration: "Calibrated against measured data",
      threeD: "Wide boundary · Physical/simulation model · Calibrated to measured duration",
      cfNote: "Instead of a statistical regression, the counterfactual is a physics-based simulation calibrated to match actual building performance. Useful when no baseline period exists, or when you need to model what-if scenarios that statistics can't support.",
      when: "New construction (no pre-retrofit data), deep retrofits where the building changes fundamentally, or complex interactive systems.",
      courseLink: "https://cfdesigns.vercel.app/#/simulation",
      courseLinkLabel: "See the Simulation Explainer for physics-based counterfactuals",
    },
  ];

  return (
    <PageWrapper onBack={onBack} title="Options A–D → Three Dimensions">
      <h1 style={{ fontSize: 28, fontWeight: 700, color: C.white, margin: "0 0 12px" }}>
        Options A–D → Three Dimensions
      </h1>
      <p style={{ fontSize: 15, color: C.textSoft, lineHeight: 1.7, marginBottom: 12 }}>
        IPMVP's four Options are a classification system developed by committee over decades of negotiation.
        They work — but they're categories, not a design tool. They tell you which bin your analysis falls into,
        not how to construct it.
      </p>
      <p style={{ fontSize: 15, color: C.textSoft, lineHeight: 1.7, marginBottom: 32 }}>
        The three-dimension framework covers the same design space using three independent decisions every
        M&V professional actually makes: <strong style={{ color: C.white }}>Boundary</strong> (what does the
        meter capture?), <strong style={{ color: C.white }}>Model Form</strong> (how do you construct the
        counterfactual?), and <strong style={{ color: C.white }}>Duration</strong> (how much data do you
        need?). The Options are locations in this three-dimensional space.
      </p>

      {/* Visual mapping */}
      <div style={{ background: "linear-gradient(135deg, #2c2418 0%, #3d3529 100%)", borderRadius: 10, padding: "28px 28px 20px", marginBottom: 32, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#d4a76a", fontWeight: 600, textTransform: "uppercase", marginBottom: 16, fontFamily: "'IBM Plex Mono', monospace" }}>
          The Mapping
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr 1fr", gap: 0 }}>
          {/* Header */}
          {["", "Boundary", "Model Form", "Duration"].map((h, i) => (
            <div key={i} style={{ padding: "8px 16px", fontSize: 11, fontWeight: 700, color: "#d4a76a", borderBottom: "1px solid rgba(245,240,232,0.15)", fontFamily: "'IBM Plex Mono', monospace" }}>{h}</div>
          ))}
          {/* Rows */}
          {[
            ["Option A", "Retrofit isolation", "Engineering calc", "Spot / short-term"],
            ["Option B", "Retrofit isolation", "Statistical or engineering", "Full duration"],
            ["Option C", "Whole facility", "Statistical regression", "Full duration"],
            ["Option D", "Whole facility", "Physics simulation", "Calibrated"],
          ].map((row, ri) => (
            row.map((cell, ci) => (
              <div key={`${ri}-${ci}`} style={{
                padding: "10px 16px", fontSize: 13,
                color: ci === 0 ? "#f5f0e8" : "#c4b8a8",
                fontWeight: ci === 0 ? 700 : 400,
                borderBottom: ri < 3 ? "1px solid rgba(245,240,232,0.08)" : "none",
                fontFamily: ci === 0 ? "'IBM Plex Mono', monospace" : "'IBM Plex Sans', sans-serif",
              }}>{cell}</div>
            ))
          ))}
        </div>
      </div>

      {/* Expandable Option cards */}
      {options.map(opt => {
        const isOpen = expanded === opt.letter;
        return (
          <div key={opt.letter} style={{
            background: C.card, border: `1px solid ${isOpen ? C.blue : C.border}`, borderRadius: 8,
            marginBottom: 12, overflow: "hidden", transition: "border-color 0.2s",
          }}>
            <div onClick={() => setExpanded(isOpen ? null : opt.letter)} style={{
              padding: "18px 24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: C.blueDim,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 700, color: C.blue, fontFamily: "'IBM Plex Mono', monospace",
                }}>{opt.letter}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.white }}>{opt.name}</div>
                  <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>{opt.threeD}</div>
                </div>
              </div>
              <div style={{ fontSize: 18, color: C.textDim, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</div>
            </div>
            {isOpen && (
              <div style={{ padding: "0 24px 20px", borderTop: `1px solid ${C.border}` }}>
                <div style={{ padding: "16px 0" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                    {[
                      { label: "Boundary", value: opt.boundary, color: C.rose },
                      { label: "Model Form", value: opt.model, color: C.blue },
                      { label: "Duration", value: opt.duration, color: C.amber },
                    ].map(d => (
                      <div key={d.label} style={{ background: `${d.color}08`, border: `1px solid ${d.color}20`, borderRadius: 6, padding: "10px 12px" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: d.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{d.label}</div>
                        <div style={{ fontSize: 13, color: C.text }}>{d.value}</div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, margin: "0 0 12px" }}>{opt.cfNote}</p>
                  <p style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.7, margin: "0 0 12px" }}><strong style={{ color: C.white }}>When to use it:</strong> {opt.when}</p>
                  {opt.courseLink && (
                    <a href={opt.courseLink} target="_blank" rel="noopener noreferrer" style={{
                      display: "inline-block", fontSize: 13, color: C.copper, fontWeight: 600, textDecoration: "none",
                      padding: "8px 16px", background: C.copperDim, borderRadius: 6, marginTop: 4,
                    }}>
                      {opt.courseLinkLabel} →
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <p style={{ fontSize: 14, color: C.textSoft, lineHeight: 1.7, marginTop: 32, padding: "20px 24px", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}>
        <strong style={{ color: C.white }}>The key insight:</strong> Options A–D are points in a continuous space. The three-dimension framework
        gives you the axes, so you can locate yourself when your project doesn't fit neatly into a lettered box.
        An analysis might use a narrow boundary with a statistical model and short-term data — that's somewhere
        between Option A and Option B. The framework handles this naturally. The Options don't.
      </p>
    </PageWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TERMINOLOGY GLOSSARY
   ═══════════════════════════════════════════════════════════════ */
function Glossary({ onBack }) {
  const [search, setSearch] = useState("");

  const terms = [
    { term: "Baseline Period", ipmvp: "The period before the energy conservation measure (ECM) is installed, during which energy use is measured to establish a reference.", plain: "The stretch of time you model to learn what 'normal' energy use looks like before anything changes.", note: null },
    { term: "Reporting Period", ipmvp: "The period after the ECM is installed, during which energy savings are determined.", plain: "The stretch of time after the retrofit. You compare actual energy use here against what the counterfactual predicts.", note: null },
    { term: "Energy Conservation Measure (ECM)", ipmvp: "An activity or set of activities designed to reduce energy use.", plain: "The intervention — whatever was done to the building. A lighting upgrade, a chiller replacement, a controls sequence change.", note: null },
    { term: "Measurement Boundary", ipmvp: "A notional boundary drawn around equipment or systems of the ECM to define the extent of savings measurement.", plain: "Where you draw the line around what your meter (or model) captures. This is Dimension 1 of the three-dimension framework.", note: "See Boundary Explainer in the course." },
    { term: "Independent Variable", ipmvp: "A parameter that is expected to change and affect energy consumption (e.g., outdoor temperature, production volume).", plain: "A driver of energy use — something you think causes the building to use more or less energy. Temperature is the most common, but it could be occupancy, production, or daylight hours.", note: null },
    { term: "Interactive Effects", ipmvp: "The effect that an ECM in one system has on energy consumption in other systems within the measurement boundary.", plain: "When fixing one thing changes something else. LED lights produce less heat, so the cooling system works less but the heating system works more. A whole-building boundary captures this automatically.", note: null },
    { term: "Stipulated Value", ipmvp: "A value estimated rather than measured.", plain: "A number you assume rather than measure. Option A relies heavily on stipulated values (e.g., assumed operating hours). More stipulation = more uncertainty = simpler measurement.", note: null },
    { term: "Adjusted Baseline Energy", ipmvp: "Baseline energy consumption adjusted to conditions of the reporting period.", plain: "The counterfactual prediction. You take the baseline model and feed it reporting-period conditions (weather, occupancy, etc.) to answer: 'What would energy use have been without the retrofit?'", note: "This is the central concept in the Counterfactual Workbench." },
    { term: "Non-Routine Adjustment (NRA)", ipmvp: "An adjustment for changes in energy-governing factors that are not accounted for by the independent variables in the model.", plain: "Something changed between baseline and reporting periods that your model doesn't handle — a new server room, a change in building hours, a partial occupancy shift. You have to adjust for it manually.", note: "See NRA Case Studies in the course." },
    { term: "CV(RMSE)", ipmvp: "Coefficient of Variation of the Root Mean Squared Error. A measure of model fit.", plain: "How scattered are your model's errors, expressed as a percentage of the mean? Lower = more precise counterfactual. A common threshold is ≤ 15% for monthly models.", note: "See the CV(RMSE) Deep Dive module in the course." },
    { term: "NMBE", ipmvp: "Normalized Mean Bias Error. A measure of systematic over- or under-prediction.", plain: "Is your model consistently too high or too low? A common threshold is ± 5%. Near zero = unbiased.", note: null },
    { term: "Fractional Savings Uncertainty", ipmvp: "The uncertainty in reported savings, expressed as a fraction of the savings value.", plain: "How confident are you in the savings number? A result like '12% savings ± 8% at 95% confidence' means you're fairly sure savings are real but the exact amount is uncertain.", note: "The Workbench Savings step calculates this automatically." },
  ];

  const filtered = search.trim()
    ? terms.filter(t =>
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.plain.toLowerCase().includes(search.toLowerCase()))
    : terms;

  return (
    <PageWrapper onBack={onBack} title="Terminology Glossary">
      <h1 style={{ fontSize: 28, fontWeight: 700, color: C.white, margin: "0 0 12px" }}>
        IPMVP Terminology Glossary
      </h1>
      <p style={{ fontSize: 15, color: C.textSoft, lineHeight: 1.7, marginBottom: 24 }}>
        IPMVP terms translated to plain language. Definitions align with pre-copyright public domain versions; current EVO-copyrighted versions may differ. See Appendix II of <em>The Role of the M&V Professional</em> for the full evolution of each term.
      </p>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 24 }}>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Filter terms..."
          style={{
            width: "100%", padding: "10px 16px", fontSize: 14, borderRadius: 8,
            border: `1px solid ${C.border}`, background: C.card, color: C.text,
            fontFamily: "'IBM Plex Sans', sans-serif", outline: "none", boxSizing: "border-box",
          }}
          onFocus={e => e.target.style.borderColor = C.copper}
          onBlur={e => e.target.style.borderColor = C.border}
        />
      </div>

      {/* Terms */}
      {filtered.map((t, i) => (
        <div key={i} style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
          padding: "20px 24px", marginBottom: 12,
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.white, marginBottom: 10 }}>{t.term}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.amber, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>IPMVP Definition</div>
              <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.6, fontStyle: "italic" }}>{t.ipmvp}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.copper, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Plain Language</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{t.plain}</div>
            </div>
          </div>
          {t.note && (
            <div style={{ marginTop: 10, fontSize: 12, color: C.green, fontWeight: 500 }}>📍 {t.note}</div>
          )}
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: C.textDim }}>No matching terms found.</div>
      )}
    </PageWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HISTORY: ARBITRATED, NOT DESIGNED
   ═══════════════════════════════════════════════════════════════ */
function History({ onBack }) {
  return (
    <PageWrapper onBack={onBack} title="A Note on History">
      <h1 style={{ fontSize: 28, fontWeight: 700, color: C.white, margin: "0 0 12px" }}>
        Arbitrated, Not Designed
      </h1>
      <p style={{ fontSize: 15, color: C.textSoft, lineHeight: 1.8, marginBottom: 20 }}>
        IPMVP's terminology was not designed from first principles. It was arbitrated — the product of committee
        negotiation across organizations, countries, and decades. That process produced something useful but also
        something with the marks of compromise: overlapping categories, ambiguous boundaries between Options,
        and definitions that shifted with each new revision.
      </p>

      {/* Timeline */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "28px 28px", marginBottom: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: C.violet, fontWeight: 600, textTransform: "uppercase", marginBottom: 20, fontFamily: "'IBM Plex Mono', monospace" }}>
          Key Milestones
        </div>
        {[
          { year: "1996", event: "NEMVP published", note: "The first version — the North American Energy Measurement and Verification Protocol. Created by a DOE-led coalition." },
          { year: "1997", event: "IPMVP Vol. I", note: "Renamed to International. Options A–D first appear as a classification framework." },
          { year: "2001", event: "EVO established", note: "The Efficiency Valuation Organization takes stewardship of IPMVP." },
          { year: "2002", event: "IPMVP 2002", note: "Major revision. Option definitions refined. Adoption grows internationally." },
          { year: "2007", event: "IPMVP 2007", note: "Added concepts for new construction. Option D scope expanded." },
          { year: "2012", event: "IPMVP placed under copyright", note: "EVO copyrights the document. Previously public domain content becomes proprietary." },
          { year: "2014–2022", event: "EVO Core Concepts + Application Guides", note: "Restructured into modular documents. Some definitions shift again." },
        ].map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 20, marginBottom: 16 }}>
            <div style={{
              minWidth: 60, fontSize: 14, fontWeight: 700, color: C.violet,
              fontFamily: "'IBM Plex Mono', monospace", paddingTop: 2,
            }}>{m.year}</div>
            <div style={{ borderLeft: `2px solid ${C.border}`, paddingLeft: 20, paddingBottom: i < 6 ? 8 : 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 4 }}>{m.event}</div>
              <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.6 }}>{m.note}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "24px 28px", marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.white, margin: "0 0 12px" }}>Why This Matters</h2>
        <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, margin: "0 0 12px" }}>
          When you encounter IPMVP language in a contract or standard, you're reading the output of a
          consensus process. That language reflects what a committee could agree on, not necessarily what
          an individual practitioner designing an analysis from scratch would choose to say.
        </p>
        <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, margin: "0 0 12px" }}>
          This isn't a criticism — consensus standards serve an essential function. They create shared vocabulary
          across organizations and borders. But shared vocabulary and clear thinking are not the same thing.
        </p>
        <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, margin: 0 }}>
          The Counterfactual Designs framework starts from the other end: what decisions does a practitioner
          actually face? That question leads to three dimensions — Boundary, Model Form, Duration — which
          are independent, composable, and sufficient to describe any M&V analysis. The IPMVP Options are
          named locations in this same space.
        </p>
      </div>

      {/* Placeholder for future book content */}
      <div style={{ background: C.violetDim, border: `1px solid ${C.violet}30`, borderRadius: 10, padding: "24px 28px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.violet, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
          Coming Soon
        </div>
        <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, margin: 0 }}>
          A deeper exploration of how IPMVP terminology evolved — drawing on Steve Kromer's experience as
          former Chair of IPMVP and documented in <em>The Role of the Measurement and Verification Professional</em> (River Publishers, 2024).
          This section will trace how committee dynamics shaped the language, why certain distinctions were drawn
          where they were, and what got lost in the process of arbitration.
        </p>
      </div>
    </PageWrapper>
  );
}
