import { useState, useEffect } from "react";

// ─── PALETTE (warm cream, matching CFdesigns family) ─────────────────
const C = {
  bg: "#f5f0e8", surface: "#ebe5d9", card: "#ffffff",
  border: "#d4cbbf", white: "#1a1612", text: "#3d3529",
  textSoft: "#6b5f52", textDim: "#998d7e",
  teal: "#b5632e", tealDim: "rgba(181,99,46,0.08)",
  blue: "#2c6fad", blueDim: "rgba(44,111,173,0.06)",
  amber: "#a67c28", amberDim: "rgba(166,124,40,0.08)",
  green: "#4a7c59", greenDim: "rgba(74,124,89,0.08)",
  violet: "#7c5cbf", violetDim: "rgba(124,92,191,0.06)",
  rose: "#be185d",
};

const FONT = "'IBM Plex Sans', sans-serif";
const MONO = "'IBM Plex Mono', monospace";

// ─── CURRICULUM DATA ─────────────────────────────────────────────────
const PHASES = [
  {
    id: "intuition",
    num: 1,
    title: "Build Statistical Intuition",
    color: C.teal,
    goal: "You can look at a scatter plot and see a model. You understand what regression does and what the fit metrics mean.",
    checkpoint: "You can explain why CV(RMSE) < 15% doesn't guarantee a good model, and why a scatter plot tells you more than a time series for M&V.",
    items: [
      { id: "p1-01", label: "Two Views of Data", desc: "Same 12 months as time series vs. scatter plot", time: 10, link: "/#/fundamentals", site: "mv-course" },
      { id: "p1-02", label: "Why Linear Models?", desc: "Drag your own line, see residuals update, discover OLS", time: 15, link: "/#/fundamentals", site: "mv-course" },
      { id: "p1-03", label: "What Is a Residual?", desc: "Click points to dissect errors, spot heteroskedasticity", time: 15, link: "/#/fundamentals", site: "mv-course" },
      { id: "p1-04", label: "Goodness of Fit", desc: "R², RMSE, CV(RMSE), NMBE — what they mean, when they lie", time: 20, link: "/#/fundamentals", site: "mv-course" },
      { id: "p1-05", label: "CV(RMSE) Deep Dive", desc: "The baseload slider: same noise, bigger denominator", time: 15, link: "/#/fundamentals", site: "mv-course" },
    ],
  },
  {
    id: "frequentist",
    num: 2,
    title: "Apply It — Frequentist Workbench",
    color: C.blue,
    goal: "You can select a building, choose a model, fit it, validate it, and calculate savings with uncertainty.",
    checkpoint: "You can take monthly utility data, select an appropriate change-point model, validate against GL14, and report savings with a 95% CI. You can explain what that CI means — and what it doesn't.",
    note: "Do all three buildings. Each teaches something different about model selection.",
    items: [
      { id: "p2-heat", label: "Office — Heating Dominant", desc: "3-Parameter Heating model, strong winter signal, gas therms", time: 20, link: "/#/workbench", site: "mv-course" },
      { id: "p2-cool", label: "Retail — Cooling Dominant", desc: "3-Parameter Cooling model, summer peak, electricity kWh", time: 20, link: "/#/workbench", site: "mv-course" },
      { id: "p2-mixed", label: "School — Mixed Use", desc: "5-Parameter model, both heating and cooling change points", time: 25, link: "/#/workbench", site: "mv-course" },
    ],
  },
  {
    id: "bayesian",
    num: 3,
    title: "See It Differently — Bayesian Workbench",
    color: C.violet,
    goal: "You understand what changes when you replace frequentist point estimates with Bayesian posterior distributions — and what stays the same.",
    checkpoint: "You can explain the difference between a confidence interval and a credible interval. You understand that Bayesian inference carries forward change-point uncertainty rather than committing to one.",
    note: "Open the frequentist workbench in a second tab. Compare side by side — same building, same data, different inference.",
    items: [
      { id: "p3-heat", label: "Office — Bayesian", desc: "Same heating building. Set priors, watch the posterior update, compare the savings distribution", time: 25, link: null, site: "bayesian", external: "https://bayesian-mv.vercel.app/#/workbench" },
      { id: "p3-mixed", label: "School — Bayesian", desc: "The 5P model is revealing: change-point posterior shows genuine uncertainty about where heating stops and cooling starts", time: 30, link: null, site: "bayesian", external: "https://bayesian-mv.vercel.app/#/workbench" },
    ],
  },
  {
    id: "deeper",
    num: 4,
    title: "Go Deeper — Context & Judgment",
    color: C.amber,
    goal: "You understand the design decisions behind M&V — boundary, duration, adjustments — and can defend them in a project review.",
    checkpoint: "Pick the ones relevant to your work. Come back to the others when you need them.",
    items: [
      { id: "p4-boundary", label: "Measurement Boundary", desc: "Whole-facility vs. retrofit isolation. Interactive building diagram, Options A–D tradeoffs", time: 20, link: "/#/boundary", site: "mv-course" },
      { id: "p4-duration", label: "Duration", desc: "Which past predicts the future? The occupancy trap: same building, opposite savings conclusions", time: 20, link: "/#/duration", site: "mv-course" },
      { id: "p4-nra", label: "Non-Routine Adjustments", desc: "Server room appears mid-reporting. Chiller fails during baseline. Toggle adjustments on/off", time: 25, link: "/#/cases", site: "mv-course" },
      { id: "p4-beyond", label: "Beyond One Variable", desc: "Add variables to an hourly model: R² from 0.02 to 0.99. Understand TOWT models", time: 20, link: "/#/beyond", site: "mv-course" },
      { id: "p4-arch", label: "Architecture of Uncertainty", desc: "Epistemic vs. aleatory vs. ontological. Rumsfeld's matrix, completed by Twain and Sinclair", time: 15, link: "/#/architecture", site: "mv-course" },
      { id: "p4-sim", label: "Simulation as Physical Model", desc: "When statistical models reach their limits: EnergyPlus, Bayesian calibration, physics-based counterfactuals", time: 15, link: "/#/simulation", site: "mv-course" },
    ],
  },
  {
    id: "framework",
    num: 5,
    title: "The Framework — Counterfactual Design",
    color: C.rose,
    goal: "You can articulate the three design decisions behind any M&V plan without reaching for protocol labels.",
    checkpoint: "After all the hands-on work, the three-dimension framework clicks because you've already lived through every concept.",
    items: [
      { id: "p5-cf", label: "Counterfactual Designs Course", desc: "Boundary, Model Form, Duration — translates and sharpens the IPMVP Options A–D classification", time: 30, link: null, site: "cfdesigns", external: "https://cfdesigns.vercel.app" },
    ],
  },
];

const TOTAL_ITEMS = PHASES.reduce((sum, p) => sum + p.items.length, 0);

// ─── PERSISTENCE ─────────────────────────────────────────────────────
function loadChecked() {
  try {
    return JSON.parse(localStorage.getItem("mv-roadmap-checked") || "{}");
  } catch { return {}; }
}
function saveChecked(obj) {
  try { localStorage.setItem("mv-roadmap-checked", JSON.stringify(obj)); } catch {}
}

// ─── COMPONENT ───────────────────────────────────────────────────────
export default function ClassMap({ onBack }) {
  const [checked, setChecked] = useState(loadChecked);

  useEffect(() => { saveChecked(checked); }, [checked]);

  const toggle = (id) => setChecked(prev => {
    const next = { ...prev };
    if (next[id]) delete next[id]; else next[id] = Date.now();
    return next;
  });

  const totalDone = Object.keys(checked).length;
  const pct = Math.round((totalDone / TOTAL_ITEMS) * 100);

  const phaseProgress = (phase) => {
    const done = phase.items.filter(it => checked[it.id]).length;
    return { done, total: phase.items.length, complete: done === phase.items.length };
  };

  const resolveLink = (item) => {
    if (item.external) return item.external;
    return `https://mv-course.vercel.app${item.link}`;
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: FONT, color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "12px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: C.surface }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.teal, cursor: "pointer", fontSize: 13, padding: 0, fontFamily: FONT, fontWeight: 600 }}>
          ← Course Home
        </button>
        <div style={{ fontSize: 12, color: C.textDim, fontFamily: MONO }}>
          {totalDone}/{TOTAL_ITEMS} complete
        </div>
      </div>

      {/* Hero */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "48px 32px 44px", background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)` }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: C.teal, fontWeight: 600, textTransform: "uppercase", marginBottom: 12, fontFamily: MONO }}>
            Student Roadmap
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: C.white, margin: "0 0 12px", letterSpacing: -0.5, lineHeight: 1.2 }}>
            Your Path Through M&V
          </h1>
          <p style={{ fontSize: 15, color: C.textSoft, lineHeight: 1.7, margin: "0 0 24px", maxWidth: 560 }}>
            Five phases, three sites, one coherent journey. Check off modules as you go — your progress is saved in this browser.
          </p>

          {/* Overall progress bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1, height: 8, background: C.surface, borderRadius: 4, overflow: "hidden", border: `1px solid ${C.border}` }}>
              <div style={{
                width: `${pct}%`, height: "100%",
                background: `linear-gradient(90deg, ${C.teal}, ${C.blue}, ${C.violet}, ${C.amber}, ${C.rose})`,
                borderRadius: 4, transition: "width 0.4s ease",
              }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.white, fontFamily: MONO, minWidth: 45, textAlign: "right" }}>
              {pct}%
            </span>
          </div>

          {/* Phase dots */}
          <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
            {PHASES.map(phase => {
              const { complete } = phaseProgress(phase);
              return (
                <a key={phase.id} href={`#phase-${phase.id}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "4px 12px",
                    background: complete ? phase.color : C.card,
                    border: `1px solid ${complete ? phase.color : C.border}`,
                    borderRadius: 20, fontSize: 11, fontWeight: 600, textDecoration: "none",
                    color: complete ? "#fff" : C.textSoft, transition: "all 0.2s",
                    fontFamily: MONO,
                  }}>
                  {complete ? "✓" : phase.num}
                  <span style={{ fontFamily: FONT, fontWeight: 500 }}>{phase.title.split(" — ")[0].split(" — ")[0].replace("Build ", "").replace("Apply It", "Applied").replace("See It Differently", "Bayesian").replace("Go Deeper", "Deeper").replace("The Framework", "Framework")}</span>
                </a>
              );
            })}
          </div>

          {/* Time estimate */}
          <div style={{ marginTop: 16, fontSize: 12, color: C.textDim }}>
            Estimated total: ~8 hours · A week of lunch breaks, or a focused day
          </div>
        </div>
      </div>

      {/* Phases */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 32px 80px" }}>
        {PHASES.map((phase, pi) => {
          const { done, total, complete } = phaseProgress(phase);
          const phaseMinutes = phase.items.reduce((s, it) => s + it.time, 0);

          return (
            <div key={phase.id} id={`phase-${phase.id}`} style={{ marginBottom: 40 }}>
              {/* Phase header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                  background: complete ? phase.color : C.card,
                  border: `2px solid ${phase.color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: complete ? 18 : 16, fontWeight: 700,
                  color: complete ? "#fff" : phase.color,
                  fontFamily: MONO, transition: "all 0.3s",
                }}>
                  {complete ? "✓" : phase.num}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: C.white, margin: 0 }}>
                      Phase {phase.num}: {phase.title}
                    </h2>
                    <span style={{ fontSize: 11, color: C.textDim, fontFamily: MONO }}>{done}/{total}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
                    ~{phaseMinutes} min · {phase.items.length} {phase.items.length === 1 ? "module" : "modules"}
                  </div>
                </div>
              </div>

              {/* Goal */}
              <div style={{ background: `${phase.color}08`, border: `1px solid ${phase.color}25`, borderRadius: 8, padding: "14px 18px", marginBottom: 12, marginLeft: 56 }}>
                <div style={{ fontSize: 10, color: phase.color, fontWeight: 600, letterSpacing: 2, fontFamily: MONO, marginBottom: 4 }}>GOAL</div>
                <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6, margin: 0 }}>{phase.goal}</p>
              </div>

              {/* Note if present */}
              {phase.note && (
                <div style={{ marginLeft: 56, marginBottom: 12, fontSize: 13, color: C.amber, fontStyle: "italic", lineHeight: 1.5 }}>
                  💡 {phase.note}
                </div>
              )}

              {/* Items */}
              <div style={{ marginLeft: 56, display: "flex", flexDirection: "column", gap: 6 }}>
                {phase.items.map(item => {
                  const isDone = !!checked[item.id];
                  const url = resolveLink(item);
                  const isExternal = !!item.external;

                  return (
                    <div key={item.id} style={{
                      background: isDone ? `${phase.color}06` : C.card,
                      border: `1px solid ${isDone ? phase.color + "30" : C.border}`,
                      borderRadius: 8, padding: "14px 18px",
                      display: "flex", alignItems: "flex-start", gap: 14,
                      transition: "all 0.2s",
                    }}>
                      {/* Checkbox */}
                      <button onClick={() => toggle(item.id)} style={{
                        width: 22, height: 22, borderRadius: 5, flexShrink: 0, marginTop: 1,
                        background: isDone ? phase.color : C.card,
                        border: `2px solid ${isDone ? phase.color : C.border}`,
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s", padding: 0,
                      }}>
                        {isDone && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <a href={url} target={isExternal ? "_blank" : "_self"} rel={isExternal ? "noopener noreferrer" : undefined}
                            style={{
                              fontSize: 14, fontWeight: 600,
                              color: isDone ? C.textDim : C.white,
                              textDecoration: isDone ? "line-through" : "none",
                              transition: "color 0.2s",
                            }}
                            onMouseEnter={e => { if (!isDone) e.currentTarget.style.color = phase.color; }}
                            onMouseLeave={e => { e.currentTarget.style.color = isDone ? C.textDim : C.white; }}
                          >
                            {item.label}
                          </a>
                          {isExternal && (
                            <span style={{ fontSize: 9, color: C.textDim, fontFamily: MONO, background: C.surface, padding: "1px 6px", borderRadius: 3 }}>
                              {item.site === "bayesian" ? "bayesian-mv" : "cfdesigns"}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: isDone ? C.textDim : C.textSoft, marginTop: 2, lineHeight: 1.5 }}>
                          {item.desc}
                        </div>
                      </div>

                      {/* Time */}
                      <div style={{ fontSize: 11, color: C.textDim, fontFamily: MONO, flexShrink: 0, marginTop: 2 }}>
                        {item.time} min
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Checkpoint */}
              <div style={{
                marginLeft: 56, marginTop: 12,
                background: complete ? `${phase.color}10` : C.surface,
                border: `1px dashed ${complete ? phase.color : C.border}`,
                borderRadius: 8, padding: "12px 18px",
                display: "flex", alignItems: "flex-start", gap: 10,
              }}>
                <span style={{ fontSize: 14, flexShrink: 0, marginTop: -1 }}>{complete ? "🎯" : "🏁"}</span>
                <div>
                  <div style={{ fontSize: 10, color: complete ? phase.color : C.textDim, fontWeight: 600, letterSpacing: 2, fontFamily: MONO, marginBottom: 2 }}>
                    CHECKPOINT
                  </div>
                  <p style={{ fontSize: 12, color: complete ? C.text : C.textDim, lineHeight: 1.5, margin: 0, fontStyle: complete ? "normal" : "italic" }}>
                    {phase.checkpoint}
                  </p>
                </div>
              </div>

              {/* Connector line between phases */}
              {pi < PHASES.length - 1 && (
                <div style={{ marginLeft: 75, width: 2, height: 24, background: C.border }} />
              )}
            </div>
          );
        })}

        {/* Completion message */}
        {pct === 100 && (
          <div style={{
            background: "linear-gradient(135deg, #2c2418 0%, #3d3529 100%)",
            borderRadius: 12, padding: "32px 36px", textAlign: "center",
            border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🎓</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#f5f0e8", margin: "0 0 8px" }}>Course Complete</h2>
            <p style={{ fontSize: 15, color: "#c4b8a8", lineHeight: 1.7, margin: "0 0 16px", maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
              You've worked through the full curriculum — statistical foundations, frequentist modeling, Bayesian inference, and the counterfactual design framework. You're ready to build, validate, and defend M&V models with confidence.
            </p>
            <p style={{ fontSize: 13, color: "#998d7e", margin: 0, fontStyle: "italic" }}>
              Based on <em>The Role of the M&V Professional</em> by Steve Kromer (River Publishers, 2024)
            </p>
          </div>
        )}

        {/* Reset */}
        <div style={{ marginTop: 32, textAlign: "center" }}>
          <button onClick={() => { if (window.confirm("Reset all progress? This cannot be undone.")) setChecked({}); }}
            style={{
              background: "none", border: `1px solid ${C.border}`, borderRadius: 6,
              padding: "8px 20px", fontSize: 12, color: C.textDim,
              cursor: "pointer", fontFamily: FONT, transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.rose; e.currentTarget.style.color = C.rose; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textDim; }}
          >
            Reset progress
          </button>
        </div>
      </div>
    </div>
  );
}
