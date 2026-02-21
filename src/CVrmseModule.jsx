import { useState, useMemo, useRef, useEffect, useCallback } from "react";

// ─── COLORS (matches course) ──────────────────────────────────────
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

// ─── BASE DATA (from spreadsheet) ────────────────────────────────
const BASE_DATA = [
  { temp: 57, energy: 300 },
  { temp: 58, energy: 250 },
  { temp: 63, energy: 270 },
  { temp: 69, energy: 380 },
  { temp: 73, energy: 450 },
  { temp: 79, energy: 400 },
  { temp: 67, energy: 390 },
  { temp: 55, energy: 290 },
  { temp: 45, energy: 320 },
  { temp: 44, energy: 220 },
  { temp: 35, energy: 200 },
];

// ─── MATH ─────────────────────────────────────────────────────────
function linReg(data) {
  const n = data.length;
  const xm = data.reduce((s, d) => s + d.temp, 0) / n;
  const ym = data.reduce((s, d) => s + d.energy, 0) / n;
  let ssxy = 0, ssxx = 0;
  data.forEach(d => { ssxy += (d.temp - xm) * (d.energy - ym); ssxx += (d.temp - xm) ** 2; });
  const slope = ssxy / ssxx;
  const intercept = ym - slope * xm;
  const residuals = data.map(d => d.energy - (intercept + slope * d.temp));
  const SSres = residuals.reduce((s, r) => s + r * r, 0);
  const SStot = data.reduce((s, d) => s + (d.energy - ym) ** 2, 0);
  const R2 = 1 - SSres / SStot;
  const RMSE = Math.sqrt(SSres / (n - 2));
  const cvRMSE = (RMSE / ym) * 100;
  return { slope, intercept, R2, RMSE, cvRMSE, mean: ym, residuals, SSres, SStot, n };
}

function mean(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }

// ─── RESPONSIVE WIDTH ─────────────────────────────────────────────
function useContainerWidth(ref) {
  const [w, setW] = useState(900);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new ResizeObserver(e => setW(e[0].contentRect.width));
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return w;
}

// ─── UI PRIMITIVES ────────────────────────────────────────────────
function SectionTitle({ children }) {
  return <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 18, fontWeight: 700, color: C.white, margin: "0 0 8px", letterSpacing: -0.2 }}>{children}</h2>;
}
function P({ children, style }) {
  return <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.textSoft, lineHeight: 1.75, margin: "8px 0 0", ...style }}>{children}</p>;
}
function Em({ children }) {
  return <em style={{ color: C.blue, fontStyle: "normal", fontWeight: 600 }}>{children}</em>;
}
function Box({ title, children, type = "concept" }) {
  const colors = type === "concept" ? [C.blueDim, C.blue] : type === "warning" ? [C.amberDim, C.amber] : [C.greenDim, C.green];
  return (
    <div style={{ background: colors[0], border: `1px solid ${colors[1]}35`, borderRadius: 6, padding: "14px 18px", marginTop: 14 }}>
      {title && <div style={{ fontSize: 11, fontWeight: 700, color: colors[1], textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6, fontFamily: "'IBM Plex Sans'" }}>{title}</div>}
      {children}
    </div>
  );
}
function Panel({ children, style }) {
  return <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 20, marginTop: 16, ...style }}>{children}</div>;
}
function PanelLabel({ children, style }) {
  return <div style={{ fontSize: 10, letterSpacing: 2, color: C.textDim, fontWeight: 600, textTransform: "uppercase", marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace", ...style }}>{children}</div>;
}

// ─── SCATTER CHART ────────────────────────────────────────────────
function MiniScatter({ data, reg, width, height, label, color, adder = 0, showMean }) {
  const pad = { top: 16, right: 20, bottom: 44, left: 58 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;

  const tMin = 30, tMax = 85;
  const eMin = adder > 600 ? -50 : 100;
  const eMax = adder > 600 ? adder + 600 : Math.max(600, adder + 550);
  const sx = (v) => pad.left + ((v - tMin) / (tMax - tMin)) * w;
  const sy = (v) => pad.top + h - ((v - eMin) / (eMax - eMin)) * h;

  const tTicks = [35, 45, 55, 65, 75];
  const step = (eMax - eMin) / 5;
  const eTicks = Array.from({ length: 6 }, (_, i) => Math.round(eMin + i * step));

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {/* Grid */}
      {tTicks.map(t => <line key={`gx${t}`} x1={sx(t)} x2={sx(t)} y1={pad.top} y2={pad.top + h} stroke={C.border} strokeWidth={0.5} />)}
      {eTicks.map(e => <line key={`gy${e}`} x1={pad.left} x2={pad.left + w} y1={sy(e)} y2={sy(e)} stroke={C.border} strokeWidth={0.5} />)}

      {/* Mean line */}
      {showMean && (
        <>
          <line x1={pad.left} x2={pad.left + w} y1={sy(reg.mean)} y2={sy(reg.mean)} stroke={C.amber} strokeWidth={1.5} strokeDasharray="6 4" />
          <text x={pad.left + w + 2} y={sy(reg.mean) + 4} fill={C.amber} fontSize={9} fontFamily="'IBM Plex Mono'" textAnchor="start">ȳ = {reg.mean.toFixed(0)}</text>
        </>
      )}

      {/* Regression line */}
      <line x1={sx(tMin)} y1={sy(reg.intercept + reg.slope * tMin)} x2={sx(tMax)} y2={sy(reg.intercept + reg.slope * tMax)} stroke={color} strokeWidth={2} />

      {/* Points */}
      {data.map((d, i) => (
        <circle key={i} cx={sx(d.temp)} cy={sy(d.energy)} r={5} fill={color} fillOpacity={0.7} stroke={C.white} strokeWidth={1.5} />
      ))}

      {/* Axes */}
      <line x1={pad.left} x2={pad.left + w} y1={pad.top + h} y2={pad.top + h} stroke={C.text} strokeWidth={1} strokeOpacity={0.2} />
      <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + h} stroke={C.text} strokeWidth={1} strokeOpacity={0.2} />
      {tTicks.map(t => <text key={`lx${t}`} x={sx(t)} y={pad.top + h + 16} textAnchor="middle" fill={C.textDim} fontSize={10} fontFamily="'IBM Plex Mono'">{t}°</text>)}
      {eTicks.map(e => <text key={`ly${e}`} x={pad.left - 8} y={sy(e) + 4} textAnchor="end" fill={C.textDim} fontSize={10} fontFamily="'IBM Plex Mono'">{e}</text>)}
      <text x={pad.left + w / 2} y={pad.top + h + 34} textAnchor="middle" fill={C.textDim} fontSize={10} fontFamily="'IBM Plex Sans'">Temperature (°F)</text>
      <text x={14} y={pad.top + h / 2} textAnchor="middle" fill={C.textDim} fontSize={10} fontFamily="'IBM Plex Sans'" transform={`rotate(-90, 14, ${pad.top + h / 2})`}>kWh</text>

      {/* Label */}
      <text x={pad.left + 8} y={pad.top + 14} fill={color} fontSize={12} fontWeight={700} fontFamily="'IBM Plex Sans'">{label}</text>
    </svg>
  );
}

// ─── NOISE-TO-SIGNAL BAR ──────────────────────────────────────────
function NoiseSignalBar({ rmse, mean: yMean, cvrmse, width, color, label }) {
  const barH = 32;
  const maxVal = yMean + rmse * 1.5;
  const scale = (v) => (v / maxVal) * (width - 140);
  const meanW = scale(yMean);
  const rmseW = scale(rmse);

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 10, color: C.textDim, fontFamily: "'IBM Plex Sans'", marginBottom: 4, fontWeight: 600 }}>{label}</div>
      <svg width={width} height={barH + 36}>
        {/* Signal bar */}
        <rect x={0} y={2} width={meanW} height={barH} fill={color} fillOpacity={0.15} rx={3} />
        <rect x={0} y={2} width={meanW} height={barH} fill="none" stroke={color} strokeWidth={1.5} rx={3} />
        <text x={meanW / 2} y={barH / 2 + 6} textAnchor="middle" fill={color} fontSize={11} fontWeight={700} fontFamily="'IBM Plex Mono'">
          Signal: ȳ = {yMean.toFixed(0)} kWh
        </text>

        {/* Noise bar (overlaid from right) */}
        <rect x={meanW - rmseW} y={2} width={rmseW} height={barH} fill={C.red} fillOpacity={0.2} rx={3} />
        <rect x={meanW - rmseW} y={2} width={rmseW} height={barH} fill="none" stroke={C.red} strokeWidth={1.5} strokeDasharray="4 2" rx={3} />
        {rmseW > 60 && <text x={meanW - rmseW / 2} y={barH / 2 + 6} textAnchor="middle" fill={C.red} fontSize={10} fontWeight={600} fontFamily="'IBM Plex Mono'">
          Noise: {rmse.toFixed(0)}
        </text>}

        {/* CV(RMSE) annotation */}
        <text x={meanW + 8} y={barH / 2 + 5} fill={C.text} fontSize={12} fontWeight={700} fontFamily="'IBM Plex Mono'">
          = {cvrmse.toFixed(1)}%
        </text>
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN MODULE
// ═══════════════════════════════════════════════════════════════════
export default function CVrmseModule() {
  const containerRef = useRef(null);
  const w = useContainerWidth(containerRef);
  const [adder, setAdder] = useState(400);
  const [showMean, setShowMean] = useState(true);
  const [showNoiseBars, setShowNoiseBars] = useState(false);
  const [savingsPercent, setSavingsPercent] = useState(10);
  const [section, setSection] = useState(0); // 0=explore, 1=savings, 2=implications

  // Case 1: original data
  const case1Data = BASE_DATA;
  const case1Reg = useMemo(() => linReg(case1Data), []);

  // Case 2: data + adder
  const case2Data = useMemo(() => BASE_DATA.map(d => ({ temp: d.temp, energy: d.energy + adder })), [adder]);
  const case2Reg = useMemo(() => linReg(case2Data), [adder]);

  const chartW = Math.floor((w - 24) / 2);
  const chartH = 260;

  const savings1 = case1Reg.mean * savingsPercent / 100;
  const savings2 = case2Reg.mean * savingsPercent / 100;
  const detectability1 = savings1 / case1Reg.RMSE;
  const detectability2 = savings2 / case2Reg.RMSE;

  return (
    <div ref={containerRef} style={{ maxWidth: 1100, margin: "0 auto", fontFamily: "'IBM Plex Mono', monospace" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <SectionTitle>CV(RMSE) — The Noise-to-Signal Ratio</SectionTitle>
      <P>CV(RMSE) is the single most important metric in M&V model validation. ASHRAE Guideline 14 requires it below 15% for monthly models. But what does it actually <Em>measure</Em>? And why can the same model quality produce completely different CV(RMSE) values?</P>

      <Box type="concept" title="The formula">
        <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 18, color: C.amber, padding: "8px 0", letterSpacing: 0.5 }}>
          CV(RMSE) = RMSE / ȳ × 100%
        </div>
        <P>It's a ratio. <strong style={{ color: C.red }}>RMSE</strong> (the noise — how scattered the residuals are) divided by <strong style={{ color: C.blue }}>ȳ</strong> (the signal — the average energy consumption). A model with an RMSE of 50 kWh is precise if the building uses 1,000 kWh/month, but terrible if it uses 200 kWh/month.</P>
      </Box>

      {/* ── THE EXPERIMENT ──────────────────────────────────────── */}
      <Panel>
        <PanelLabel>The experiment — same noise, different signal</PanelLabel>
        <P style={{ marginTop: 0 }}>Both charts show the <Em>same 11 data points</Em> with the <Em>same temperature relationship</Em>. The only difference: the right chart adds a constant baseload. Drag the slider to change it.</P>

        {/* Adder slider */}
        <div style={{ background: C.surfaceRaised, borderRadius: 6, padding: "14px 18px", marginTop: 14, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontFamily: "'IBM Plex Sans'", fontWeight: 600, color: C.text }}>Constant baseload adder</span>
            <span style={{ fontSize: 18, fontFamily: "'IBM Plex Mono'", fontWeight: 700, color: C.violet }}>+{adder} kWh</span>
          </div>
          <input type="range" min={0} max={1000} step={10} value={adder}
            onChange={e => setAdder(Number(e.target.value))}
            style={{ width: "100%", accentColor: C.violet }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textDim, fontFamily: "'IBM Plex Mono'" }}>
            <span>0</span><span>250</span><span>500</span><span>750</span><span>1,000 kWh</span>
          </div>
        </div>

        {/* Toggle */}
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={() => setShowMean(!showMean)} style={{
            background: showMean ? C.amberDim : C.surfaceRaised, border: `1px solid ${showMean ? C.amber : C.border}`,
            borderRadius: 4, padding: "6px 14px", fontSize: 11, fontFamily: "'IBM Plex Sans'",
            color: showMean ? C.amber : C.textSoft, cursor: "pointer", fontWeight: 600,
          }}>{showMean ? "✓" : "○"} Show mean (ȳ)</button>
          <button onClick={() => setShowNoiseBars(!showNoiseBars)} style={{
            background: showNoiseBars ? C.redDim : C.surfaceRaised, border: `1px solid ${showNoiseBars ? C.red : C.border}`,
            borderRadius: 4, padding: "6px 14px", fontSize: 11, fontFamily: "'IBM Plex Sans'",
            color: showNoiseBars ? C.red : C.textSoft, cursor: "pointer", fontWeight: 600,
          }}>{showNoiseBars ? "✓" : "○"} Show noise-to-signal bars</button>
        </div>

        {/* Side-by-side charts */}
        <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
          <div style={{ flex: 1 }}>
            <MiniScatter data={case1Data} reg={case1Reg} width={chartW} height={chartH} label="Case 1: Original" color={C.blue} showMean={showMean} />
          </div>
          <div style={{ flex: 1 }}>
            <MiniScatter data={case2Data} reg={case2Reg} width={chartW} height={chartH} label={`Case 2: +${adder} kWh`} color={C.violet} adder={adder} showMean={showMean} />
          </div>
        </div>

        {/* Noise-to-signal visualization */}
        {showNoiseBars && (
          <div style={{ marginTop: 8, padding: "0 4px" }}>
            <NoiseSignalBar rmse={case1Reg.RMSE} mean={case1Reg.mean} cvrmse={case1Reg.cvRMSE} width={w - 60} color={C.blue} label="Case 1" />
            <NoiseSignalBar rmse={case2Reg.RMSE} mean={case2Reg.mean} cvrmse={case2Reg.cvRMSE} width={w - 60} color={C.violet} label="Case 2" />
          </div>
        )}

        {/* Live metrics comparison */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 0, marginTop: 16 }}>
          <MetricCol label="Case 1 — Original" color={C.blue}
            rmse={case1Reg.RMSE} mean={case1Reg.mean} cvrmse={case1Reg.cvRMSE}
            r2={case1Reg.R2} slope={case1Reg.slope} />
          <div style={{ width: 1, background: C.border, margin: "0 12px" }} />
          <MetricCol label={`Case 2 — +${adder} kWh`} color={C.violet}
            rmse={case2Reg.RMSE} mean={case2Reg.mean} cvrmse={case2Reg.cvRMSE}
            r2={case2Reg.R2} slope={case2Reg.slope} />
        </div>
      </Panel>

      {/* ── KEY INSIGHT ─────────────────────────────────────────── */}
      <Box type="warning" title="What just happened?">
        <P style={{ marginTop: 0 }}>Adding a constant {adder} kWh to every data point:</P>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 10 }}>
          <InsightCard label="RMSE (noise)" value="Unchanged" detail={`${case1Reg.RMSE.toFixed(1)} → ${case2Reg.RMSE.toFixed(1)}`} verdict="Same scatter around the line" color={C.red} />
          <InsightCard label="R²" value="Unchanged" detail={`${case1Reg.R2.toFixed(4)} → ${case2Reg.R2.toFixed(4)}`} verdict="Same proportion of variance explained" color={C.teal} />
          <InsightCard label="CV(RMSE)" value={adder > 0 ? "Dropped" : "Same"} detail={`${case1Reg.cvRMSE.toFixed(1)}% → ${case2Reg.cvRMSE.toFixed(1)}%`} verdict={adder > 0 ? "Same noise, bigger denominator" : "No change when adder = 0"} color={C.amber} />
        </div>
        <P style={{ marginTop: 12 }}>The model didn't get better — the <Em>signal got louder</Em>. CV(RMSE) dropped from {case1Reg.cvRMSE.toFixed(1)}% to {case2Reg.cvRMSE.toFixed(1)}% purely because the mean consumption increased. The regression is equally noisy in both cases.</P>
      </Box>

      {/* ── SECTION TABS ───────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 0, marginTop: 24, borderBottom: `1px solid ${C.border}` }}>
        {["Savings detectability", "M&V implications", "When CV(RMSE) lies"].map((t, i) => (
          <button key={i} onClick={() => setSection(i)} style={{
            background: "none", border: "none", borderBottom: section === i ? `2px solid ${C.blue}` : "2px solid transparent",
            padding: "10px 18px", color: section === i ? C.blue : C.textSoft,
            fontSize: 12, fontFamily: "'IBM Plex Sans'", fontWeight: section === i ? 600 : 400, cursor: "pointer",
          }}>{t}</button>
        ))}
      </div>

      {/* ── SAVINGS DETECTABILITY ───────────────────────────────── */}
      {section === 0 && (
        <Panel>
          <PanelLabel>Can your model detect the savings?</PanelLabel>
          <P style={{ marginTop: 0 }}>If you expect {savingsPercent}% savings, is the model precise enough to see them? The ratio of expected savings to RMSE tells you. Below ~2.0, savings are buried in model noise.</P>

          <div style={{ background: C.surfaceRaised, borderRadius: 6, padding: "12px 18px", marginTop: 14, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontFamily: "'IBM Plex Sans'", fontWeight: 600, color: C.text }}>Expected savings</span>
              <span style={{ fontSize: 18, fontFamily: "'IBM Plex Mono'", fontWeight: 700, color: C.green }}>{savingsPercent}%</span>
            </div>
            <input type="range" min={2} max={30} step={1} value={savingsPercent}
              onChange={e => setSavingsPercent(Number(e.target.value))}
              style={{ width: "100%", accentColor: C.green }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textDim, fontFamily: "'IBM Plex Mono'" }}>
              <span>2%</span><span>10%</span><span>20%</span><span>30%</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
            <DetectabilityCard
              label="Case 1" color={C.blue}
              savings={savings1} rmse={case1Reg.RMSE} ratio={detectability1}
              mean={case1Reg.mean} pct={savingsPercent} />
            <DetectabilityCard
              label={`Case 2 (+${adder})`} color={C.violet}
              savings={savings2} rmse={case2Reg.RMSE} ratio={detectability2}
              mean={case2Reg.mean} pct={savingsPercent} />
          </div>

          <Box type="concept" title="The paradox">
            <P style={{ marginTop: 0 }}>Both buildings have the same model noise, but the building with higher baseload has a <Em>higher absolute savings</Em> ({savings2.toFixed(0)} vs {savings1.toFixed(0)} kWh) for the same percentage reduction. The savings-to-noise ratio is {detectability2.toFixed(1)}× vs {detectability1.toFixed(1)}× — making savings much easier to detect. This is why M&V is harder for small buildings and for ECMs that target a small slice of total consumption.</P>
          </Box>
        </Panel>
      )}

      {/* ── M&V IMPLICATIONS ───────────────────────────────────── */}
      {section === 1 && (
        <Panel>
          <PanelLabel>What this means for M&V practice</PanelLabel>

          <Box type="concept" title="1. Building size matters">
            <P style={{ marginTop: 0 }}>Large buildings (high ȳ) will almost always pass the GL14 CV(RMSE) threshold more easily — not because the model fits better, but because the denominator is larger. A 50,000 sq ft office and a 5,000 sq ft branch might have the same RMSE relative to their weather-dependent load, but very different CV(RMSE) values.</P>
          </Box>

          <Box type="concept" title="2. Baseload-heavy buildings look artificially good">
            <P style={{ marginTop: 0 }}>A building that's 70% baseload and 30% weather-dependent has a high ȳ but the model is only really fitting the 30%. CV(RMSE) is diluted by the baseload. The RMSE as a percentage of the <em>weather-dependent</em> load might be much worse than 15%.</P>
          </Box>

          <Box type="concept" title="3. The ECM matters, not just the model">
            <P style={{ marginTop: 0 }}>If the ECM targets lighting (baseload), the model just needs to track the constant. If it targets HVAC (weather-dependent), the model needs to track the slope and change point accurately. Same CV(RMSE), very different risk profiles.</P>
          </Box>

          <Box type="warning" title="4. Guideline 14's threshold is a floor, not a ceiling">
            <P style={{ marginTop: 0 }}>Meeting CV(RMSE) ≤ 15% doesn't mean the model is good enough for <em>your</em> project. The real question is: <Em>can your model detect savings of the expected magnitude with acceptable confidence?</Em> That depends on the savings-to-RMSE ratio, not CV(RMSE) alone.</P>
          </Box>
        </Panel>
      )}

      {/* ── WHEN CVRMSE LIES ───────────────────────────────────── */}
      {section === 2 && (
        <Panel>
          <PanelLabel>When CV(RMSE) is misleading</PanelLabel>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 }}>
            <ScenarioCard
              title="Looks great, isn't"
              cvrmse="4.2%"
              verdict="PASS"
              verdictColor={C.green}
              description="Large hospital, 80% baseload from 24/7 operations. The 20% weather-dependent load is poorly modeled (residuals show clear patterns), but the massive baseload inflates ȳ and suppresses CV(RMSE)."
              takeaway="Check residual plots, not just the number."
            />
            <ScenarioCard
              title="Looks bad, isn't"
              cvrmse="18.3%"
              verdict="FAIL"
              verdictColor={C.red}
              description="Small retail shop, almost entirely weather-dependent (low baseload). The model captures the temp relationship well (R² = 0.94), but the small denominator pushes CV(RMSE) above 15%."
              takeaway="Consider the context — the model may be perfectly adequate for the project."
            />
          </div>

          <Box type="warning" title="The fix: always look at RMSE in context">
            <P style={{ marginTop: 0 }}>Don't just check whether CV(RMSE) passes. Ask:</P>
            <P style={{ marginTop: 6 }}><strong>1.</strong> What is the RMSE relative to expected savings? (Savings / RMSE &gt; 2 is a rough floor.)</P>
            <P style={{ marginTop: 4 }}><strong>2.</strong> Do the residuals show patterns? (If yes, CV(RMSE) is meaningless — the model is wrong.)</P>
            <P style={{ marginTop: 4 }}><strong>3.</strong> What fraction of consumption is weather-dependent? (If &lt;30%, CV(RMSE) is being suppressed by baseload.)</P>
          </Box>
        </Panel>
      )}
    </div>
  );
}

// ─── HELPER COMPONENTS ────────────────────────────────────────────
function MetricCol({ label, color, rmse, mean: yMean, cvrmse, r2, slope }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color, fontFamily: "'IBM Plex Sans'", marginBottom: 8 }}>{label}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        <MiniMetric label="RMSE" value={rmse.toFixed(1)} unit="kWh" color={C.red} />
        <MiniMetric label="Mean (ȳ)" value={yMean.toFixed(0)} unit="kWh" color={C.amber} />
        <MiniMetric label="CV(RMSE)" value={`${cvrmse.toFixed(1)}%`} color={cvrmse <= 15 ? C.green : C.red} highlight />
        <MiniMetric label="R²" value={r2.toFixed(4)} color={C.teal} />
        <MiniMetric label="Slope" value={slope.toFixed(2)} unit="kWh/°F" color={C.textDim} />
      </div>
    </div>
  );
}

function MiniMetric({ label, value, unit, color, highlight }) {
  return (
    <div style={{ background: highlight ? `${color}10` : C.surfaceRaised, border: `1px solid ${highlight ? `${color}30` : C.border}`, borderRadius: 4, padding: "6px 10px" }}>
      <div style={{ fontSize: 9, color: C.textDim, fontFamily: "'IBM Plex Sans'", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'IBM Plex Mono'", color }}>
        {value}
        {unit && <span style={{ fontSize: 9, fontWeight: 400, color: C.textDim, marginLeft: 3 }}>{unit}</span>}
      </div>
    </div>
  );
}

function InsightCard({ label, value, detail, verdict, color }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 14px" }}>
      <div style={{ fontSize: 10, fontWeight: 600, color, fontFamily: "'IBM Plex Sans'", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'IBM Plex Mono'", color: C.text, marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono'", color: C.textDim, marginTop: 2 }}>{detail}</div>
      <div style={{ fontSize: 10, fontFamily: "'IBM Plex Sans'", color: C.textSoft, marginTop: 4, lineHeight: 1.4 }}>{verdict}</div>
    </div>
  );
}

function DetectabilityCard({ label, color, savings, rmse, ratio, mean: yMean, pct }) {
  const good = ratio >= 2;
  return (
    <div style={{ background: C.surface, border: `1px solid ${good ? C.green : C.red}40`, borderRadius: 6, padding: "14px 16px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color, fontFamily: "'IBM Plex Sans'" }}>{label}</div>
      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <div style={{ fontSize: 9, color: C.textDim, fontFamily: "'IBM Plex Sans'" }}>{pct}% of {yMean.toFixed(0)} kWh</div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'IBM Plex Mono'", color: C.green }}>{savings.toFixed(0)} kWh</div>
          <div style={{ fontSize: 9, color: C.textDim }}>Expected savings</div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: C.textDim, fontFamily: "'IBM Plex Sans'" }}>Savings / RMSE</div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'IBM Plex Mono'", color: good ? C.green : C.red }}>{ratio.toFixed(1)}×</div>
          <div style={{ fontSize: 9, color: good ? C.green : C.red, fontWeight: 600 }}>{good ? "Detectable" : "Buried in noise"}</div>
        </div>
      </div>
      {/* Visual bar */}
      <div style={{ marginTop: 10, height: 8, background: C.surfaceRaised, borderRadius: 4, position: "relative", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min(100, (savings / (rmse * 3)) * 100)}%`, background: C.green, borderRadius: 4, transition: "width 0.3s" }} />
        <div style={{ position: "absolute", top: 0, left: `${Math.min(100, (rmse / (rmse * 3)) * 100)}%`, width: 2, height: "100%", background: C.red }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: C.textDim, marginTop: 2 }}>
        <span>0</span><span style={{ color: C.red }}>RMSE = {rmse.toFixed(0)}</span><span>3× RMSE</span>
      </div>
    </div>
  );
}

function ScenarioCard({ title, cvrmse, verdict, verdictColor, description, takeaway }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "16px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "'IBM Plex Sans'" }}>{title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "'IBM Plex Mono'", color: C.text }}>{cvrmse}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: verdictColor, background: `${verdictColor}15`, padding: "2px 8px", borderRadius: 3 }}>{verdict}</span>
        </div>
      </div>
      <P style={{ marginTop: 10 }}>{description}</P>
      <div style={{ marginTop: 10, padding: "8px 12px", background: C.amberDim, borderRadius: 4, fontSize: 11, color: C.amber, fontFamily: "'IBM Plex Sans'", fontWeight: 600 }}>
        → {takeaway}
      </div>
    </div>
  );
}
