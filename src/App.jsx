import { useState, useEffect } from "react";
import StatsFundamentals from "./Fundamentals.jsx";
import MVWorkbench from "./Workbench.jsx";
import ArchitectureOfUncertainty from "./ArchitectureOfUncertainty.jsx";
import UncertaintyPedagogy from "./UncertaintyPedagogy.jsx";
import BeyondOneVariable from "./BeyondOneVariable.jsx";
import SimulationExplainer from "./SimulationExplainer.jsx";
import CaseStudies from "./CaseStudies.jsx";
import BoundaryExplainer from "./BoundaryExplainer.jsx";
import DurationExplainer from "./DurationExplainer.jsx";

const ROUTES = { "": "home", "#/fundamentals": "fundamentals", "#/workbench": "workbench", "#/architecture": "architecture", "#/pedagogy": "pedagogy", "#/beyond": "beyond", "#/simulation": "simulation", "#/cases": "cases", "#/boundary": "boundary", "#/duration": "duration" };
const HASHES = Object.fromEntries(Object.entries(ROUTES).map(([k, v]) => [v, k]));

function useHashRouter() {
  const getPage = () => ROUTES[window.location.hash] || "home";
  const [page, setPageState] = useState(getPage);
  useEffect(() => {
    const handler = () => setPageState(getPage());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  const setPage = (p) => {
    const hash = HASHES[p] || "";
    if (hash) window.location.hash = hash; else history.pushState(null, "", window.location.pathname);
    setPageState(p);
    window.scrollTo(0, 0);
  };
  return [page, setPage];
}

const C = {
  bg: "#f8f9fb", surface: "#ffffff", surfaceRaised: "#f0f2f5",
  border: "#d8dde6", borderHover: "#b0b8c8",
  text: "#1a2332", textSoft: "#4a5568", textDim: "#8494a7", white: "#111827",
  blue: "#2563eb", blueDim: "#dbeafe",
  green: "#16a34a", greenDim: "#dcfce7",
  amber: "#b45309", amberDim: "#fef3c7",
  orange: "#ea580c", teal: "#0d9488",
};

export default function App() {
  const [page, setPage] = useHashRouter();

  if (page === "fundamentals") return <ToolWrapper onHome={() => setPage("home")} onSwitch={() => setPage("workbench")} switchLabel="M&V Workbench →" current="fundamentals"><StatsFundamentals /></ToolWrapper>;
  if (page === "workbench") return <ToolWrapper onHome={() => setPage("home")} onSwitch={() => setPage("fundamentals")} switchLabel="← Fundamentals" current="workbench"><MVWorkbench /></ToolWrapper>;
  if (page === "architecture") return <ArchitectureOfUncertainty onBack={() => setPage("home")} />;
  if (page === "pedagogy") return <UncertaintyPedagogy onBack={() => setPage("home")} />;
  if (page === "beyond") return <BeyondOneVariable onBack={() => setPage("home")} />;
  if (page === "simulation") return <SimulationExplainer onBack={() => setPage("home")} />;
  if (page === "cases") return <CaseStudies onBack={() => setPage("home")} />;
  if (page === "boundary") return <BoundaryExplainer onBack={() => setPage("home")} />;
  if (page === "duration") return <DurationExplainer onBack={() => setPage("home")} />;

  return <Landing onNav={setPage} />;
}

function ToolWrapper({ children, onHome, onSwitch, switchLabel, current }) {
  return (
    <div>
      <div style={{
        background: C.surface, borderBottom: `1px solid ${C.border}`,
        padding: "0 32px", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 42 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={onHome} style={{
              background: "none", border: "none", cursor: "pointer", color: C.blue,
              fontSize: 12, fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6, padding: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L1 7.5L3 7.5V14H6.5V10H9.5V14H13V7.5L15 7.5L8 1Z" fill={C.blue} />
              </svg>
              M&V Course
            </button>
            <span style={{ color: C.border }}>|</span>
            <span style={{ fontSize: 11, color: C.textDim, fontFamily: "'IBM Plex Sans', sans-serif" }}>
              {current === "fundamentals" ? "Part 1: Statistical Fundamentals" : "Part 2: M&V Modeling Workbench"}
            </span>
          </div>
          <button onClick={onSwitch} style={{
            background: C.surfaceRaised, border: `1px solid ${C.border}`, borderRadius: 4,
            padding: "5px 14px", color: C.textSoft, fontSize: 11, fontFamily: "'IBM Plex Sans', sans-serif",
            cursor: "pointer",
          }}>{switchLabel}</button>
        </div>
      </div>
      {children}
    </div>
  );
}

function Landing({ onNav }) {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'IBM Plex Sans', sans-serif", color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Hero */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "60px 32px 56px", background: C.surface }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: C.teal, fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>
            IPMVP Companion Course
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: C.white, margin: "0 0 16px", letterSpacing: -0.5, lineHeight: 1.2 }}>
            Statistical Modeling for<br />IPMVP Implementation
          </h1>
          <p style={{ fontSize: 16, color: C.textSoft, lineHeight: 1.7, maxWidth: 600, margin: "0 auto" }}>
            Build the statistical intuition and practical skills to implement IPMVP Options A–D. From regression fundamentals through whole-facility and retrofit isolation approaches, aligned with EVO Core Concepts and ASHRAE Guideline 14.
          </p>
        </div>
      </div>

      {/* Course path */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 32px" }}>
        {/* Learning path connector */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.teal }} />
          <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg, ${C.teal}, ${C.blue})` }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.blue }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Part 1 */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: 0, overflow: "hidden", cursor: "pointer", transition: "all 0.2s",
          }}
            onClick={() => onNav("fundamentals")}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.boxShadow = `0 4px 20px ${C.teal}15`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ background: C.surfaceRaised, padding: "16px 24px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: C.teal, fontWeight: 600 }}>PART 1</span>
                  <span style={{ background: C.greenDim, color: C.green, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 3 }}>START HERE</span>
                </div>
                <span style={{ fontSize: 10, color: C.textDim }}>5 modules</span>
              </div>
            </div>
            <div style={{ padding: "24px 24px 28px" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: C.white, margin: "0 0 10px" }}>Statistical Fundamentals</h2>
              <p style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.7, margin: "0 0 20px" }}>
                Build intuition from the ground up. What does a scatter plot reveal that a time series doesn't? Why fit a line? What is a residual? How do you know if a model is good enough?
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  ["01", "Two Views of Data", "Time series vs. scatter — same data, different stories"],
                  ["02", "Why Linear Models?", "Drag your own line, see errors update, discover OLS"],
                  ["03", "What Is a Residual?", "Step-by-step error anatomy + heteroskedasticity patterns"],
                  ["04", "Goodness of Fit", "R², RMSE, CV(RMSE), NMBE — what they mean and when they lie"],
                  ["05", "CV(RMSE) Deep Dive", "Why the same model quality can produce different scores"],
                ].map(([num, title, desc]) => (
                  <div key={num} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: C.teal, fontWeight: 600, marginTop: 2, flexShrink: 0 }}>{num}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{title}</div>
                      <div style={{ fontSize: 11, color: C.textDim, marginTop: 1 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 24, background: C.teal, color: "#fff", border: "none",
                borderRadius: 6, padding: "12px 0", textAlign: "center",
                fontSize: 14, fontWeight: 600,
              }}>Begin with Fundamentals →</div>
            </div>
          </div>

          {/* Part 2 */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: 0, overflow: "hidden", cursor: "pointer", transition: "all 0.2s",
          }}
            onClick={() => onNav("workbench")}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.boxShadow = `0 4px 20px ${C.blue}15`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ background: C.surfaceRaised, padding: "16px 24px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: C.blue, fontWeight: 600 }}>PART 2</span>
                  <span style={{ background: C.blueDim, color: C.blue, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 3 }}>APPLIED</span>
                </div>
                <span style={{ fontSize: 10, color: C.textDim }}>5 steps</span>
              </div>
            </div>
            <div style={{ padding: "24px 24px 28px" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: C.white, margin: "0 0 10px" }}>M&V Modeling Workbench</h2>
              <p style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.7, margin: "0 0 20px" }}>
                Apply what you learned. Choose a building, explore its data, fit change-point regression models, validate against ASHRAE Guideline 14, and calculate savings with uncertainty.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  ["01", "Scenario", "Choose a building and understand the counterfactual design"],
                  ["02", "Explore", "Read the scatter plot to identify the right model form"],
                  ["03", "Counterfactual", "Select and fit a change-point regression model"],
                  ["04", "Validate", "Test against Guideline 14 thresholds + residual diagnostics"],
                  ["05", "Savings", "Project the counterfactual and quantify uncertainty"],
                ].map(([num, title, desc]) => (
                  <div key={num} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: C.blue, fontWeight: 600, marginTop: 2, flexShrink: 0 }}>{num}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{title}</div>
                      <div style={{ fontSize: 11, color: C.textDim, marginTop: 1 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 24, background: C.blue, color: "#fff", border: "none",
                borderRadius: 6, padding: "12px 0", textAlign: "center",
                fontSize: 14, fontWeight: 600,
              }}>Open the Workbench →</div>
            </div>
          </div>
        </div>

        {/* Explainers */}
        <div style={{ marginTop: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.amber }} />
            <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg, ${C.amber}, ${C.orange})` }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.orange }} />
          </div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: C.amber, fontWeight: 600, textTransform: "uppercase", marginBottom: 12, fontFamily: "'IBM Plex Mono', monospace" }}>Explainers</div>

          {/* Boundary — full width, Dimension 1 */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: 0, overflow: "hidden", cursor: "pointer", transition: "all 0.2s", marginBottom: 16,
          }}
            onClick={() => onNav("boundary")}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#be185d"; e.currentTarget.style.boxShadow = "0 4px 20px #be185d15"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", padding: "20px 24px", borderBottom: "3px solid #be185d", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 2, color: "#be185d", fontWeight: 600, textTransform: "uppercase", fontFamily: "'IBM Plex Mono'" }}>Dimension 1 · Counterfactual Design</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "8px 0 0", lineHeight: 1.3 }}>The Measurement Boundary</h3>
              </div>
              <div style={{ fontSize: 10, background: "#be185d20", color: "#be185d", padding: "4px 10px", borderRadius: 4, fontWeight: 700, fontFamily: "'IBM Plex Mono'", whiteSpace: "nowrap", marginTop: 4 }}>NEW</div>
            </div>
            <div style={{ padding: "14px 24px 18px" }}>
              <p style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.7, margin: 0 }}>
                Whole facility or retrofit isolation? Where you draw the line determines what the model sees — and what it hides. Interactive building diagram, IPMVP Options A–D, and the tradeoff between clean signals and total savings.
              </p>
              <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                {["Whole Facility", "Retrofit Isolation", "Options A–D", "Interactive Effects", "Single-Line Diagrams"].map(t => (
                  <span key={t} style={{ fontSize: 9, background: "#be185d15", color: "#be185d", padding: "2px 7px", borderRadius: 3, fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Duration — full width, Dimension 3 */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: 0, overflow: "hidden", cursor: "pointer", transition: "all 0.2s", marginBottom: 16,
          }}
            onClick={() => onNav("duration")}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.boxShadow = `0 4px 20px ${C.teal}15`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", padding: "20px 24px", borderBottom: `3px solid ${C.teal}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 2, color: C.teal, fontWeight: 600, textTransform: "uppercase", fontFamily: "'IBM Plex Mono'" }}>Dimension 3 · Counterfactual Design</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "8px 0 0", lineHeight: 1.3 }}>Duration: Which Past Predicts the Future?</h3>
              </div>
              <div style={{ fontSize: 10, background: `${C.teal}20`, color: C.teal, padding: "4px 10px", borderRadius: 4, fontWeight: 700, fontFamily: "'IBM Plex Mono'", whiteSpace: "nowrap", marginTop: 4 }}>NEW</div>
            </div>
            <div style={{ padding: "14px 24px 18px" }}>
              <p style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.7, margin: 0 }}>
                The most recent 12 months isn't always the right baseline. An interactive example shows how choosing a period with 61% occupancy vs. 88% occupancy flips savings from −23% to +10% — same building, same retrofit, opposite conclusion.
              </p>
              <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                {["Baseline Selection", "Occupancy Trap", "Coverage vs Relevance", "Routine Adjustments", "NRAs"].map(t => (
                  <span key={t} style={{ fontSize: 9, background: `${C.teal}15`, color: C.teal, padding: "2px 7px", borderRadius: 3, fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
              padding: 0, overflow: "hidden", cursor: "pointer", transition: "all 0.2s",
            }}
              onClick={() => onNav("architecture")}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.amber; e.currentTarget.style.boxShadow = `0 4px 20px ${C.amber}15`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", padding: "20px 24px", borderBottom: `3px solid ${C.amber}` }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: C.amber, fontWeight: 600, textTransform: "uppercase", fontFamily: "'IBM Plex Mono'" }}>Explainer</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "8px 0 0", lineHeight: 1.3 }}>The Architecture of Uncertainty</h3>
              </div>
              <div style={{ padding: "14px 20px 18px" }}>
                <p style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.7, margin: 0 }}>
                  What we know, what we don't, and what ain't so. Rumsfeld's matrix completed by Twain and Sinclair.
                </p>
                <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                  {["Epistemology", "Ontology", "False Certainties"].map(t => (
                    <span key={t} style={{ fontSize: 9, background: C.amberDim, color: C.amber, padding: "2px 7px", borderRadius: 3, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
              padding: 0, overflow: "hidden", cursor: "pointer", transition: "all 0.2s",
            }}
              onClick={() => onNav("pedagogy")}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.boxShadow = `0 4px 20px ${C.teal}15`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", padding: "20px 24px", borderBottom: `3px solid ${C.teal}` }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: C.teal, fontWeight: 600, textTransform: "uppercase", fontFamily: "'IBM Plex Mono'" }}>Pedagogy Framework</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "8px 0 0", lineHeight: 1.3 }}>The Uncertainty Guide</h3>
              </div>
              <div style={{ padding: "14px 20px 18px" }}>
                <p style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.7, margin: 0 }}>
                  A 6-layer pedagogy for M&V uncertainty: from epistemic/aleatory/ontological types to counterfactual design.
                </p>
                <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                  {["Three Uncertainties", "Entropy", "Counterfactual Design"].map(t => (
                    <span key={t} style={{ fontSize: 9, background: `${C.teal}15`, color: C.teal, padding: "2px 7px", borderRadius: 3, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
              padding: 0, overflow: "hidden", cursor: "pointer", transition: "all 0.2s",
            }}
              onClick={() => onNav("beyond")}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.boxShadow = `0 4px 20px ${C.blue}15`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", padding: "20px 24px", borderBottom: `3px solid ${C.blue}` }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: C.blue, fontWeight: 600, textTransform: "uppercase", fontFamily: "'IBM Plex Mono'" }}>Interactive Example</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "8px 0 0", lineHeight: 1.3 }}>Beyond One Variable</h3>
              </div>
              <div style={{ padding: "14px 20px 18px" }}>
                <p style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.7, margin: 0 }}>
                  Step through adding causal variables — from R²=0.02 to R²=0.99. Real hourly data, 8,760 observations.
                </p>
                <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                  {["TOWT", "Causality", "Multi-Variable", "Physical Models"].map(t => (
                    <span key={t} style={{ fontSize: 9, background: `${C.blue}15`, color: C.blue, padding: "2px 7px", borderRadius: 3, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
              padding: 0, overflow: "hidden", cursor: "pointer", transition: "all 0.2s",
            }}
              onClick={() => onNav("simulation")}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.violet; e.currentTarget.style.boxShadow = `0 4px 20px ${C.violet}15`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", padding: "20px 24px", borderBottom: `3px solid ${C.violet}` }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: C.violet, fontWeight: 600, textTransform: "uppercase", fontFamily: "'IBM Plex Mono'" }}>Explainer</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "8px 0 0", lineHeight: 1.3 }}>Simulation as Physical Model</h3>
              </div>
              <div style={{ padding: "14px 20px 18px" }}>
                <p style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.7, margin: 0 }}>
                  When statistical models reach their limits, physics-based simulation and Bayesian calibration pick up the thread.
                </p>
                <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                  {["EnergyPlus", "Bayesian Calibration", "Simulation", "Uncertainty"].map(t => (
                    <span key={t} style={{ fontSize: 9, background: `${C.violet}15`, color: C.violet, padding: "2px 7px", borderRadius: 3, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Case Studies */}
        <div style={{ marginTop: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.orange }} />
            <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg, ${C.orange}, ${C.red})` }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.red }} />
          </div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: C.orange, fontWeight: 600, textTransform: "uppercase", marginBottom: 12, fontFamily: "'IBM Plex Mono', monospace" }}>Case Studies</div>
          <div onClick={() => onNav("cases")} style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: 0, overflow: "hidden", cursor: "pointer", transition: "all 0.2s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.boxShadow = `0 4px 20px ${C.orange}15`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", padding: "20px 24px", borderBottom: `3px solid ${C.orange}` }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: C.orange, fontWeight: 600, textTransform: "uppercase", fontFamily: "'IBM Plex Mono'" }}>Interactive Case Studies</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "8px 0 0", lineHeight: 1.3 }}>Non-Routine Adjustments</h3>
            </div>
            <div style={{ padding: "16px 24px 20px" }}>
              <p style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.7, margin: 0 }}>
                Two monthly-model case studies: a server room that appears mid-reporting period, and a chiller failure that contaminates the baseline. Toggle adjustments on and off to see how they change savings.
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                {["Monthly Models", "Reporting Period NRA", "Baseline NRA", "False Certainties"].map(t => (
                  <span key={t} style={{ fontSize: 10, background: `${C.orange}15`, color: C.orange, padding: "3px 8px", borderRadius: 3, fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pedagogical framing */}
        <div style={{ marginTop: 40, background: C.amberDim, border: `1px solid ${C.amber}40`, borderRadius: 8, padding: "20px 28px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.amber, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Framework</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.white, margin: "0 0 10px" }}>Counterfactual Design — Three Dimensions</h3>
          <p style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.7 }}>
            Every M&V analysis requires three decisions that define how you construct the counterfactual.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 16 }}>
            {[
              ["1. Boundary", "What does the meter capture?", "Whole-building", "#be185d", "boundary"],
              ["2. Model Form", "How do you model baseline behavior?", "Statistical regression", C.blue, null],
              ["3. Duration", "Which past predicts the future?", "Relevance over recency", C.teal, "duration"],
            ].map(([title, question, value, color, link]) => (
              <div key={title} onClick={link ? () => onNav(link) : undefined} style={{
                background: C.surface, border: `1px solid ${link ? color + "40" : C.border}`, borderRadius: 6, padding: 14,
                cursor: link ? "pointer" : "default", transition: "all 0.15s",
              }}
                onMouseEnter={link ? (e) => { e.currentTarget.style.borderColor = color; } : undefined}
                onMouseLeave={link ? (e) => { e.currentTarget.style.borderColor = color + "40"; } : undefined}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{title}</div>
                <div style={{ fontSize: 11, color: C.textDim, marginTop: 4, lineHeight: 1.5 }}>{question}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color, marginTop: 8 }}>→ {value}{link ? " ↗" : ""}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Who this is for */}
        <div style={{ marginTop: 32, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 28px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, margin: "0 0 8px" }}>Who is this for?</h3>
          <p style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.7, margin: 0 }}>
            M&V professionals who have framework knowledge (IPMVP, CMVP certification) but need to build practical confidence with the statistics. If you know <em>what</em> a regression model is supposed to do but aren't sure you could build, validate, and defend one in a project review — this is for you.
          </p>
        </div>

        {/* Companion link */}
        <div style={{ marginTop: 32, textAlign: "center", padding: "24px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 6 }}>Looking for the advanced course?</div>
          <a href="https://cfdesigns.vercel.app" style={{ fontSize: 14, color: C.teal, textDecoration: "none", fontWeight: 600 }}>
            Counterfactual Design for M&V →
          </a>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 6, fontStyle: "italic" }}>
            Based on <em>The Role of the M&V Professional</em> by Steve Kromer (River Publishers, 2024)
          </div>
        </div>

        {/* IPMVP terminology disclaimer */}
        <div style={{ marginTop: 24, padding: "20px 28px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.textDim, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
            A Note on Terminology
          </div>
          <p style={{ fontSize: 12, color: C.textDim, lineHeight: 1.7, margin: 0 }}>
            IPMVP terminology has evolved significantly since its inception as NEMVP in 1996. The Option definitions used in this course most closely align with the public domain versions of IPMVP published before the Efficiency Valuation Organization (EVO) placed the document under copyright. For a detailed accounting of how each Option definition has changed across every major revision — from the 1996 NEMVP through the 2022 Core Concepts — see Appendix II of <em>The Role of the Measurement and Verification Professional</em> (Kromer, River Publishers, 2024). The current EVO-copyrighted version of IPMVP may differ from the definitions presented here.
          </p>
        </div>
      </div>
    </div>
  );
}
