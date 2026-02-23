import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import CVrmseModule from "./CVrmseModule.jsx";

// ─── COLORS (matches workbench) ──────────────────────────────────
const C = {
  bg: "#f5f0e8", surface: "#ffffff", surfaceRaised: "#ebe5d9",
  border: "#d4cbbf", borderHover: "#b5a99a",
  text: "#3d3529", textSoft: "#6b5f52", textDim: "#998d7e", white: "#1a1612",
  blue: "#2c6fad", blueDim: "rgba(44,111,173,0.08)",
  green: "#16a34a", greenDim: "#dcfce7",
  red: "#dc2626", redDim: "#fee2e2",
  amber: "#a67c28", amberDim: "rgba(166,124,40,0.08)",
  orange: "#ea580c", violet: "#7c3aed", teal: "#b5632e",
  pink: "#db2777",
};

// ─── SAMPLE DATA ─────────────────────────────────────────────────
const BUILDING_DATA = [
  { month: "Jan-23", temp: 26, energy: 4820, idx: 0 },
  { month: "Feb-23", temp: 30, energy: 4410, idx: 1 },
  { month: "Mar-23", temp: 40, energy: 3280, idx: 2 },
  { month: "Apr-23", temp: 52, energy: 1950, idx: 3 },
  { month: "May-23", temp: 62, energy: 820, idx: 4 },
  { month: "Jun-23", temp: 72, energy: 480, idx: 5 },
  { month: "Jul-23", temp: 77, energy: 450, idx: 6 },
  { month: "Aug-23", temp: 75, energy: 460, idx: 7 },
  { month: "Sep-23", temp: 66, energy: 610, idx: 8 },
  { month: "Oct-23", temp: 54, energy: 1750, idx: 9 },
  { month: "Nov-23", temp: 40, energy: 3350, idx: 10 },
  { month: "Dec-23", temp: 28, energy: 4650, idx: 11 },
];

// ─── MATH HELPERS ────────────────────────────────────────────────
function mean(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }

function linReg(data, xKey, yKey) {
  const n = data.length;
  const xs = data.map(d => d[xKey]);
  const ys = data.map(d => d[yKey]);
  const mx = mean(xs), my = mean(ys);
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const slope = den !== 0 ? num / den : 0;
  const intercept = my - slope * mx;
  const yHat = xs.map(x => intercept + slope * x);
  const residuals = ys.map((y, i) => y - yHat[i]);
  const SSres = residuals.reduce((s, r) => s + r * r, 0);
  const SStot = ys.reduce((s, y) => s + (y - my) ** 2, 0);
  const R2 = SStot > 0 ? 1 - SSres / SStot : 0;
  return { slope, intercept, yHat, residuals, R2, mx, my, xs, ys };
}

// ─── SVG CHART PRIMITIVES ────────────────────────────────────────
function useContainerWidth(ref) {
  const [width, setWidth] = useState(700);
  useEffect(() => {
    const update = () => { if (ref.current) setWidth(ref.current.clientWidth); };
    update();
    const id = setInterval(update, 400);
    window.addEventListener("resize", update);
    return () => { clearInterval(id); window.removeEventListener("resize", update); };
  }, [ref]);
  return width;
}

function makeTicks(min, max, count) {
  const range = max - min;
  if (range === 0) return [min];
  const step = Math.pow(10, Math.floor(Math.log10(range / count)));
  const candidates = [step, step * 2, step * 5, step * 10];
  const best = candidates.find(s => range / s <= count + 2) || candidates[candidates.length - 1];
  const start = Math.ceil(min / best) * best;
  const ticks = [];
  for (let v = start; v <= max; v += best) ticks.push(v);
  return ticks;
}

function fmtNum(v) { return Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0); }

// ─── MAIN APP ────────────────────────────────────────────────────
export default function StatsFundamentals() {
  const [module, setModule] = useState(0);

  // Shared model state — set in Module 2, used in Modules 3 & 4
  const [userSlope, setUserSlope] = useState(-80);
  const [userIntercept, setUserIntercept] = useState(6500);
  const [useOLS, setUseOLS] = useState(false);

  const modules = [
    { label: "Two Views of Data", num: "01", icon: "📊" },
    { label: "Why Linear Models?", num: "02", icon: "📐" },
    { label: "What Is a Residual?", num: "03", icon: "📏" },
    { label: "Goodness of Fit", num: "04", icon: "✓" },
    { label: "CV(RMSE)", num: "05", icon: "📊" },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'IBM Plex Mono', monospace" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <header style={{ borderBottom: `1px solid ${C.border}`, padding: "20px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: C.textDim, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Foundations</div>
          <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 24, fontWeight: 700, margin: 0, color: C.white }}>Statistical Modeling — The Fundamentals</h1>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.textDim, margin: "6px 0 0" }}>Before you build a counterfactual, you need to understand what a statistical model is and why it works.</p>
        </div>
      </header>

      <nav style={{ borderBottom: `1px solid ${C.border}`, background: C.surface, overflowX: "auto" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", minWidth: "max-content" }}>
          {modules.map((m, i) => (
            <button key={i} onClick={() => setModule(i)} style={{
              background: "transparent", border: "none",
              borderBottom: module === i ? `2px solid ${C.blue}` : "2px solid transparent",
              padding: "12px 14px", color: module === i ? C.blue : C.textSoft,
              fontSize: 11, fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: module === i ? 600 : 400,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
            }}>
              <span style={{ fontSize: 13 }}>{m.icon}</span>
              <span style={{ fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", opacity: 0.5 }}>{m.num}</span>
              {m.label}
            </button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 32px 60px" }}>
        {module === 0 && <ModuleTwoViews />}
        {module === 1 && <ModuleWhyLinear userSlope={userSlope} setUserSlope={setUserSlope} userIntercept={userIntercept} setUserIntercept={setUserIntercept} useOLS={useOLS} setUseOLS={setUseOLS} />}
        {module === 2 && <ModuleResiduals userSlope={userSlope} userIntercept={userIntercept} useOLS={useOLS} />}
        {module === 3 && <ModuleGoodnessOfFit userSlope={userSlope} userIntercept={userIntercept} useOLS={useOLS} />}
        {module === 4 && <CVrmseModule />}
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MODULE 0 — TWO VIEWS OF DATA
   Same data, scatter plot vs time series, different stories
   ═══════════════════════════════════════════════════════════════════ */
function ModuleTwoViews() {
  const [view, setView] = useState("both");
  const containerRef = useRef(null);
  const w = useContainerWidth(containerRef);
  const data = BUILDING_DATA;
  const chartH = 320;
  const pad = { top: 20, right: 30, bottom: 50, left: 70 };
  const cw = w - pad.left - pad.right;
  const ch = chartH - pad.top - pad.bottom;

  // Scales for time series
  const tsScaleX = (i) => pad.left + (i / (data.length - 1)) * cw;
  const eMin = Math.min(...data.map(d => d.energy)) * 0.85;
  const eMax = Math.max(...data.map(d => d.energy)) * 1.08;
  const tsScaleY = (v) => pad.top + ch - ((v - eMin) / (eMax - eMin)) * ch;

  // Scales for scatter
  const tMin = Math.min(...data.map(d => d.temp)) - 5;
  const tMax = Math.max(...data.map(d => d.temp)) + 5;
  const scScaleX = (v) => pad.left + ((v - tMin) / (tMax - tMin)) * cw;
  const scScaleY = tsScaleY; // same Y scale

  const yTicks = makeTicks(eMin, eMax, 5);
  const tTicks = makeTicks(tMin, tMax, 8);

  return (
    <div ref={containerRef}>
      <SectionTitle>Two views of the same data</SectionTitle>
      <P>Here are 12 months of gas bills for an office building. The same numbers, plotted two ways, tell very different stories. Understanding when to use each view is the foundation of statistical modeling for M&V.</P>

      <div style={{ display: "flex", gap: 8, marginTop: 16, marginBottom: 20 }}>
        {[["both", "Side by Side"], ["time", "Time Series Only"], ["scatter", "Scatter Only"]].map(([k, label]) => (
          <button key={k} onClick={() => setView(k)} style={{
            background: view === k ? C.blue : C.surfaceRaised,
            border: `1px solid ${view === k ? C.blue : C.border}`,
            borderRadius: 4, padding: "8px 16px", color: view === k ? "#fff" : C.textSoft,
            fontSize: 12, fontFamily: "'IBM Plex Sans', sans-serif", cursor: "pointer", fontWeight: view === k ? 600 : 400,
          }}>{label}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: view === "both" ? "1fr 1fr" : "1fr", gap: 16 }}>
        {/* TIME SERIES */}
        {(view === "both" || view === "time") && (
          <Panel>
            <PanelLabel>Time Series: Energy Over Time</PanelLabel>
            <svg width={view === "both" ? w / 2 - 50 : w - 42} height={chartH} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {(() => {
                const localW = (view === "both" ? w / 2 - 50 : w - 42) - pad.left - pad.right;
                const sx = (i) => pad.left + (i / (data.length - 1)) * localW;
                return (
                  <>
                    {yTicks.map(t => <line key={t} x1={pad.left} x2={pad.left + localW} y1={tsScaleY(t)} y2={tsScaleY(t)} stroke={C.border} strokeDasharray="3 3" />)}
                    {/* Line connecting points */}
                    <polyline points={data.map((d, i) => `${sx(i)},${tsScaleY(d.energy)}`).join(" ")} fill="none" stroke={C.blue} strokeWidth={2} />
                    {/* Points */}
                    {data.map((d, i) => <circle key={i} cx={sx(i)} cy={tsScaleY(d.energy)} r={4} fill={C.blue} stroke={C.blueDim} strokeWidth={1} />)}
                    {/* Axes */}
                    <line x1={pad.left} x2={pad.left + localW} y1={pad.top + ch} y2={pad.top + ch} stroke={C.borderHover} />
                    <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + ch} stroke={C.borderHover} />
                    {data.map((d, i) => i % 2 === 0 && <text key={i} x={sx(i)} y={pad.top + ch + 18} textAnchor="middle" fill={C.textDim} fontSize={9}>{d.month}</text>)}
                    {yTicks.map(t => <text key={t} x={pad.left - 10} y={tsScaleY(t) + 4} textAnchor="end" fill={C.textDim} fontSize={10}>{fmtNum(t)}</text>)}
                    <text x={pad.left + localW / 2} y={pad.top + ch + 40} textAnchor="middle" fill={C.textSoft} fontSize={11} fontFamily="'IBM Plex Sans', sans-serif">Month</text>
                    <text x={14} y={pad.top + ch / 2} textAnchor="middle" fill={C.textSoft} fontSize={11} fontFamily="'IBM Plex Sans', sans-serif" transform={`rotate(-90, 14, ${pad.top + ch / 2})`}>Energy (therms)</text>
                  </>
                );
              })()}
            </svg>
            <Box type="concept" title="What the time series tells you">
              <P>Energy goes up and down over the year in a seasonal wave. You can see <Em>when</Em> energy is high (winter) and low (summer). It tells you the story in <strong>chronological order</strong>. But it doesn't tell you <Em>why</Em>.</P>
            </Box>
          </Panel>
        )}

        {/* SCATTER PLOT */}
        {(view === "both" || view === "scatter") && (
          <Panel>
            <PanelLabel>Scatter Plot: Energy vs. Temperature</PanelLabel>
            <svg width={view === "both" ? w / 2 - 50 : w - 42} height={chartH} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {(() => {
                const localW = (view === "both" ? w / 2 - 50 : w - 42) - pad.left - pad.right;
                const sx = (v) => pad.left + ((v - tMin) / (tMax - tMin)) * localW;
                return (
                  <>
                    {yTicks.map(t => <line key={t} x1={pad.left} x2={pad.left + localW} y1={scScaleY(t)} y2={scScaleY(t)} stroke={C.border} strokeDasharray="3 3" />)}
                    {tTicks.map(t => <line key={t} x1={sx(t)} x2={sx(t)} y1={pad.top} y2={pad.top + ch} stroke={C.border} strokeDasharray="3 3" />)}
                    {/* Points */}
                    {data.map((d, i) => <circle key={i} cx={sx(d.temp)} cy={scScaleY(d.energy)} r={5} fill={C.orange} fillOpacity={0.85} stroke={C.border} strokeWidth={1} />)}
                    {/* Axes */}
                    <line x1={pad.left} x2={pad.left + localW} y1={pad.top + ch} y2={pad.top + ch} stroke={C.borderHover} />
                    <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + ch} stroke={C.borderHover} />
                    {tTicks.map(t => <text key={t} x={sx(t)} y={pad.top + ch + 18} textAnchor="middle" fill={C.textDim} fontSize={10}>{t}</text>)}
                    {yTicks.map(t => <text key={t} x={pad.left - 10} y={scScaleY(t) + 4} textAnchor="end" fill={C.textDim} fontSize={10}>{fmtNum(t)}</text>)}
                    <text x={pad.left + localW / 2} y={pad.top + ch + 40} textAnchor="middle" fill={C.textSoft} fontSize={11} fontFamily="'IBM Plex Sans', sans-serif">Temperature (°F)</text>
                    <text x={14} y={pad.top + ch / 2} textAnchor="middle" fill={C.textSoft} fontSize={11} fontFamily="'IBM Plex Sans', sans-serif" transform={`rotate(-90, 14, ${pad.top + ch / 2})`}>Energy (therms)</text>
                  </>
                );
              })()}
            </svg>
            <Box type="concept" title="What the scatter plot tells you">
              <P>Time is gone. Instead you see the <Em>relationship</Em> between temperature and energy. Cold temperatures → high energy. Warm temperatures → low energy. This is the plot that reveals the <strong>structure</strong> you can model. The shape of this cloud of points tells you what kind of equation could describe the building's behavior.</P>
            </Box>
          </Panel>
        )}
      </div>

      <Box type="concept" title="The key insight">
        <P><strong>Time series plots show patterns in time.</strong> They're useful for spotting anomalies, operational changes, and trends. But they can't isolate the effect of a single variable.</P>
        <P style={{ marginTop: 8 }}><strong>Scatter plots show relationships between variables.</strong> They're the foundation of regression modeling. In M&V, we need to model the relationship between energy and its drivers (like temperature) so we can predict what energy use <Em>would have been</Em> under different conditions. You can't build that prediction from a time series — you need the scatter plot.</P>
        <P style={{ marginTop: 8 }}>Think of it this way: the time series tells you <Em>"what happened."</Em> The scatter plot tells you <Em>"why it happened."</Em> M&V needs the "why."</P>
      </Box>

      {/* Data table */}
      <Collapsible label="See the raw data">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Month", "Temperature (°F)", "Energy (therms)"].map((h, i) => (
                  <th key={i} style={{ textAlign: i === 0 ? "left" : "right", padding: "8px 12px", color: C.textDim, fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}15` }}>
                  <td style={{ padding: "6px 12px", fontFamily: "'IBM Plex Sans'" }}>{d.month}</td>
                  <td style={{ padding: "6px 12px", textAlign: "right", color: C.amber }}>{d.temp}</td>
                  <td style={{ padding: "6px 12px", textAlign: "right", color: C.blue }}>{d.energy.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Collapsible>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MODULE 1 — WHY LINEAR MODELS?
   ═══════════════════════════════════════════════════════════════════ */
function ModuleWhyLinear({ userSlope, setUserSlope, userIntercept, setUserIntercept, useOLS, setUseOLS }) {
  const containerRef = useRef(null);
  const w = useContainerWidth(containerRef);

  const data = BUILDING_DATA;
  const reg = useMemo(() => linReg(data, "temp", "energy"), []);

  const chartH = 400;
  const pad = { top: 20, right: 30, bottom: 50, left: 70 };
  const cw = w - pad.left - pad.right;
  const ch = chartH - pad.top - pad.bottom;

  const tMin = Math.min(...data.map(d => d.temp)) - 5;
  const tMax = Math.max(...data.map(d => d.temp)) + 5;
  const eMin = -500;
  const eMax = 7000;
  const sx = (v) => pad.left + ((v - tMin) / (tMax - tMin)) * cw;
  const sy = (v) => pad.top + ch - ((v - eMin) / (eMax - eMin)) * ch;

  const tTicks = makeTicks(tMin, tMax, 8);
  const eTicks = makeTicks(eMin, eMax, 6);

  // User's line
  const userPredict = (t) => userIntercept + userSlope * t;
  const userResiduals = data.map(d => d.energy - userPredict(d.temp));
  const userSSE = userResiduals.reduce((s, r) => s + r * r, 0);
  const yMean = mean(data.map(d => d.energy));
  const SStot = data.reduce((s, d) => s + (d.energy - yMean) ** 2, 0);
  const userR2 = SStot > 0 ? 1 - userSSE / SStot : 0;
  const userRMSE = Math.sqrt(userSSE / (data.length - 2));
  const userCvRMSE = (userRMSE / yMean) * 100;

  // Best fit line
  const bestSSE = reg.residuals.reduce((s, r) => s + r * r, 0);
  const bestR2 = reg.R2;
  const bestRMSE = Math.sqrt(bestSSE / (data.length - 2));
  const bestCvRMSE = (bestRMSE / yMean) * 100;

  return (
    <div ref={containerRef}>
      <SectionTitle>Why linear models?</SectionTitle>
      <P>A model is an equation that describes a relationship. The simplest useful model is a straight line: <code style={{ color: C.amber, background: C.amberDim, padding: "2px 6px", borderRadius: 3 }}>Energy = intercept + slope × Temperature</code>. But why a line? And what makes one line better than another?</P>

      <Box type="concept" title="The idea">
        <P>Look at the scatter plot below. The points aren't random — they follow a pattern. If you could draw a line through that pattern, you could use it to <Em>predict</Em> energy at any temperature, even temperatures you haven't observed. That's the core of statistical modeling: find the line (or curve) that best captures the pattern, then use it to make predictions.</P>
      </Box>

      <Panel style={{ marginTop: 20 }}>
        <PanelLabel>Try fitting a line — adjust the slope and intercept</PanelLabel>

        <div style={{ display: "flex", gap: 24, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 11, color: C.textDim, fontFamily: "'IBM Plex Sans'" }}>
              Slope (β₁): <span style={{ color: C.orange, fontWeight: 600 }}>{userSlope}</span>
            </label>
            <input type="range" min={-200} max={50} step={1} value={userSlope}
              onChange={(e) => setUserSlope(Number(e.target.value))}
              style={{ width: "100%", marginTop: 4, accentColor: C.orange }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textDim }}>
              <span>-200</span><span>0</span><span>+50</span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 11, color: C.textDim, fontFamily: "'IBM Plex Sans'" }}>
              Intercept (β₀): <span style={{ color: C.orange, fontWeight: 600 }}>{userIntercept.toLocaleString()}</span>
            </label>
            <input type="range" min={0} max={10000} step={50} value={userIntercept}
              onChange={(e) => setUserIntercept(Number(e.target.value))}
              style={{ width: "100%", marginTop: 4, accentColor: C.orange }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textDim }}>
              <span>0</span><span>5,000</span><span>10,000</span>
            </div>
          </div>
        </div>

        <svg width={w - 42} height={chartH} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          {/* Grid */}
          {tTicks.map(t => <line key={`gx${t}`} x1={sx(t)} x2={sx(t)} y1={pad.top} y2={pad.top + ch} stroke={C.border} strokeDasharray="3 3" />)}
          {eTicks.map(t => <line key={`gy${t}`} x1={pad.left} x2={pad.left + cw} y1={sy(t)} y2={sy(t)} stroke={C.border} strokeDasharray="3 3" />)}

          {/* Residual lines (from point to user's line) */}
          {data.map((d, i) => {
            const predicted = userPredict(d.temp);
            return <line key={`r${i}`} x1={sx(d.temp)} x2={sx(d.temp)} y1={sy(d.energy)} y2={sy(predicted)} stroke={C.red} strokeWidth={1.5} strokeDasharray="4 2" opacity={0.6} />;
          })}

          {/* User's line */}
          <line x1={sx(tMin)} y1={sy(userPredict(tMin))} x2={sx(tMax)} y2={sy(userPredict(tMax))} stroke={C.orange} strokeWidth={2.5} />

          {/* Best fit line (if shown) */}
          {useOLS && (
            <line x1={sx(tMin)} y1={sy(reg.intercept + reg.slope * tMin)} x2={sx(tMax)} y2={sy(reg.intercept + reg.slope * tMax)} stroke={C.green} strokeWidth={2} strokeDasharray="6 3" />
          )}

          {/* Data points */}
          {data.map((d, i) => <circle key={i} cx={sx(d.temp)} cy={sy(d.energy)} r={5} fill={C.blue} fillOpacity={0.9} stroke={C.blueDim} strokeWidth={1} />)}

          {/* Axes */}
          <line x1={pad.left} x2={pad.left + cw} y1={pad.top + ch} y2={pad.top + ch} stroke={C.borderHover} />
          <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + ch} stroke={C.borderHover} />
          {tTicks.map(t => <text key={t} x={sx(t)} y={pad.top + ch + 18} textAnchor="middle" fill={C.textDim} fontSize={10}>{t}</text>)}
          {eTicks.map(t => <text key={t} x={pad.left - 10} y={sy(t) + 4} textAnchor="end" fill={C.textDim} fontSize={10}>{fmtNum(t)}</text>)}
          <text x={pad.left + cw / 2} y={pad.top + ch + 40} textAnchor="middle" fill={C.textSoft} fontSize={11} fontFamily="'IBM Plex Sans'">Temperature (°F)</text>
          <text x={14} y={pad.top + ch / 2} textAnchor="middle" fill={C.textSoft} fontSize={11} fontFamily="'IBM Plex Sans'" transform={`rotate(-90, 14, ${pad.top + ch / 2})`}>Energy (therms)</text>
        </svg>

        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 8, fontSize: 11 }}>
          <span style={{ color: C.textDim, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.blue, display: "inline-block" }} /> Observed
          </span>
          <span style={{ color: C.textDim, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 16, height: 2.5, background: C.orange, display: "inline-block", borderRadius: 2 }} /> Your line
          </span>
          <span style={{ color: C.textDim, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 1.5, background: C.red, display: "inline-block", borderRadius: 2 }} /> Residuals
          </span>
          {useOLS && <span style={{ color: C.textDim, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 16, height: 2, background: C.green, display: "inline-block", borderRadius: 2 }} /> Best fit (OLS)
          </span>}
        </div>
      </Panel>

      {/* Live metrics dashboard */}
      <div style={{ marginTop: 16 }}>
        <PanelLabel>Live model metrics</PanelLabel>
        <div style={{ display: "grid", gridTemplateColumns: useOLS ? "repeat(3, 1fr) 8px repeat(3, 1fr)" : "repeat(3, 1fr)", gap: 10 }}>
          {/* User's metrics */}
          <LiveMetric label="R²" value={userR2.toFixed(4)} color={userR2 > 0.9 ? C.green : userR2 > 0.7 ? C.amber : C.red} tag="Your line" />
          <LiveMetric label="CV(RMSE)" value={`${userCvRMSE.toFixed(1)}%`} color={userCvRMSE < 15 ? C.green : userCvRMSE < 25 ? C.amber : C.red} tag="Your line" threshold="≤15%" />
          <LiveMetric label="SSE" value={Math.round(userSSE).toLocaleString()} color={C.orange} tag="Your line" />

          {useOLS && <>
            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 1, height: "80%", background: C.border }} />
            </div>
            {/* OLS metrics */}
            <LiveMetric label="R²" value={bestR2.toFixed(4)} color={C.green} tag="OLS" />
            <LiveMetric label="CV(RMSE)" value={`${bestCvRMSE.toFixed(1)}%`} color={C.green} tag="OLS" threshold="≤15%" />
            <LiveMetric label="SSE" value={Math.round(bestSSE).toLocaleString()} color={C.green} tag="OLS" />
          </>}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => setUseOLS(!useOLS)} style={{
          background: useOLS ? C.green : C.surfaceRaised, border: `1px solid ${useOLS ? C.green : C.border}`,
          borderRadius: 4, padding: "10px 20px", color: useOLS ? "#000" : C.textSoft,
          fontSize: 12, fontFamily: "'IBM Plex Sans'", cursor: "pointer", fontWeight: 600,
        }}>{useOLS ? "✓ Showing best fit line" : "Show me the best fit line"}</button>
      </div>

      {useOLS && (
        <Box type="concept" title="Ordinary Least Squares (OLS)">
          <P>The green dashed line is the <Em>best possible</Em> straight line through this data. "Best" means it minimizes the total sum of squared residuals — the sum of all those red dashed lines, squared. This is called <strong>Ordinary Least Squares (OLS)</strong> regression.</P>
          <P style={{ marginTop: 8 }}>The best fit line has slope <strong style={{ color: C.green }}>{reg.slope.toFixed(1)}</strong> and intercept <strong style={{ color: C.green }}>{reg.intercept.toFixed(0)}</strong>. No other straight line through this data can achieve a lower SSE than <strong style={{ color: C.green }}>{Math.round(bestSSE).toLocaleString()}</strong>.</P>
          <P style={{ marginTop: 8 }}>Try adjusting your sliders to match it. You'll find you can get close, but the OLS solution is mathematically optimal.</P>
        </Box>
      )}

      <Box type="concept" title="Why squares?">
        <P>Why square the errors instead of just adding them up? Two reasons:</P>
        <P style={{ marginTop: 6 }}>First, <strong>positive and negative errors would cancel out</strong>. A line that's too high by 500 on one point and too low by 500 on another would have a total error of zero — even though it fits terribly. Squaring makes all errors positive.</P>
        <P style={{ marginTop: 6 }}>Second, <strong>squaring penalizes big misses disproportionately</strong>. An error of 100 contributes 10,000. An error of 200 contributes 40,000 — four times as much, not just twice. This forces the line to avoid large deviations, which is usually what we want.</P>
      </Box>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MODULE 2 — WHAT IS A RESIDUAL?
   ═══════════════════════════════════════════════════════════════════ */
function ModuleResiduals({ userSlope, userIntercept, useOLS }) {
  const containerRef = useRef(null);
  const w = useContainerWidth(containerRef);
  const [selectedPt, setSelectedPt] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [showSquares, setShowSquares] = useState(false);
  const [residualView, setResidualView] = useState("scatter"); // scatter | good | hetero | curved

  const data = BUILDING_DATA;
  const ols = useMemo(() => linReg(data, "temp", "energy"), []);

  // Active model: OLS or user's line from Module 2
  const slope = useOLS ? ols.slope : userSlope;
  const intercept = useOLS ? ols.intercept : userIntercept;
  const predict = (t) => intercept + slope * t;
  const residuals = data.map(d => d.energy - predict(d.temp));
  const modelLabel = useOLS ? "OLS best-fit" : "your line";

  const chartH = 420;
  const pad = { top: 20, right: 30, bottom: 50, left: 70 };
  const cw = w - pad.left - pad.right;
  const ch = chartH - pad.top - pad.bottom;
  const tMin = Math.min(...data.map(d => d.temp)) - 5;
  const tMax = Math.max(...data.map(d => d.temp)) + 5;
  const eMin = -500, eMax = 7000;
  const sx = (v) => pad.left + ((v - tMin) / (tMax - tMin)) * cw;
  const sy = (v) => pad.top + ch - ((v - eMin) / (eMax - eMin)) * ch;
  const tTicks = makeTicks(tMin, tMax, 8);
  const eTicks = makeTicks(eMin, eMax, 6);

  const d = data[selectedPt];
  const predicted = predict(d.temp);
  const residual = d.energy - predicted;

  // Residual plot scales
  const resH = 220;
  const resCh = resH - pad.top - pad.bottom;
  const maxAbsRes = Math.max(...residuals.map(r => Math.abs(r))) * 1.3;
  const resSy = (v) => pad.top + resCh / 2 - (v / maxAbsRes) * (resCh / 2);

  // Generate synthetic residual pattern datasets for the diagnostics section
  const syntheticResiduals = useMemo(() => {
    const seed = (i) => Math.sin(i * 127.1 + 311.7) * 43758.5453 % 1;
    const rng = (i) => (seed(i) + seed(i + 100) + seed(i + 200)) / 3 - 0.5; // roughly normal-ish

    // Good: constant variance, random scatter
    const good = Array.from({ length: 30 }, (_, i) => {
      const t = 20 + (i / 29) * 60;
      return { temp: t, residual: rng(i) * 300 };
    });

    // Heteroskedastic: variance grows with temperature
    const hetero = Array.from({ length: 30 }, (_, i) => {
      const t = 20 + (i / 29) * 60;
      const spread = 60 + (t - 20) * 12; // variance grows with temp
      return { temp: t, residual: rng(i + 50) * spread };
    });

    // Curved: systematic pattern (model misspecification)
    const curved = Array.from({ length: 30 }, (_, i) => {
      const t = 20 + (i / 29) * 60;
      const systematic = 250 * Math.sin((t - 20) / 60 * Math.PI * 2);
      return { temp: t, residual: systematic + rng(i + 80) * 100 };
    });

    return { good, hetero, curved };
  }, []);

  return (
    <div ref={containerRef}>
      <SectionTitle>What is a residual?</SectionTitle>
      <P>A <Em>residual</Em> is the vertical distance between where a data point actually is and where the model says it should be. It's the model's error for a single observation — and the foundation of everything in statistical validation.</P>

      {/* Active model banner */}
      <div style={{ background: useOLS ? C.greenDim : C.amberDim, border: `1px solid ${useOLS ? C.green : C.amber}50`, borderRadius: 6, padding: "10px 16px", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, fontFamily: "'IBM Plex Sans', sans-serif", color: C.text }}>
          <strong>Active model ({modelLabel}):</strong>{" "}
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: useOLS ? C.green : C.amber }}>
            E = {intercept.toFixed(0)} + ({slope.toFixed(1)}) × T
          </span>
        </div>
        <span style={{ fontSize: 10, color: C.textDim, fontFamily: "'IBM Plex Sans'" }}>Set in Module 02</span>
      </div>

      <Box type="concept" title="The equation">
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, color: C.amber, padding: "8px 0" }}>
          Residual = Actual − Predicted
        </div>
        <P>Positive residual → the model <strong>underestimated</strong> (actual was higher than the line). Negative residual → the model <strong>overestimated</strong> (actual was lower). A perfect model would have all residuals equal to zero — but that never happens with real data.</P>
      </Box>

      {/* Point selector */}
      <PanelLabel style={{ marginTop: 20 }}>Select a month to see its residual dissected</PanelLabel>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {data.map((pt, i) => (
          <button key={i} onClick={() => { setSelectedPt(i); setShowAll(false); }} style={{
            background: selectedPt === i ? C.blue : C.surfaceRaised,
            border: `1px solid ${selectedPt === i ? C.blue : C.border}`,
            borderRadius: 4, padding: "6px 12px", color: selectedPt === i ? "#fff" : C.textSoft,
            fontSize: 11, fontFamily: "'IBM Plex Sans'", cursor: "pointer",
          }}>{pt.month}</button>
        ))}
      </div>

      {/* Main scatter with residual visualization */}
      <Panel>
        <svg width={w - 42} height={chartH} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          {tTicks.map(t => <line key={`gx${t}`} x1={sx(t)} x2={sx(t)} y1={pad.top} y2={pad.top + ch} stroke={C.border} strokeDasharray="3 3" />)}
          {eTicks.map(t => <line key={`gy${t}`} x1={pad.left} x2={pad.left + cw} y1={sy(t)} y2={sy(t)} stroke={C.border} strokeDasharray="3 3" />)}

          {/* Regression line */}
          <line x1={sx(tMin)} y1={sy(intercept + slope * tMin)} x2={sx(tMax)} y2={sy(intercept + slope * tMax)} stroke={C.orange} strokeWidth={2} />

          {/* ALL residuals when toggled — thick colored bars */}
          {showAll && data.map((pt, i) => {
            const pred = predict(pt.temp);
            const r = pt.energy - pred;
            const barW = 8;
            return (
              <g key={`ra${i}`}>
                <rect
                  x={sx(pt.temp) - barW / 2}
                  y={r > 0 ? sy(pt.energy) : sy(pred)}
                  width={barW}
                  height={Math.abs(sy(pt.energy) - sy(pred))}
                  fill={r > 0 ? C.blue : C.red}
                  fillOpacity={selectedPt === i ? 0.7 : 0.3}
                  rx={2}
                />
                {/* Show squared area if toggled */}
                {showSquares && (() => {
                  const pixelH = Math.abs(sy(pt.energy) - sy(pred));
                  if (pixelH < 4) return null;
                  const side = Math.min(pixelH, 40);
                  return (
                    <rect
                      x={sx(pt.temp) + barW / 2 + 2}
                      y={r > 0 ? sy(pt.energy) : sy(pred)}
                      width={side} height={side}
                      fill={r > 0 ? C.blue : C.red}
                      fillOpacity={0.08}
                      stroke={r > 0 ? C.blue : C.red}
                      strokeOpacity={0.25}
                      strokeWidth={1}
                    />
                  );
                })()}
              </g>
            );
          })}

          {/* SELECTED residual — thick prominent bar */}
          {!showAll && (() => {
            const barW = 12;
            const pred = predicted;
            const r = residual;
            const yTop = r > 0 ? sy(d.energy) : sy(pred);
            const yBot = r > 0 ? sy(pred) : sy(d.energy);
            const barH = yBot - yTop;
            return (
              <g>
                {/* Filled bar */}
                <rect x={sx(d.temp) - barW / 2} y={yTop} width={barW} height={barH}
                  fill={r > 0 ? C.blue : C.red} fillOpacity={0.4} rx={2} />
                {/* Border */}
                <rect x={sx(d.temp) - barW / 2} y={yTop} width={barW} height={barH}
                  fill="none" stroke={r > 0 ? C.blue : C.red} strokeWidth={2.5} rx={2} />
                {/* Arrows */}
                {barH > 20 && (
                  <>
                    {/* Arrow at actual (top if positive) */}
                    <polygon
                      points={`${sx(d.temp)},${sy(d.energy)} ${sx(d.temp) - 5},${sy(d.energy) + (r > 0 ? 8 : -8)} ${sx(d.temp) + 5},${sy(d.energy) + (r > 0 ? 8 : -8)}`}
                      fill={r > 0 ? C.blue : C.red}
                    />
                  </>
                )}
                {/* Bracket labels */}
                <line x1={sx(d.temp) + barW / 2 + 8} x2={sx(d.temp) + barW / 2 + 8} y1={sy(d.energy)} y2={sy(pred)} stroke={C.textDim} strokeWidth={1} />
                <line x1={sx(d.temp) + barW / 2 + 4} x2={sx(d.temp) + barW / 2 + 12} y1={sy(d.energy)} y2={sy(d.energy)} stroke={C.textDim} strokeWidth={1} />
                <line x1={sx(d.temp) + barW / 2 + 4} x2={sx(d.temp) + barW / 2 + 12} y1={sy(pred)} y2={sy(pred)} stroke={C.textDim} strokeWidth={1} />
                {/* Label */}
                <text x={sx(d.temp) + barW / 2 + 16} y={sy((d.energy + pred) / 2) + 4}
                  fill={r > 0 ? C.blue : C.red} fontSize={13} fontWeight={700} fontFamily="'IBM Plex Sans'">
                  {r > 0 ? "+" : ""}{r.toFixed(0)}
                </text>
                <text x={sx(d.temp) + barW / 2 + 16} y={sy((d.energy + pred) / 2) + 18}
                  fill={C.textDim} fontSize={10} fontFamily="'IBM Plex Sans'">
                  therms
                </text>
                {/* Predicted point on line */}
                <circle cx={sx(d.temp)} cy={sy(pred)} r={5} fill={C.orange} stroke={C.surface} strokeWidth={2} />
              </g>
            );
          })()}

          {/* Data points */}
          {data.map((pt, i) => (
            <circle key={i} cx={sx(pt.temp)} cy={sy(pt.energy)} r={selectedPt === i ? 7 : 5}
              fill={selectedPt === i ? C.green : C.blue} fillOpacity={0.9}
              stroke={selectedPt === i ? C.text : C.border} strokeWidth={selectedPt === i ? 2 : 1}
              style={{ cursor: "pointer" }}
              onClick={() => { setSelectedPt(i); setShowAll(false); }} />
          ))}

          {/* Axes */}
          <line x1={pad.left} x2={pad.left + cw} y1={pad.top + ch} y2={pad.top + ch} stroke={C.borderHover} />
          <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + ch} stroke={C.borderHover} />
          {tTicks.map(t => <text key={t} x={sx(t)} y={pad.top + ch + 18} textAnchor="middle" fill={C.textDim} fontSize={10}>{t}</text>)}
          {eTicks.map(t => <text key={t} x={pad.left - 10} y={sy(t) + 4} textAnchor="end" fill={C.textDim} fontSize={10}>{fmtNum(t)}</text>)}
          <text x={pad.left + cw / 2} y={pad.top + ch + 40} textAnchor="middle" fill={C.textSoft} fontSize={11} fontFamily="'IBM Plex Sans'">Temperature (°F)</text>
          <text x={14} y={pad.top + ch / 2} textAnchor="middle" fill={C.textSoft} fontSize={11} fontFamily="'IBM Plex Sans'" transform={`rotate(-90, 14, ${pad.top + ch / 2})`}>Energy (therms)</text>
        </svg>

        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <button onClick={() => { setShowAll(!showAll); }} style={{
            background: showAll ? C.blue : C.surfaceRaised, border: `1px solid ${showAll ? C.blue : C.border}`,
            borderRadius: 4, padding: "8px 16px", color: showAll ? "#fff" : C.textSoft,
            fontSize: 12, fontFamily: "'IBM Plex Sans'", cursor: "pointer", fontWeight: showAll ? 600 : 400,
          }}>{showAll ? "✓ All residuals" : "Show all residuals"}</button>
          {showAll && (
            <button onClick={() => setShowSquares(!showSquares)} style={{
              background: showSquares ? C.amber : C.surfaceRaised, border: `1px solid ${showSquares ? C.amber : C.border}`,
              borderRadius: 4, padding: "8px 16px", color: showSquares ? "#fff" : C.textSoft,
              fontSize: 12, fontFamily: "'IBM Plex Sans'", cursor: "pointer", fontWeight: showSquares ? 600 : 400,
            }}>{showSquares ? "✓ Squared errors" : "Show squared errors"}</button>
          )}
        </div>
        {showSquares && showAll && (
          <div style={{ marginTop: 8, fontSize: 11, color: C.textDim, fontFamily: "'IBM Plex Sans'", lineHeight: 1.6 }}>
            The small squares represent each residual squared. OLS minimizes the <Em>total area</Em> of all these squares. This is why it's called "least <strong>squares</strong>" — the best-fit line makes the combined area as small as possible.
          </div>
        )}
      </Panel>

      {/* Step by step calculation */}
      <Panel style={{ marginTop: 16 }}>
        <PanelLabel>Step-by-step for {d.month}</PanelLabel>
        <div style={{ display: "grid", gap: 12 }}>
          <CalcStep num="1" label="The observation" value={`At ${d.temp}°F, the building used ${d.energy.toLocaleString()} therms`} />
          <CalcStep num="2" label="The model's prediction" value={<>
            E = {intercept.toFixed(0)} + ({slope.toFixed(1)}) × {d.temp} = <strong style={{ color: C.orange }}>{predicted.toFixed(0)} therms</strong>
          </>} />
          <CalcStep num="3" label="The residual" value={<>
            {d.energy.toLocaleString()} − {predicted.toFixed(0)} = <strong style={{ color: residual > 0 ? C.green : C.red }}>{residual > 0 ? "+" : ""}{residual.toFixed(0)} therms</strong>
          </>} />
          <CalcStep num="4" label="Squared residual" value={<>
            ({residual.toFixed(0)})² = <strong style={{ color: C.amber }}>{Math.round(residual * residual).toLocaleString()}</strong> — this is the quantity OLS minimizes
          </>} />
          <CalcStep num="5" label="Interpretation" value={
            Math.abs(residual) < 50
              ? "The model was very close — nearly perfect prediction for this point."
              : residual > 0
                ? `The model underestimated by ${residual.toFixed(0)} therms. The building used more energy than the model expected at this temperature.`
                : `The model overestimated by ${Math.abs(residual).toFixed(0)} therms. The building used less energy than the model expected at this temperature.`
          } />
        </div>
      </Panel>

      <Box type="concept" title="Why residuals matter for M&V">
        <P>In M&V, your savings estimate lives inside the residuals. If the residuals are large and systematic, your savings number is unreliable. If they're small and random, the model is capturing the real pattern and the leftover noise is just weather variability, occupancy fluctuations, and measurement error.</P>
        <P style={{ marginTop: 8 }}>But "small and random" is doing a lot of work in that sentence. There are specific <Em>patterns</Em> in residuals that signal problems. The next section shows you what to look for.</P>
      </Box>

      {/* ─── RESIDUAL DIAGNOSTICS: PATTERN RECOGNITION ─── */}
      <SectionTitle style={{ marginTop: 32 }}>Reading residual patterns</SectionTitle>
      <P>Once you've fit a model, you don't just look at the R² and call it done. You <Em>plot the residuals</Em> against the independent variable and examine the pattern. A well-specified model produces residuals that look like random noise. A poorly-specified model leaves fingerprints in the residuals.</P>

      <div style={{ display: "flex", gap: 8, marginTop: 16, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          ["good", "✓ Well-behaved", C.green],
          ["hetero", "✗ Heteroskedastic", C.red],
          ["curved", "✗ Systematic pattern", C.red],
          ["scatter", "Our building data", C.blue],
        ].map(([k, label, color]) => (
          <button key={k} onClick={() => setResidualView(k)} style={{
            background: residualView === k ? color : C.surfaceRaised,
            border: `1px solid ${residualView === k ? color : C.border}`,
            borderRadius: 4, padding: "8px 16px",
            color: residualView === k ? "#fff" : C.textSoft,
            fontSize: 12, fontFamily: "'IBM Plex Sans'", cursor: "pointer",
            fontWeight: residualView === k ? 600 : 400,
          }}>{label}</button>
        ))}
      </div>

      <Panel>
        <PanelLabel>
          {residualView === "good" && "Residuals vs. temperature — constant variance, no pattern"}
          {residualView === "hetero" && "Residuals vs. temperature — variance increases with temperature"}
          {residualView === "curved" && "Residuals vs. temperature — systematic curvature (model misspecification)"}
          {residualView === "scatter" && "Residuals vs. temperature — our building data"}
        </PanelLabel>
        {(() => {
          const resData = residualView === "scatter"
            ? data.map((pt, i) => ({ temp: pt.temp, residual: residuals[i], month: pt.month }))
            : syntheticResiduals[residualView === "good" ? "good" : residualView === "hetero" ? "hetero" : "curved"];

          const localMaxR = Math.max(...resData.map(d => Math.abs(d.residual))) * 1.3;
          const localTMin = Math.min(...resData.map(d => d.temp)) - 3;
          const localTMax = Math.max(...resData.map(d => d.temp)) + 3;
          const localSx = (v) => pad.left + ((v - localTMin) / (localTMax - localTMin)) * cw;
          const localSy = (v) => pad.top + resCh / 2 - (v / localMaxR) * (resCh / 2);
          const localTTicks = makeTicks(localTMin, localTMax, 8);
          const localRTicks = makeTicks(-localMaxR, localMaxR, 5);

          // For heteroskedastic view, draw the expanding envelope
          const showEnvelope = residualView === "hetero";

          return (
            <svg width={w - 42} height={resH} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {/* Grid */}
              {localTTicks.map(t => <line key={`gx${t}`} x1={localSx(t)} x2={localSx(t)} y1={pad.top} y2={pad.top + resCh} stroke={C.border} strokeDasharray="3 3" />)}
              {localRTicks.map(t => <line key={`gy${t}`} x1={pad.left} x2={pad.left + cw} y1={localSy(t)} y2={localSy(t)} stroke={C.border} strokeDasharray="3 3" />)}

              {/* Zero line — prominent */}
              <line x1={pad.left} x2={pad.left + cw} y1={localSy(0)} y2={localSy(0)} stroke={C.text} strokeWidth={1.5} strokeOpacity={0.3} />

              {/* Expanding variance envelope for heteroskedastic */}
              {showEnvelope && (
                <g>
                  <polygon
                    points={`${localSx(localTMin)},${localSy(100)} ${localSx(localTMax)},${localSy(localMaxR * 0.8)} ${localSx(localTMax)},${localSy(-localMaxR * 0.8)} ${localSx(localTMin)},${localSy(-100)}`}
                    fill={C.red} fillOpacity={0.06}
                  />
                  <line x1={localSx(localTMin)} y1={localSy(100)} x2={localSx(localTMax)} y2={localSy(localMaxR * 0.8)} stroke={C.red} strokeWidth={1.5} strokeDasharray="6 4" strokeOpacity={0.4} />
                  <line x1={localSx(localTMin)} y1={localSy(-100)} x2={localSx(localTMax)} y2={localSy(-localMaxR * 0.8)} stroke={C.red} strokeWidth={1.5} strokeDasharray="6 4" strokeOpacity={0.4} />
                  <text x={localSx(localTMax) - 4} y={localSy(localMaxR * 0.8) - 6} textAnchor="end" fill={C.red} fontSize={10} fontFamily="'IBM Plex Sans'" fontWeight={600}>expanding variance</text>
                </g>
              )}

              {/* Curved pattern overlay */}
              {residualView === "curved" && (
                <path
                  d={(() => {
                    const pts = [];
                    for (let t = localTMin; t <= localTMax; t += 1) {
                      const v = 250 * Math.sin((t - 20) / 60 * Math.PI * 2);
                      pts.push(`${pts.length === 0 ? "M" : "L"}${localSx(t)},${localSy(v)}`);
                    }
                    return pts.join(" ");
                  })()}
                  fill="none" stroke={C.red} strokeWidth={2} strokeDasharray="8 4" strokeOpacity={0.5}
                />
              )}

              {/* Data points — bars from zero line + dots */}
              {resData.map((d, i) => {
                const barColor = d.residual > 0 ? C.blue : C.violet;
                return (
                  <g key={i}>
                    {/* Vertical bar from zero to point */}
                    <rect
                      x={localSx(d.temp) - 3}
                      y={d.residual > 0 ? localSy(d.residual) : localSy(0)}
                      width={6}
                      height={Math.abs(localSy(d.residual) - localSy(0))}
                      fill={barColor} fillOpacity={0.35} rx={1}
                    />
                    <circle cx={localSx(d.temp)} cy={localSy(d.residual)} r={4.5}
                      fill={barColor} fillOpacity={0.9} stroke={C.surface} strokeWidth={1} />
                  </g>
                );
              })}

              {/* Axes */}
              <line x1={pad.left} x2={pad.left + cw} y1={pad.top + resCh} y2={pad.top + resCh} stroke={C.borderHover} />
              <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + resCh} stroke={C.borderHover} />
              {localTTicks.map(t => <text key={t} x={localSx(t)} y={pad.top + resCh + 18} textAnchor="middle" fill={C.textDim} fontSize={10}>{t.toFixed(0)}</text>)}
              {localRTicks.filter(t => t !== 0).map(t => <text key={t} x={pad.left - 10} y={localSy(t) + 4} textAnchor="end" fill={C.textDim} fontSize={10}>{t.toFixed(0)}</text>)}
              <text x={pad.left + cw / 2} y={pad.top + resCh + 40} textAnchor="middle" fill={C.textSoft} fontSize={11} fontFamily="'IBM Plex Sans'">Temperature (°F)</text>
              <text x={14} y={pad.top + resCh / 2} textAnchor="middle" fill={C.textSoft} fontSize={11} fontFamily="'IBM Plex Sans'" transform={`rotate(-90, 14, ${pad.top + resCh / 2})`}>Residual</text>
            </svg>
          );
        })()}
      </Panel>

      {/* Diagnostic explanations */}
      {residualView === "good" && (
        <Box type="concept" title="This is what you want to see">
          <P>The residuals are scattered randomly above and below zero with roughly <Em>constant spread</Em> across all temperatures. No trends, no funneling, no clusters. This means the model has captured all the systematic structure in the data — what's left is genuinely random noise.</P>
          <P style={{ marginTop: 8 }}>When residuals look like this, the standard OLS uncertainty calculations are valid. Your CV(RMSE) means what it says, and your savings confidence interval is trustworthy.</P>
        </Box>
      )}
      {residualView === "hetero" && (
        <Box type="concept" title="Heteroskedasticity — non-constant variance">
          <P>Notice how the residuals fan out as temperature increases — the spread is narrow on the left and wide on the right. This is <Em>heteroskedasticity</Em> (Greek for "different scatter"), and it's a serious problem.</P>
          <P style={{ marginTop: 8 }}><strong>Why it matters for M&V:</strong> OLS assumes constant variance. When variance changes across the range, three things break:</P>
          <P style={{ marginTop: 6 }}>
            <strong>1. Standard errors are wrong.</strong> The t-statistics and p-values in your parameter table become unreliable. A parameter might look significant when it isn't, or vice versa.
          </P>
          <P style={{ marginTop: 4 }}>
            <strong>2. Prediction intervals are wrong.</strong> The model treats all temperatures as equally uncertain, but predictions at high temperatures are actually much less reliable than at low temperatures. Your savings uncertainty is understated where it matters most.
          </P>
          <P style={{ marginTop: 4 }}>
            <strong>3. OLS is no longer the best estimator.</strong> Weighted least squares (which gives less influence to the noisy observations) would produce a better fit.
          </P>
          <P style={{ marginTop: 8 }}><strong>What causes it in buildings?</strong> Variable occupancy at extreme temperatures, HVAC systems operating near capacity limits (nonlinear behavior), or multiple end uses with different variability at different temperatures. In cooling-dominant buildings, high-temperature months often coincide with peak occupancy variability.</P>
          <P style={{ marginTop: 8 }}><strong>What to do:</strong> First, confirm it visually (this plot). Then consider log-transforming energy, using weighted regression, or investigating whether a change-point model better captures the physics (sometimes apparent heteroskedasticity is really model misspecification).</P>
        </Box>
      )}
      {residualView === "curved" && (
        <Box type="concept" title="Systematic pattern — wrong model form">
          <P>The residuals show a clear wave: the model over-predicts in the middle and under-predicts at the extremes (or vice versa). This is a <Em>systematic pattern</Em> — the residuals are not random.</P>
          <P style={{ marginTop: 8 }}>This happens when you fit a straight line through data that is actually curved. The model is <Em>misspecified</Em> — the functional form doesn't match the physics. In M&V, this usually means you need a change-point model instead of a simple linear one, because the building's heating or cooling system creates a kink in the relationship that a straight line can't capture.</P>
          <P style={{ marginTop: 8 }}><strong>The danger:</strong> R² might still be decent (the line explains some of the variance), but the residual pattern tells you the predictions are systematically wrong at certain temperatures. If your reporting period happens to be in the temperature range where the model is biased, your savings estimate inherits that bias.</P>
        </Box>
      )}
      {residualView === "scatter" && (
        <Box type="concept" title="Our building's residuals">
          <P>These are the actual residuals from the linear model fit to our office building data. Do they look random? Is the spread constant? Or do you see a pattern that suggests a straight line isn't the right model form?</P>
          <P style={{ marginTop: 8 }}>Hint: this is a heating-dominant building. A change-point model might produce cleaner residuals than the straight line we're using here. That's exactly what you'll explore in the M&V Workbench.</P>
        </Box>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MODULE 3 — GOODNESS OF FIT
   ═══════════════════════════════════════════════════════════════════ */
function ModuleGoodnessOfFit({ userSlope, userIntercept, useOLS }) {
  const containerRef = useRef(null);
  const w = useContainerWidth(containerRef);

  const data = BUILDING_DATA;
  const ols = useMemo(() => linReg(data, "temp", "energy"), []);

  // Active model
  const slope = useOLS ? ols.slope : userSlope;
  const intercept = useOLS ? ols.intercept : userIntercept;
  const predict = (t) => intercept + slope * t;
  const residuals = data.map(d => d.energy - predict(d.temp));
  const modelLabel = useOLS ? "OLS best-fit" : "your line";

  const yMean = mean(data.map(d => d.energy));
  const SStot = data.reduce((s, d) => s + (d.energy - yMean) ** 2, 0);
  const SSres = residuals.reduce((s, r) => s + r * r, 0);
  const SSreg = SStot - SSres;
  const R2 = SStot > 0 ? 1 - SSres / SStot : 0;
  const RMSE = Math.sqrt(SSres / (data.length - 2));
  const cvRMSE = (RMSE / yMean) * 100;
  const NMBE = (residuals.reduce((a, b) => a + b, 0) / ((data.length - 2) * yMean)) * 100;

  const chartH = 300;
  const pad = { top: 20, right: 30, bottom: 50, left: 70 };
  const cw = w - pad.left - pad.right;
  const ch = chartH - pad.top - pad.bottom;
  const tMin = Math.min(...data.map(d => d.temp)) - 5;
  const tMax = Math.max(...data.map(d => d.temp)) + 5;
  const eMin = -500, eMax = 7000;
  const sx = (v) => pad.left + ((v - tMin) / (tMax - tMin)) * cw;
  const sy = (v) => pad.top + ch - ((v - eMin) / (eMax - eMin)) * ch;

  const barW = Math.min(60, (w - 120) / 3);

  return (
    <div ref={containerRef}>
      <SectionTitle>Goodness of fit — is the model good enough?</SectionTitle>
      <P>A line through data is only useful if it's accurate. We need metrics that summarize how well the model fits — single numbers that tell you whether to trust the predictions.</P>

      {/* Active model banner */}
      <div style={{ background: useOLS ? C.greenDim : C.amberDim, border: `1px solid ${useOLS ? C.green : C.amber}50`, borderRadius: 6, padding: "10px 16px", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, fontFamily: "'IBM Plex Sans', sans-serif", color: C.text }}>
          <strong>Evaluating {modelLabel}:</strong>{" "}
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: useOLS ? C.green : C.amber }}>
            E = {intercept.toFixed(0)} + ({slope.toFixed(1)}) × T
          </span>
        </div>
        <span style={{ fontSize: 10, color: C.textDim, fontFamily: "'IBM Plex Sans'" }}>Change model in Module 02</span>
      </div>

      <Box type="concept" title="Decomposing variance">
        <P>Every data point's energy deviates from the overall mean. That total deviation can be split into two parts:</P>
        <P style={{ marginTop: 8 }}>
          <strong style={{ color: C.green }}>Explained</strong> — the part the model captures (the regression line pulls the prediction away from the mean toward the data).<br />
          <strong style={{ color: C.red }}>Unexplained</strong> — the leftover residual (what the model misses).
        </P>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: C.amber, padding: "8px 0", marginTop: 8 }}>
          Total Variance = Explained + Unexplained
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: C.amber }}>
          SS_total = SS_regression + SS_residual
        </div>
      </Box>

      {/* Visual: variance bars */}
      <Panel style={{ marginTop: 20 }}>
        <PanelLabel>Variance decomposition</PanelLabel>
        <svg width={w - 42} height={180} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          {(() => {
            const total = SStot;
            const cx = (w - 42) / 2;
            const fullW = Math.min(500, w - 120);
            const regFrac = SSreg / total;
            const resFrac = SSres / total;
            const y0 = 40;
            const barH = 40;

            return (
              <>
                {/* Total bar */}
                <text x={cx - fullW / 2} y={y0 - 8} fill={C.textSoft} fontSize={11} fontFamily="'IBM Plex Sans'">Total Variance (SS_total = {Math.round(SStot).toLocaleString()})</text>
                <rect x={cx - fullW / 2} y={y0} width={fullW} height={barH} rx={4} fill={C.border} />

                {/* Explained portion */}
                <rect x={cx - fullW / 2} y={y0} width={fullW * regFrac} height={barH} rx={4} fill={C.green} fillOpacity={0.6} />
                <text x={cx - fullW / 2 + fullW * regFrac / 2} y={y0 + barH / 2 + 4} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={600}>
                  Explained: {(regFrac * 100).toFixed(1)}%
                </text>

                {/* Unexplained portion */}
                <rect x={cx - fullW / 2 + fullW * regFrac} y={y0} width={fullW * resFrac} height={barH} rx={4} fill={C.red} fillOpacity={0.5} />
                <text x={cx - fullW / 2 + fullW * regFrac + fullW * resFrac / 2} y={y0 + barH / 2 + 4} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={600}>
                  Residual: {(resFrac * 100).toFixed(1)}%
                </text>

                {/* R² label */}
                <text x={cx} y={y0 + barH + 30} textAnchor="middle" fill={C.amber} fontSize={14} fontWeight={700} fontFamily="'IBM Plex Sans'">
                  R² = {R2.toFixed(4)}
                </text>
                <text x={cx} y={y0 + barH + 50} textAnchor="middle" fill={C.textDim} fontSize={11} fontFamily="'IBM Plex Sans'">
                  R² is the fraction of total variance explained by the model
                </text>
              </>
            );
          })()}
        </svg>
      </Panel>

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginTop: 16 }}>
        <MetricExplainer label="R²" value={R2.toFixed(4)} color={C.green}
          explanation="Fraction of variance explained. R² = 0.95 means the model explains 95% of the variation in energy. The remaining 5% is unexplained noise." />
        <MetricExplainer label="RMSE" value={`${RMSE.toFixed(0)} therms`} color={C.blue}
          explanation="Root Mean Square Error. The 'typical' size of a residual, in the same units as energy. Think of it as the model's average miss." />
        <MetricExplainer label="CV(RMSE)" value={`${cvRMSE.toFixed(1)}%`} color={C.amber}
          explanation="RMSE divided by the mean, expressed as a percentage. This normalizes the error so you can compare across buildings of different sizes. ASHRAE Guideline 14 requires ≤15% for monthly models." />
        <MetricExplainer label="NMBE" value={`${NMBE.toFixed(2)}%`} color={C.orange}
          explanation="Normalized Mean Bias Error. Measures whether the model systematically over- or under-predicts. Near zero means unbiased. ASHRAE Guideline 14 requires ±5% for monthly models." />
      </div>

      <Box type="concept" title="R² is not enough">
        <P>R² is popular but misleading on its own. A model can have a high R² and still be biased, have poor predictions at extreme temperatures, or fail residual diagnostics. That's why M&V uses <Em>multiple</Em> metrics — CV(RMSE) for precision, NMBE for bias — and examines residual plots visually.</P>
        <P style={{ marginTop: 8 }}>Think of R² as a <strong>screening metric</strong>. If it's very low (below 0.5), something is fundamentally wrong. If it's high, you still need to check the other metrics before trusting the model.</P>
      </Box>

      <Box type="concept" title="Connecting back to M&V">
        <P>These metrics aren't academic exercises. In a performance contract, <strong>CV(RMSE) directly determines the uncertainty in your savings estimate.</strong> A model with CV(RMSE) of 5% gives you a tight confidence interval around savings. A model with CV(RMSE) of 14% gives you a wide one. If savings are small relative to the model error, you may not be able to statistically verify that the intervention worked at all.</P>
        <P style={{ marginTop: 8 }}>This is why getting the fundamentals right — understanding residuals, choosing the right model form, validating rigorously — isn't optional. The money is in the statistics.</P>
      </Box>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SHARED UI PRIMITIVES
   ═══════════════════════════════════════════════════════════════════ */
function SectionTitle({ children }) { return <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 20, fontWeight: 700, color: C.white, margin: "0 0 10px" }}>{children}</h2>; }
function P({ children, style = {} }) { return <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.textSoft, lineHeight: 1.7, margin: "0 0 6px", ...style }}>{children}</p>; }
function Em({ children }) { return <span style={{ color: C.amber, fontStyle: "italic" }}>{children}</span>; }

function Box({ type, title, children }) {
  const s = { concept: { bg: C.amberDim, border: C.amber + "40", accent: C.amber }, question: { bg: C.blueDim, border: C.blue + "40", accent: C.blue }, note: { bg: C.surfaceRaised, border: C.border, accent: C.textSoft } }[type] || { bg: C.surfaceRaised, border: C.border, accent: C.textSoft };
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 6, padding: "14px 18px", marginTop: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, fontFamily: "'IBM Plex Sans'", color: s.accent, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1.5 }}>{title}</div>
      {children}
    </div>
  );
}

function Panel({ children, style = {} }) { return <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: 20, ...style }}>{children}</div>; }
function PanelLabel({ children, style = {} }) { return <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "'IBM Plex Sans'", color: C.textDim, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1, ...style }}>{children}</div>; }

function Stat({ label, value, unit, color }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: 14 }}>
      <div style={{ fontSize: 10, color: C.textDim, fontFamily: "'IBM Plex Sans'", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "'IBM Plex Mono'", color: color || C.text }}>
        {value}{unit && <span style={{ fontSize: 10, fontWeight: 400, color: C.textDim, marginLeft: 4 }}>{unit}</span>}
      </div>
    </div>
  );
}

function LiveMetric({ label, value, color, tag, threshold }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.textSoft, fontFamily: "'IBM Plex Sans'" }}>{label}</span>
        {tag && <span style={{ fontSize: 9, color: C.textDim, fontFamily: "'IBM Plex Mono'", background: C.surfaceRaised, padding: "1px 6px", borderRadius: 3 }}>{tag}</span>}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'IBM Plex Mono'", color, transition: "color 0.2s" }}>{value}</div>
      {threshold && <div style={{ fontSize: 9, color: C.textDim, fontFamily: "'IBM Plex Sans'", marginTop: 2 }}>ASHRAE GL14: {threshold}</div>}
    </div>
  );
}

function MetricExplainer({ label, value, color, explanation }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: 14, cursor: "pointer" }}>
      <div style={{ fontSize: 11, fontFamily: "'IBM Plex Sans'", fontWeight: 600, color: C.textSoft, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'IBM Plex Mono'", color }}>{value}</div>
      <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>Click to learn more</div>
      {open && <div style={{ marginTop: 8, fontSize: 11, color: C.textSoft, lineHeight: 1.6, fontFamily: "'IBM Plex Sans'", borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>{explanation}</div>}
    </div>
  );
}

function CalcStep({ num, label, value }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.surfaceRaised, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.blue, flexShrink: 0 }}>{num}</div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.textDim, fontFamily: "'IBM Plex Sans'", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 13, color: C.text, fontFamily: "'IBM Plex Sans'", lineHeight: 1.6 }}>{value}</div>
      </div>
    </div>
  );
}

function Collapsible({ label, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 16 }}>
      <button onClick={() => setOpen(!open)} style={{ background: C.surfaceRaised, border: `1px solid ${C.border}`, borderRadius: open ? "6px 6px 0 0" : 6, padding: "10px 16px", color: C.textSoft, cursor: "pointer", fontSize: 12, fontFamily: "'IBM Plex Sans'", width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10, display: "inline-block", transform: open ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.15s" }}>▸</span>{label}
      </button>
      {open && <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderTop: "none", borderRadius: "0 0 6px 6px", padding: 16 }}>{children}</div>}
    </div>
  );
}
