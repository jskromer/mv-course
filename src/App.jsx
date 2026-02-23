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
import ClassMap from "./ClassMap.jsx";

const ROUTES = { "": "home", "#/fundamentals": "fundamentals", "#/workbench": "workbench", "#/architecture": "architecture", "#/pedagogy": "pedagogy", "#/beyond": "beyond", "#/simulation": "simulation", "#/cases": "cases", "#/boundary": "boundary", "#/duration": "duration", "#/roadmap": "roadmap" };
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
  bg: "#f5f0e8", surface: "#ffffff", surfaceRaised: "#ebe5d9",
  border: "#d4cbbf", borderHover: "#b5a99a",
  text: "#3d3529", textSoft: "#6b5f52", textDim: "#998d7e", white: "#1a1612",
  blue: "#2c6fad", blueDim: "rgba(44,111,173,0.08)",
  green: "#16a34a", greenDim: "#dcfce7",
  amber: "#a67c28", amberDim: "rgba(166,124,40,0.08)",
  orange: "#ea580c", teal: "#b5632e",
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
  if (page === "roadmap") return <ClassMap onBack={() => setPage("home")} />;

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
          <h1 style={{ fontSize: 36, fontWeight: 700, color: C.white, margin: "0 0 20px", letterSpacing: -0.5, lineHeight: 1.2 }}>
            Statistical Modeling for<br />IPMVP<a href="#terminology-note" style={{ color: C.teal, textDecoration: "none", fontSize: 18, verticalAlign: "super" }}>*</a> Implementation
          </h1>
          <p style={{ fontSize: 17, color: C.textSoft, lineHeight: 1.75, maxWidth: 580, margin: "0 auto 12px" }}>
            You know <em style={{ fontStyle: "normal", fontWeight: 600, color: C.text }}>what</em> a regression model is supposed to do — but could you build one, validate it, and defend it in a project review? This course gets you there.
          </p>
          <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6, maxWidth: 520, margin: "0 auto" }}>
            Interactive modules aligned with IPMVP Options A–D, ASHRAE Guideline 14, and EVO Core Concepts.
          </p>
          <div style={{ marginTop: 20 }}>
            <button onClick={() => onNav("roadmap")} style={{
              background: "none", border: `1px solid ${C.teal}`, borderRadius: 6,
              padding: "8px 20px", fontSize: 13, color: C.teal, fontWeight: 600,
              cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = C.teal; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.teal; }}
            >
              📋 View Student Roadmap
            </button>
          </div>
        </div>
      </div>

      {/* Two paths */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 32px" }}>
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
            <div style={{ background: C.surfaceRaised, padding: "14px 24px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: C.teal, fontWeight: 600 }}>PART 1</span>
                  <span style={{ background: C.greenDim, color: C.green, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 3 }}>START HERE</span>
                </div>
                <span style={{ fontSize: 10, color: C.textDim }}>5 interactive modules</span>
              </div>
            </div>
            <div style={{ padding: "24px 24px 28px" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: C.white, margin: "0 0 10px" }}>Statistical Fundamentals</h2>
              <p style={{ fontSize: 14, color: C.textSoft, lineHeight: 1.7, margin: "0 0 20px" }}>
                Build intuition from the ground up. Scatter plots, linear regression, residuals, and goodness-of-fit metrics — all interactive, all visual.
              </p>
              <div style={{
                background: C.teal, color: "#fff", border: "none",
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
            <div style={{ background: C.surfaceRaised, padding: "14px 24px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: C.blue, fontWeight: 600 }}>PART 2</span>
                  <span style={{ background: C.blueDim, color: C.blue, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 3 }}>APPLIED</span>
                </div>
                <span style={{ fontSize: 10, color: C.textDim }}>5 guided steps</span>
              </div>
            </div>
            <div style={{ padding: "24px 24px 28px" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: C.white, margin: "0 0 10px" }}>M&V Modeling Workbench</h2>
              <p style={{ fontSize: 14, color: C.textSoft, lineHeight: 1.7, margin: "0 0 20px" }}>
                Apply what you learned. Choose a building, fit change-point models, validate against ASHRAE Guideline 14, and calculate savings with uncertainty.
              </p>
              <div style={{
                background: C.blue, color: "#fff", border: "none",
                borderRadius: 6, padding: "12px 0", textAlign: "center",
                fontSize: 14, fontWeight: 600,
              }}>Open the Workbench →</div>
            </div>
          </div>
        </div>

        {/* Go Deeper — compact 3x2 grid */}
        <div style={{ marginTop: 48 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: C.textDim, fontWeight: 600, textTransform: "uppercase", marginBottom: 16, fontFamily: "'IBM Plex Mono', monospace" }}>Go Deeper</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { key: "boundary", title: "Measurement Boundary", desc: "Where you draw the line determines what the model sees — and what it hides.", color: "#be185d", tags: ["Whole Facility", "Retrofit Isolation", "Options A–D"] },
              { key: "duration", title: "Duration", desc: "Which past predicts the future? How baseline period selection changes everything.", color: C.teal, tags: ["Baseline Selection", "Occupancy Trap", "Coverage vs Relevance"] },
              { key: "cases", title: "Non-Routine Adjustments", desc: "Two case studies: a server room appears mid-reporting, a chiller fails during baseline.", color: C.orange, tags: ["Monthly Models", "Reporting Period NRA", "Baseline NRA"] },
              { key: "beyond", title: "Beyond One Variable", desc: "Step through adding causal variables — from R²=0.02 to R²=0.99 with real hourly data.", color: C.blue, tags: ["TOWT", "Multi-Variable", "Causality"] },
              { key: "architecture", title: "Architecture of Uncertainty", desc: "What we know, what we don't, and what ain't so. Epistemic vs. aleatory vs. ontological.", color: C.amber, tags: ["Epistemology", "False Certainties"] },
              { key: "simulation", title: "Simulation as Physical Model", desc: "When statistical models reach their limits, physics-based simulation picks up the thread.", color: "#7c5cbf", tags: ["EnergyPlus", "Bayesian Calibration"] },
            ].map(item => (
              <div key={item.key} onClick={() => onNav(item.key)} style={{
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
                padding: "18px 18px 16px", cursor: "pointer", transition: "all 0.2s",
                borderTop: `3px solid ${item.color}`,
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.boxShadow = `0 3px 16px ${item.color}12`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.borderTopColor = item.color; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 6, lineHeight: 1.3 }}>{item.title}</div>
                <p style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.6, margin: "0 0 10px" }}>{item.desc}</p>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {item.tags.map(t => (
                    <span key={t} style={{ fontSize: 9, background: `${item.color}12`, color: item.color, padding: "2px 6px", borderRadius: 3, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Three Dimensions framework */}
        <div style={{ marginTop: 40, background: C.amberDim, border: `1px solid ${C.amber}40`, borderRadius: 8, padding: "20px 28px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.amber, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Framework</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.white, margin: "0 0 10px" }}>Counterfactual Design — Three Dimensions</h3>
          <p style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.7 }}>
            Every M&V analysis requires three decisions that define how you construct the counterfactual. These dimensions translate — and sharpen — the historic IPMVP Options A–D classification.
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

        {/* Companion courses */}
        <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <a href="https://cfdesigns.vercel.app" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "18px 22px", cursor: "pointer", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.teal}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              <div style={{ fontSize: 10, color: C.teal, fontWeight: 600, letterSpacing: 2, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>Companion</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.white }}>Counterfactual Designs Course</div>
              <div style={{ fontSize: 12, color: C.textSoft, marginTop: 4 }}>The three-dimension framework: Boundary, Model Form, Duration</div>
            </div>
          </a>
          <a href="https://bayesian-mv.vercel.app" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "18px 22px", cursor: "pointer", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.blue}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              <div style={{ fontSize: 10, color: C.blue, fontWeight: 600, letterSpacing: 2, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>Companion</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.white }}>Bayesian M&V Module</div>
              <div style={{ fontSize: 12, color: C.textSoft, marginTop: 4 }}>Same data, same models, different inference — posterior distributions instead of point estimates</div>
            </div>
          </a>
        </div>

        {/* Attribution */}
        <div style={{ marginTop: 24, textAlign: "center", padding: "16px" }}>
          <div style={{ fontSize: 11, color: C.textDim, fontStyle: "italic" }}>
            Based on <em>The Role of the M&V Professional</em> by Steve Kromer (River Publishers, 2024)
          </div>
        </div>

        {/* Terminology note */}
        <div id="terminology-note" style={{ marginTop: 8, padding: "20px 28px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
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
