import { useState } from "react";

const C = {
  bg: "#f5f0e8", surface: "#ffffff", surfaceRaised: "#ebe5d9",
  border: "#d4cbbf", text: "#3d3529", textSoft: "#6b5f52", textDim: "#998d7e", white: "#1a1612",
  blue: "#2c6fad", blueDim: "rgba(44,111,173,0.08)",
  green: "#16a34a", greenDim: "#dcfce7",
  red: "#dc2626", redDim: "#fef2f2",
  amber: "#a67c28", amberDim: "rgba(166,124,40,0.08)",
  teal: "#b5632e", violet: "#7c3aed", orange: "#ea580c",
  indigo: "#4f46e5",
};

function Section({ title, color, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 20, fontWeight: 700, color: C.white, margin: "0 0 14px", paddingBottom: 8, borderBottom: `2px solid ${color}30` }}>{title}</h2>
      {children}
    </div>
  );
}

function P({ children, style }) {
  return <p style={{ fontFamily: "'IBM Plex Sans'", fontSize: 14, color: C.textSoft, lineHeight: 1.85, margin: "0 0 14px", ...style }}>{children}</p>;
}

function Callout({ color, label, children }) {
  const bgMap = { [C.blue]: C.blueDim, [C.green]: C.greenDim, [C.amber]: C.amberDim, [C.red]: C.redDim, [C.teal]: `${C.teal}12`, [C.violet]: `${C.violet}12`, [C.indigo]: `${C.indigo}12` };
  return (
    <div style={{ background: bgMap[color] || `${color}12`, border: `1px solid ${color}30`, borderRadius: 8, padding: "16px 20px", marginBottom: 16 }}>
      {label && <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{label}</div>}
      <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, color: C.textSoft, lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}

function SpectrumDiagram() {
  const bands = [
    { label: "Single\nRegression", sub: "1 variable", r2: "R² ~ 0.02", color: "#ef4444", w: 12 },
    { label: "Change-Point\nModel", sub: "OAT + knees", r2: "R² ~ 0.13", color: "#f97316", w: 14 },
    { label: "Multi-Variable\nRegression", sub: "+ schedule, occ.", r2: "R² ~ 0.90", color: "#eab308", w: 16 },
    { label: "TOWT\n(48 bins)", sub: "time × temperature", r2: "R² ~ 0.99", color: "#22c55e", w: 18 },
    { label: "Calibrated\nSimulation", sub: "physics + tuning", r2: "CV ≤ 15%", color: "#3b82f6", w: 20 },
    { label: "First-Principles\nPhysics", sub: "heat transfer eqns", r2: "mechanistic", color: "#8b5cf6", w: 20 },
  ];
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 20px 16px", marginBottom: 20 }}>
      <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 }}>The Modeling Spectrum</div>

      {/* Arrow bar */}
      <div style={{ position: "relative", margin: "0 0 8px" }}>
        <div style={{ display: "flex", gap: 3, alignItems: "flex-end" }}>
          {bands.map((b, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 8, color: b.color, fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>{b.r2}</div>
              <div style={{ width: "100%", height: b.w * 2.2, borderRadius: 4, background: `linear-gradient(180deg, ${b.color}, ${b.color}90)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 9, fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line" }}>{b.label}</div>
              </div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 8, color: C.textDim, textAlign: "center", lineHeight: 1.3 }}>{b.sub}</div>
            </div>
          ))}
        </div>
        {/* Labels below */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, padding: "6px 0", borderTop: `1px solid ${C.border}` }}>
          <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 10, fontWeight: 600, color: "#ef4444" }}>← Empirical</span>
          <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 9, color: C.textDim }}>every variable must be causal</span>
          <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 10, fontWeight: 600, color: "#8b5cf6" }}>Physical →</span>
        </div>
      </div>
    </div>
  );
}

function ComparisonTable() {
  const rows = [
    ["What it models", "Data patterns", "Building physics"],
    ["Variables", "Temperature, schedule, occupancy", "Walls, windows, HVAC, weather, materials, geometry"],
    ["Calibration", "Regression coefficients", "Bayesian posterior distributions"],
    ["Counterfactual", "Project conditions onto baseline model", "Change any input, re-simulate"],
    ["Extrapolation", "Dangerous beyond training range", "Valid if physics is correct"],
    ["Typical CV(RMSE)", "5–15% (hourly)", "15–30% uncalibrated, 5–15% calibrated"],
    ["What it can't do", "Explain why", "Guarantee parameter identifiability"],
    ["Best for", "Whole-building M&V with good baseline data", "Design analysis, deep retrofits, no-baseline scenarios"],
  ];
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'IBM Plex Sans'", fontSize: 12 }}>
        <thead>
          <tr style={{ background: "#3d3529" }}>
            <th style={{ padding: "10px 14px", textAlign: "left", color: "#fff", fontWeight: 600, fontSize: 11, width: "25%" }}></th>
            <th style={{ padding: "10px 14px", textAlign: "left", color: C.teal, fontWeight: 700, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>Statistical Model</th>
            <th style={{ padding: "10px 14px", textAlign: "left", color: C.violet, fontWeight: 700, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>Physical / Simulation</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, stat, phys], i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? C.surface : C.surfaceRaised }}>
              <td style={{ padding: "8px 14px", fontWeight: 600, color: C.text, borderRight: `1px solid ${C.border}` }}>{label}</td>
              <td style={{ padding: "8px 14px", color: C.textSoft, lineHeight: 1.6, borderRight: `1px solid ${C.border}` }}>{stat}</td>
              <td style={{ padding: "8px 14px", color: C.textSoft, lineHeight: 1.6 }}>{phys}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RepoCard({ name, url, description, tags, color }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
        padding: 0, overflow: "hidden", cursor: "pointer", transition: "all 0.2s",
      }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 4px 16px ${color}20`; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
      >
        <div style={{ background: "linear-gradient(135deg, #3d3529, #3d3529)", padding: "16px 20px", borderBottom: `3px solid ${color}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#998d7e"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
            <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 12, color: "#94a3b8" }}>jskromer</span>
            <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 12, color: "#64748b" }}>/</span>
          </div>
          <h3 style={{ fontFamily: "'IBM Plex Mono'", fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>{name}</h3>
        </div>
        <div style={{ padding: "14px 20px 18px" }}>
          <p style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: C.textSoft, lineHeight: 1.7, margin: "0 0 12px" }}>{description}</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {tags.map(t => (
              <span key={t} style={{ fontSize: 9, background: `${color}15`, color, padding: "2px 7px", borderRadius: 3, fontWeight: 600, fontFamily: "'IBM Plex Sans'" }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </a>
  );
}

function BayesianDiagram() {
  const steps = [
    { label: "Prior\nBeliefs", sub: "Material properties,\nHVAC parameters", color: C.amber, icon: "📐" },
    { label: "Simulation\nRuns", sub: "EnergyPlus generates\npredicted energy", color: C.blue, icon: "⚙️" },
    { label: "Measured\nData", sub: "Compare predictions\nto meter data", color: C.green, icon: "📊" },
    { label: "Posterior\nDistribution", sub: "Updated parameter\nestimates + uncertainty", color: C.violet, icon: "🎯" },
  ];
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 20px 16px", marginBottom: 20 }}>
      <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 }}>Bayesian Calibration Flow</div>
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${s.color}15`, border: `2px solid ${s.color}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", fontSize: 20 }}>{s.icon}</div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, fontWeight: 700, color: s.color, lineHeight: 1.2, whiteSpace: "pre-line" }}>{s.label}</div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 9, color: C.textDim, marginTop: 3, lineHeight: 1.4 }}>{s.sub}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 28, textAlign: "center", color: C.textDim, fontSize: 16, flexShrink: 0 }}>→</div>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: "8px 12px", background: `${C.violet}08`, borderRadius: 4, textAlign: "center" }}>
        <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 10, color: C.violet, fontWeight: 600 }}>↻ Iterate: posterior becomes the new prior as more data arrives</span>
      </div>
    </div>
  );
}


export default function SimulationExplainer({ onBack }) {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #3d3529 0%, #3d3529 100%)", padding: "48px 32px 40px", borderBottom: `3px solid ${C.violet}` }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {onBack && <button onClick={onBack} style={{ background: "none", border: "none", color: "#998d7e", fontSize: 12, fontFamily: "'IBM Plex Sans'", cursor: "pointer", marginBottom: 16, padding: 0 }}>← Back to course</button>}
          <div style={{ fontSize: 10, letterSpacing: 4, color: C.violet, fontWeight: 600, textTransform: "uppercase", fontFamily: "'IBM Plex Mono'" }}>Explainer</div>
          <h1 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 30, fontWeight: 700, color: "#fff", margin: "10px 0 0", lineHeight: 1.25 }}>Simulation as Physical Model</h1>
          <p style={{ fontFamily: "'IBM Plex Sans'", fontSize: 15, color: "#998d7e", margin: "10px 0 0", lineHeight: 1.7 }}>
            When statistical models reach their limits, physics-based simulation picks up — and Bayesian calibration bridges the gap.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 32px 80px" }}>

        <Section title="The Continuum, Not a Wall" color={C.violet}>
          <P>
            In the <strong>Beyond One Variable</strong> explainer, we watched R² climb from 0.02 to 0.994 by adding causal variables: temperature, day type, occupancy schedule, interaction terms, and finally 48 time-of-week bins. Each variable earned its place through a physical mechanism — not just correlation.
          </P>
          <P>
            That progression reveals something important: <strong>the boundary between a statistical model and a physical model isn't a wall. It's a spectrum.</strong> At one end, you're fitting curves to data. At the other, you're solving heat transfer equations. Every step in between adds more physics.
          </P>
          <SpectrumDiagram />
          <P>
            The TOWT model, with its 48 separate change-point regressions, is already encoding real physics — it just does it implicitly through data rather than explicitly through equations. A simulation model like EnergyPlus does the opposite: it starts from first principles (conduction, convection, radiation, air mass flow) and builds predictions from the physics up.
          </P>
        </Section>

        <Section title="What a Simulation Model Actually Does" color={C.blue}>
          <P>
            EnergyPlus doesn't fit a line to your data. It solves coupled differential equations for heat transfer, moisture transport, and air flow at every timestep. It models every wall, window, HVAC coil, fan, and control loop as interacting physical components.
          </P>
          <Callout color={C.blue} label="A simulation solves, not fits">
            A 5-zone office building in EnergyPlus might have 200+ parameters: wall U-values, glazing SHGC, infiltration rates, chiller COP curves, fan efficiencies, thermostat deadbands, occupancy schedules, lighting power densities. The model computes energy use from these parameters and weather data — no regression required.
          </Callout>
          <P>
            This is powerful because it means you can ask questions that a statistical model can't answer. What happens if you replace the chiller? What if occupancy patterns change permanently? What if you add a second floor? A statistical model trained on the old building can't extrapolate to a new one. A physics model can — if the physics is right.
          </P>
          <P>
            But "if the physics is right" is doing a lot of work in that sentence.
          </P>
        </Section>

        <Section title="The Calibration Problem" color={C.amber}>
          <P>
            Uncalibrated simulation models routinely produce CV(RMSE) values of 25–40% or worse when compared to metered data. The geometry is approximate, the material properties are from spec sheets (not from the weathered building in the field), the occupancy schedules are guesses, and the HVAC controls may not match as-built conditions.
          </P>
          <P>
            Traditional calibration is manual and artisanal: an engineer tweaks parameters one at a time, reruns the simulation, eyeballs the comparison to measured data, and adjusts again. This is slow, non-reproducible, and doesn't quantify uncertainty. It's also prone to <strong>equifinality</strong> — many different parameter combinations can produce the same aggregate CV(RMSE), but for completely different physical reasons.
          </P>
          <Callout color={C.amber} label="Equifinality: the hidden danger">
            A model might hit CV(RMSE) ≤ 15% by overestimating infiltration and underestimating plug loads — errors that cancel in aggregate but produce wrong counterfactuals. The right R² doesn't mean the right physics.
          </Callout>
        </Section>

        <Section title="Bayesian Calibration: Uncertainty In, Uncertainty Out" color={C.violet}>
          <P>
            Bayesian calibration replaces manual tuning with a principled statistical framework. Instead of picking single "best" values for each parameter, it treats every uncertain parameter as a probability distribution and uses measured data to update those distributions.
          </P>
          <BayesianDiagram />
          <P>
            The key insight: <strong>you start with what you know</strong> (prior distributions — maybe wall insulation is R-13 ± R-3 based on construction documents) and let the data sharpen those beliefs. The result isn't a single calibrated model but a distribution of models, each with an associated probability. This naturally propagates uncertainty through to the counterfactual prediction.
          </P>
          <Callout color={C.violet} label="What Bayesian calibration gives you">
            <ul style={{ margin: "4px 0 0", paddingLeft: 20 }}>
              <li style={{ marginBottom: 6 }}>Posterior distributions for every calibration parameter — not just point estimates</li>
              <li style={{ marginBottom: 6 }}>A model discrepancy function that captures systematic bias (physics the model gets wrong)</li>
              <li style={{ marginBottom: 6 }}>Predictive uncertainty bands on counterfactual energy use</li>
              <li style={{ marginBottom: 0 }}>Identifiability diagnostics — which parameters the data can actually constrain</li>
            </ul>
          </Callout>
          <P>
            This connects directly back to the <strong>Architecture of Uncertainty</strong>: Bayesian calibration is how you move unknown unknowns (parameters you assumed were fixed) into known unknowns (parameters with quantified distributions). It's epistemological honesty applied to building physics.
          </P>
        </Section>

        <Section title="Statistical vs. Physical: When to Use Which" color={C.teal}>
          <ComparisonTable />
          <P>
            Neither approach is universally better. A TOWT model is unbeatable when you have a clean baseline year of hourly data and the building's fundamental operation hasn't changed. A calibrated simulation model is essential when the retrofit is so deep that the baseline building no longer exists in any meaningful sense — or when you need to model a scenario you've never measured.
          </P>
          <Callout color={C.teal} label="The practitioner's decision">
            The choice isn't statistical <em>or</em> physical. It's about matching the model to the question. Option C (whole-building regression) answers "how much energy did we avoid?" Option D (simulation) answers "how much energy <em>would</em> we use under conditions we've never seen?"
          </Callout>
        </Section>

        <Section title="Tools: AI-Assisted Simulation and Calibration" color={C.indigo}>
          <P>
            These open-source repositories demonstrate both halves of the physics-based approach: running EnergyPlus simulations programmatically through AI assistants, and calibrating simulation models against measured data using Bayesian methods.
          </P>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <RepoCard
              name="energyplus-mcp"
              url="https://github.com/jskromer/energyplus-mcp"
              description="Model Context Protocol server enabling AI assistants to interact programmatically with EnergyPlus — load, validate, modify, simulate, and visualize building energy models through 35 tools."
              tags={["EnergyPlus", "MCP", "AI-Assisted", "35 Tools"]}
              color={C.blue}
            />
            <RepoCard
              name="bayesian-energy-calibration"
              url="https://github.com/jskromer/bayesian-energy-calibration"
              description="Bayesian calibration framework for building energy models — updating prior parameter distributions with measured data to produce calibrated simulations with quantified uncertainty."
              tags={["Bayesian", "Stan", "Calibration", "Uncertainty"]}
              color={C.violet}
            />
          </div>
          <Callout color={C.indigo} label="The connection">
            The EnergyPlus MCP server makes it possible to <em>run</em> the simulation programmatically. The Bayesian calibration framework makes it possible to <em>tune</em> the simulation against reality. Together they form a pipeline: specify priors → run simulations → compare to meters → update posteriors → generate calibrated counterfactuals with uncertainty bands.
          </Callout>
        </Section>

        {/* The Big Idea */}
        <div style={{ background: "linear-gradient(135deg, #3d3529, #3d3529)", borderRadius: 8, padding: "28px 28px", color: "#fff", marginBottom: 24 }}>
          <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: C.violet, textTransform: "uppercase", marginBottom: 12 }}>The Big Idea</div>
          <P style={{ fontSize: 15, color: "#e2e8f0", margin: "0 0 12px" }}>
            A statistical model learns <em>what</em> the building does. A physical model encodes <em>why</em>.
          </P>
          <P style={{ fontSize: 15, color: "#e2e8f0", margin: "0 0 12px" }}>
            The TOWT model with 48 bins and R² = 0.994 is a remarkable achievement in pattern capture — but it can't tell you which wall is losing heat or which chiller is degrading. A calibrated EnergyPlus model with CV(RMSE) = 10% might fit the data less tightly, but it <strong style={{ color: "#fff" }}>knows which parameters are uncertain and by how much</strong>.
          </P>
          <P style={{ fontSize: 15, color: "#94a3b8", margin: 0, fontStyle: "italic" }}>
            The frontier isn't choosing between them. It's knowing when each is the right tool — and having the infrastructure to use both.
          </P>
        </div>

        {/* Further reading */}
        <div style={{ padding: "16px 20px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
          <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, fontWeight: 700, color: C.textDim, marginBottom: 10 }}>Further Reading</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              ["ASHRAE Guideline 14", "https://www.ashrae.org/technical-resources/bookstore/ashrae-guideline-14-2023-measurement-of-energy-demand-and-water-savings", "Measurement protocols for statistical and simulation-based M&V"],
              ["EnergyPlus Documentation", "https://energyplus.net/documentation", "Official reference for the building energy simulation engine"],
              ["Chong & Menberg (2018)", "https://www.sciencedirect.com/science/article/abs/pii/S0378778818307539", "Guidelines for the Bayesian calibration of building energy models"],
              ["Kennedy & O'Hagan (2001)", "https://rss.onlinelibrary.wiley.com/doi/10.1111/1467-9868.00294", "The foundational Bayesian calibration framework for computer models"],
            ].map(([title, url, desc]) => (
              <a key={title} href={url} target="_blank" rel="noopener noreferrer" style={{
                textDecoration: "none", padding: "10px 14px", borderRadius: 6, border: `1px solid ${C.border}`,
                background: C.surfaceRaised, transition: "all 0.15s",
              }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = C.violet}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = C.border}
              >
                <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, fontWeight: 600, color: C.violet }}>{title} ↗</div>
                <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 10, color: C.textDim, marginTop: 3, lineHeight: 1.4 }}>{desc}</div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
