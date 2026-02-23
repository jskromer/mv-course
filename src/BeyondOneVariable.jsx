import { useState, useRef, useEffect, useMemo } from "react";
import { DATA, TOWT, HEAT_BP, COOL_BP } from "./towtData.js";

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

// Color palettes for different views
const COL_SINGLE = "#6b7280";
const COL_WD = "#2c6fad";
const COL_WE = "#f59e0b";
const COL_WD_OCC = "#2c6fad";
const COL_WD_UNOCC = "#93c5fd";
const COL_WE2 = "#fbbf24";

// Regression helpers
function linReg(pts) {
  const n = pts.length;
  if (n < 2) return { m: 0, b: 0, r2: 0 };
  let sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0;
  for (const [x, y] of pts) { sx += x; sy += y; sxx += x * x; sxy += x * y; syy += y * y; }
  const m = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const b = (sy - m * sx) / n;
  const ssTot = syy - sy * sy / n;
  const ssRes = pts.reduce((s, [x, y]) => s + (y - m * x - b) ** 2, 0);
  return { m, b, r2: ssTot > 0 ? 1 - ssRes / ssTot : 0, rmse: Math.sqrt(ssRes / n), mean: sy / n };
}

function cpPredict(t, intercept, hSlope, cSlope) {
  const ht = Math.max(HEAT_BP - t, 0);
  const ct = Math.max(t - COOL_BP, 0);
  return intercept + hSlope * ht + cSlope * ct;
}

function fitCP(pts) {
  // 5P change-point: intercept + heat_slope * max(55-t,0) + cool_slope * max(t-65,0)
  const n = pts.length;
  if (n < 3) return { intercept: 0, hSlope: 0, cSlope: 0, r2: 0, rmse: 0, mean: 0 };
  // Normal equations
  let X = [], Y = [];
  for (const [t, e] of pts) {
    X.push([1, Math.max(HEAT_BP - t, 0), Math.max(t - COOL_BP, 0)]);
    Y.push(e);
  }
  // Solve via X'X * b = X'Y
  const k = 3;
  const XtX = Array.from({ length: k }, () => Array(k).fill(0));
  const XtY = Array(k).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < k; j++) {
      XtY[j] += X[i][j] * Y[i];
      for (let m = 0; m < k; m++) XtX[j][m] += X[i][j] * X[i][m];
    }
  }
  // Solve 3x3 system (Cramer's or simple Gauss)
  const A = XtX.map(r => [...r]);
  const b = [...XtY];
  for (let i = 0; i < k; i++) {
    let max = i;
    for (let j = i + 1; j < k; j++) if (Math.abs(A[j][i]) > Math.abs(A[max][i])) max = j;
    [A[i], A[max]] = [A[max], A[i]];
    [b[i], b[max]] = [b[max], b[i]];
    for (let j = i + 1; j < k; j++) {
      const f = A[j][i] / A[i][i];
      for (let m = i; m < k; m++) A[j][m] -= f * A[i][m];
      b[j] -= f * b[i];
    }
  }
  const coef = Array(k).fill(0);
  for (let i = k - 1; i >= 0; i--) {
    coef[i] = b[i];
    for (let j = i + 1; j < k; j++) coef[i] -= A[i][j] * coef[j];
    coef[i] /= A[i][i];
  }
  const meanY = Y.reduce((a, b) => a + b, 0) / n;
  let ssTot = 0, ssRes = 0;
  for (let i = 0; i < n; i++) {
    const pred = coef[0] + coef[1] * X[i][1] + coef[2] * X[i][2];
    ssRes += (Y[i] - pred) ** 2;
    ssTot += (Y[i] - meanY) ** 2;
  }
  return { intercept: coef[0], hSlope: coef[1], cSlope: coef[2], r2: 1 - ssRes / ssTot, rmse: Math.sqrt(ssRes / n), mean: meanY };
}

// ── STEPS ──────────────────────────────────────────────────────
const STEPS = [
  {
    id: 0,
    title: "Hold Up a Straight Edge",
    subtitle: "One variable, one line",
    desc: "8,760 hourly readings of outside air temperature vs. building electricity. Most practitioners start here: fit a line to the scatter. But look at that cloud — a single line barely makes a dent.",
    causal: null,
    mechanism: "Temperature drives heating and cooling loads. That's a real mechanism. But at hourly resolution, it's clearly not the only thing going on.",
    colorMode: "single",
    modelType: "linear",
  },
  {
    id: 1,
    title: "Add Change Points",
    subtitle: "Heating and cooling knees",
    desc: "A straight line misses the V-shape. Energy rises when it's cold (heating) and when it's hot (cooling), with a flat zone between. A 5-parameter change-point model captures this — but the scatter is still enormous.",
    causal: null,
    mechanism: "Buildings have heating and cooling systems that engage at different balance points. Below 55°F the heating plant runs; above 65°F the cooling plant runs. Between them, minimal weather-driven load.",
    colorMode: "single",
    modelType: "changepoint",
  },
  {
    id: 2,
    title: "What's Hiding in the Noise?",
    subtitle: "Color by weekday vs. weekend",
    desc: "Same data, same axes — but now color reveals structure. The blue weekday cloud sits above the amber weekend cloud. There are two populations sharing one scatter plot.",
    causal: "Day type is causal: weekday occupancy drives lighting, plug loads, and HVAC scheduling. Weekend the building runs at reduced capacity.",
    mechanism: "Building schedules are set by occupancy policy. On weekdays, lights turn on, systems ramp up, people use equipment. On weekends, most of this drops away. This isn't correlation — it's a direct physical mechanism.",
    colorMode: "daytype",
    modelType: "changepoint",
  },
  {
    id: 3,
    title: "The Schedule Matters",
    subtitle: "Color by occupied vs. unoccupied hours",
    desc: "Now split weekdays into occupied (7am–6pm, dark blue) and unoccupied (light blue) hours. Three distinct populations emerge. The occupied hours have dramatically higher intercepts AND steeper slopes — more equipment running, bigger HVAC response to temperature.",
    causal: "Hour-of-day is causal: HVAC schedules, lighting, and equipment follow programmed schedules tied to building occupancy.",
    mechanism: "During occupied hours, the building has ~3× the base load (intercept ~80 vs ~27 kWh) and ~3× the temperature sensitivity (slopes ~1.8 vs ~0.6). These aren't just numbers — they reflect fans running at full speed, economizers active, and chillers staged up.",
    colorMode: "occupied",
    modelType: "changepoint_occ",
  },
  {
    id: 4,
    title: "Interactions: Different Physics by Mode",
    subtitle: "Separate slopes for each population",
    desc: "The occupied building responds to cold differently than the unoccupied building. Fitting separate temperature slopes for each population captures this interaction effect. The model jumps to R² = 0.92.",
    causal: "Interaction terms are causal when the underlying variables are causal. The heating plant capacity needed during occupied hours differs from nighttime setback — that's real physics.",
    mechanism: "At night, the building temperature floats toward setback (e.g. 60°F). During the day, it's maintained at setpoint (72°F). The same 30°F outdoor temperature demands different energy depending on when it occurs.",
    colorMode: "occupied",
    modelType: "interaction",
  },
  {
    id: 5,
    title: "TOWT: 48 Models in One",
    subtitle: "Time-of-Week and Temperature",
    desc: "The TOWT model fits a separate change-point regression for every hour of the week — 24 weekday bins and 24 weekend bins, each with its own intercept and slopes. R² = 0.994. The cloud becomes a crystal.",
    causal: "Every coefficient maps to a physical mechanism: the 8am weekday intercept reflects morning startup loads; the 2am weekend cooling slope reflects the sleeping building's shell response.",
    mechanism: "With 48 bins, each capturing a distinct operational mode, you've effectively built a statistical approximation of the building's physics. Add enough causal variables and your empirical model converges toward a physical model.",
    colorMode: "towt",
    modelType: "towt",
  },
];

// ── SCATTER PLOT ───────────────────────────────────────────────
function Scatter({ step, width }) {
  const canvasRef = useRef(null);
  const h = Math.min(420, width * 0.55);
  const pad = { t: 20, r: 20, b: 42, l: 52 };
  const pw = width - pad.l - pad.r;
  const ph = h - pad.t - pad.b;

  // Prepare colors for each point
  const colors = useMemo(() => DATA.map(([t, e, hr, dt]) => {
    const s = STEPS[step];
    if (s.colorMode === "single") return COL_SINGLE;
    if (s.colorMode === "daytype") return dt === "WD" ? COL_WD : COL_WE;
    if (s.colorMode === "occupied" || s.colorMode === "towt") {
      if (dt === "WE") return COL_WE2;
      return (hr >= 7 && hr <= 18) ? COL_WD_OCC : COL_WD_UNOCC;
    }
    return COL_SINGLE;
  }), [step]);

  // Model predictions for regression lines
  const models = useMemo(() => {
    const s = STEPS[step];
    if (s.modelType === "linear") {
      const pts = DATA.map(([t, e]) => [t, e]);
      const { m, b } = linReg(pts);
      return [{ color: "#ef4444", width: 2.5, fn: t => m * t + b }];
    }
    if (s.modelType === "changepoint") {
      const pts = DATA.map(([t, e]) => [t, e]);
      const { intercept, hSlope, cSlope } = fitCP(pts);
      return [{ color: "#ef4444", width: 2.5, fn: t => cpPredict(t, intercept, hSlope, cSlope) }];
    }
    if (s.modelType === "changepoint_occ") {
      const wd_occ = DATA.filter(([t, e, h, d]) => d === "WD" && h >= 7 && h <= 18).map(([t, e]) => [t, e]);
      const wd_un = DATA.filter(([t, e, h, d]) => d === "WD" && (h < 7 || h > 18)).map(([t, e]) => [t, e]);
      const we = DATA.filter(([t, e, h, d]) => d === "WE").map(([t, e]) => [t, e]);
      const m1 = fitCP(wd_occ), m2 = fitCP(wd_un), m3 = fitCP(we);
      return [
        { color: COL_WD_OCC, width: 2.5, fn: t => cpPredict(t, m1.intercept, m1.hSlope, m1.cSlope), dash: false },
        { color: COL_WD_UNOCC, width: 2, fn: t => cpPredict(t, m2.intercept, m2.hSlope, m2.cSlope), dash: false },
        { color: COL_WE2, width: 2, fn: t => cpPredict(t, m3.intercept, m3.hSlope, m3.cSlope), dash: false },
      ];
    }
    if (s.modelType === "interaction") {
      // Same as changepoint_occ but with separate fits
      const wd_occ = DATA.filter(([t, e, h, d]) => d === "WD" && h >= 7 && h <= 18).map(([t, e]) => [t, e]);
      const wd_un = DATA.filter(([t, e, h, d]) => d === "WD" && (h < 7 || h > 18)).map(([t, e]) => [t, e]);
      const we = DATA.filter(([t, e, h, d]) => d === "WE").map(([t, e]) => [t, e]);
      const m1 = fitCP(wd_occ), m2 = fitCP(wd_un), m3 = fitCP(we);
      return [
        { color: COL_WD_OCC, width: 2.5, fn: t => cpPredict(t, m1.intercept, m1.hSlope, m1.cSlope) },
        { color: COL_WD_UNOCC, width: 2, fn: t => cpPredict(t, m2.intercept, m2.hSlope, m2.cSlope) },
        { color: COL_WE2, width: 2, fn: t => cpPredict(t, m3.intercept, m3.hSlope, m3.cSlope) },
      ];
    }
    if (s.modelType === "towt") {
      // Show a few representative TOWT bins as lines
      const bins = ["WD_10", "WD_00", "WE_14", "WE_02"];
      const binColors = { "WD_10": COL_WD_OCC, "WD_00": COL_WD_UNOCC, "WE_14": COL_WE2, "WE_02": "#d97706" };
      return bins.map(bid => {
        const [int_, hs, cs] = TOWT[bid];
        return { color: binColors[bid], width: 2, fn: t => cpPredict(t, int_, hs, cs), label: bid };
      });
    }
    return [];
  }, [step]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, h);

    const xMin = 10, xMax = 100, yMin = 0, yMax = 170;
    const sx = t => pad.l + (t - xMin) / (xMax - xMin) * pw;
    const sy = e => pad.t + ph - (e - yMin) / (yMax - yMin) * ph;

    // Grid
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 0.5;
    for (let t = 20; t <= 100; t += 20) {
      ctx.beginPath(); ctx.moveTo(sx(t), pad.t); ctx.lineTo(sx(t), pad.t + ph); ctx.stroke();
    }
    for (let e = 0; e <= 160; e += 40) {
      ctx.beginPath(); ctx.moveTo(pad.l, sy(e)); ctx.lineTo(pad.l + pw, sy(e)); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#9ca3af";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t + ph); ctx.lineTo(pad.l + pw, pad.t + ph); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + ph); ctx.stroke();

    // Labels
    ctx.fillStyle = C.textDim;
    ctx.font = "10px 'IBM Plex Sans', sans-serif";
    ctx.textAlign = "center";
    for (let t = 20; t <= 100; t += 20) ctx.fillText(`${t}°F`, sx(t), pad.t + ph + 16);
    ctx.textAlign = "right";
    for (let e = 0; e <= 160; e += 40) ctx.fillText(e, pad.l - 6, sy(e) + 3);
    ctx.save();
    ctx.translate(12, pad.t + ph / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("Energy (kWh)", 0, 0);
    ctx.restore();
    ctx.textAlign = "center";
    ctx.fillText("Outdoor Air Temperature", pad.l + pw / 2, h - 4);

    // Balance point lines (steps 1+)
    if (step >= 1) {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx(HEAT_BP), pad.t); ctx.lineTo(sx(HEAT_BP), pad.t + ph); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx(COOL_BP), pad.t); ctx.lineTo(sx(COOL_BP), pad.t + ph); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#9ca3af";
      ctx.font = "9px 'IBM Plex Mono', monospace";
      ctx.fillText("55°F", sx(HEAT_BP), pad.t - 4);
      ctx.fillText("65°F", sx(COOL_BP), pad.t - 4);
    }

    // Points
    for (let i = 0; i < DATA.length; i++) {
      const [t, e] = DATA[i];
      ctx.fillStyle = colors[i];
      ctx.globalAlpha = step >= 5 ? 0.25 : 0.35;
      ctx.beginPath();
      ctx.arc(sx(t), sy(e), step >= 5 ? 1.8 : 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Model lines
    for (const model of models) {
      ctx.strokeStyle = model.color;
      ctx.lineWidth = model.width;
      ctx.setLineDash(model.dash === false ? [] : []);
      ctx.beginPath();
      for (let t = xMin; t <= xMax; t += 0.5) {
        const e = model.fn(t);
        const x = sx(t), y = sy(e);
        if (t === xMin) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      // Label TOWT bins
      if (model.label) {
        ctx.fillStyle = model.color;
        ctx.font = "bold 9px 'IBM Plex Mono', monospace";
        ctx.textAlign = "left";
        const labT = 92;
        ctx.fillText(model.label, sx(labT) + 4, sy(model.fn(labT)) - 4);
      }
    }

  }, [step, width, colors, models, h]);

  return <canvas ref={canvasRef} style={{ width, height: h, display: "block" }} />;
}

// ── STATS CARD ─────────────────────────────────────────────────
const STEP_STATS = [
  { r2: 0.02, cvrmse: 59.1, vars: 1, label: "OAT → linear" },
  { r2: 0.13, cvrmse: 55.7, vars: 1, label: "OAT → 5P change-point" },
  { r2: 0.34, cvrmse: 48.5, vars: 2, label: "+ Day type" },
  { r2: 0.90, cvrmse: 19.3, vars: 3, label: "+ Occupancy schedule" },
  { r2: 0.92, cvrmse: 17.1, vars: 3, label: "+ Interaction terms" },
  { r2: 0.994, cvrmse: 4.8, vars: 48, label: "TOWT (48 bins)" },
];

function StatsBadge({ label, value, unit, color, highlight }) {
  return (
    <div style={{ background: highlight ? `${color}15` : C.surfaceRaised, border: `1px solid ${highlight ? color : C.border}`, borderRadius: 6, padding: "8px 12px", textAlign: "center", minWidth: 80 }}>
      <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 18, fontWeight: 700, color: highlight ? color : C.text }}>{value}{unit}</div>
      <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 10, color: C.textDim, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function R2Bar({ steps, current }) {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 60 }}>
      {steps.map((s, i) => {
        const h = 8 + s.r2 * 50;
        const active = i <= current;
        const isCurrent = i === current;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 9, color: isCurrent ? C.blue : C.textDim, fontWeight: isCurrent ? 700 : 400 }}>
              {s.r2 < 0.1 ? s.r2.toFixed(2) : s.r2.toFixed(2)}
            </div>
            <div style={{
              width: "100%", height: h, borderRadius: 3,
              background: isCurrent ? C.blue : active ? `${C.blue}40` : `${C.border}`,
              transition: "all 0.3s",
            }} />
          </div>
        );
      })}
    </div>
  );
}

// ── LEGEND ──────────────────────────────────────────────────────
function Legend({ step }) {
  if (step <= 1) return null;
  const items = step === 2
    ? [{ color: COL_WD, label: "Weekday" }, { color: COL_WE, label: "Weekend" }]
    : [{ color: COL_WD_OCC, label: "WD Occupied" }, { color: COL_WD_UNOCC, label: "WD Unoccupied" }, { color: COL_WE2, label: "Weekend" }];
  return (
    <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
      {items.map(({ color, label }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
          <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: C.textSoft }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────
export default function BeyondOneVariable({ onBack }) {
  const [step, setStep] = useState(0);
  const containerRef = useRef(null);
  const [width, setWidth] = useState(700);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setWidth(Math.min(e.contentRect.width, 800));
    });
    ro.observe(el);
    setWidth(Math.min(el.clientWidth, 800));
    return () => ro.disconnect();
  }, []);

  const s = STEPS[step];
  const st = STEP_STATS[step];
  const cvColor = st.cvrmse <= 15 ? C.green : st.cvrmse <= 25 ? C.amber : C.red;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #3d3529 0%, #3d3529 100%)", padding: "48px 32px 40px", borderBottom: `3px solid ${C.blue}` }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {onBack && <button onClick={onBack} style={{ background: "none", border: "none", color: "#998d7e", fontSize: 12, fontFamily: "'IBM Plex Sans'", cursor: "pointer", marginBottom: 16, padding: 0 }}>← Back to course</button>}
          <div style={{ fontSize: 10, letterSpacing: 4, color: C.teal, fontWeight: 600, textTransform: "uppercase", fontFamily: "'IBM Plex Mono'" }}>Explainer</div>
          <h1 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 30, fontWeight: 700, color: "#fff", margin: "10px 0 0", lineHeight: 1.25 }}>Beyond One Variable</h1>
          <p style={{ fontFamily: "'IBM Plex Sans'", fontSize: 15, color: "#998d7e", margin: "10px 0 0", lineHeight: 1.7 }}>
            How adding causal variables transforms a cloud of noise into a crystal-clear model.
          </p>
          <p style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: "#64748b", margin: "8px 0 0" }}>
            Real hourly data · 8,760 observations · IPMVP Option C · TOWT counterfactual
          </p>
        </div>
      </div>

      {/* Content */}
      <div ref={containerRef} style={{ maxWidth: 800, margin: "0 auto", padding: "28px 32px 80px" }}>

        {/* Step navigation */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} style={{
              flex: 1, padding: "10px 4px", border: `1px solid ${i === step ? C.blue : C.border}`,
              background: i === step ? C.blue : C.surface, color: i === step ? "#fff" : C.textSoft,
              borderRadius: 6, cursor: "pointer", fontFamily: "'IBM Plex Sans'", fontSize: 11,
              fontWeight: i === step ? 700 : 400, transition: "all 0.15s",
            }}>
              <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 9, opacity: 0.7 }}>Step {i + 1}</div>
              <div style={{ marginTop: 2, lineHeight: 1.3, fontSize: 10 }}>{STEPS[i].title.split(":")[0]}</div>
            </button>
          ))}
        </div>

        {/* Title + description */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 22, fontWeight: 700, color: C.white, margin: 0 }}>{s.title}</h2>
          <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, color: C.blue, fontWeight: 600, marginTop: 2 }}>{s.subtitle}</div>
          <p style={{ fontFamily: "'IBM Plex Sans'", fontSize: 14, color: C.textSoft, lineHeight: 1.8, margin: "10px 0 0" }}>{s.desc}</p>
        </div>

        {/* Scatter plot */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <Scatter step={step} width={width - 32} />
          <Legend step={step} />
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <StatsBadge label="R²" value={st.r2 < 0.1 ? st.r2.toFixed(2) : st.r2.toFixed(st.r2 >= 0.99 ? 3 : 2)} unit="" color={C.blue} highlight />
          <StatsBadge label="CV(RMSE)" value={st.cvrmse.toFixed(1)} unit="%" color={cvColor} highlight />
          <StatsBadge label="Variables" value={st.vars} unit="" color={C.text} />
          <div style={{ flex: 1, display: "flex", alignItems: "center", paddingLeft: 8 }}>
            <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: C.textDim }}>{st.label}</span>
          </div>
        </div>

        {/* R² progression */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>R² Progression</div>
          <R2Bar steps={STEP_STATS} current={step} />
          <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
            {STEP_STATS.map((s, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", fontFamily: "'IBM Plex Sans'", fontSize: 8, color: i === step ? C.blue : C.textDim }}>{s.label.split("→").pop().trim()}</div>
            ))}
          </div>
        </div>

        {/* Causal mechanism */}
        <div style={{ display: "grid", gridTemplateColumns: s.causal ? "1fr 1fr" : "1fr", gap: 12, marginBottom: 20 }}>
          {s.causal && (
            <div style={{ background: C.greenDim, border: `1px solid ${C.green}30`, borderRadius: 8, padding: "14px 18px" }}>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>✓ Why this variable is causal</div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, color: C.textSoft, lineHeight: 1.7 }}>{s.causal}</div>
            </div>
          )}
          <div style={{ background: C.blueDim, border: `1px solid ${C.blue}30`, borderRadius: 8, padding: "14px 18px" }}>
            <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, fontWeight: 700, color: C.blue, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>⚙ Physical mechanism</div>
            <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, color: C.textSoft, lineHeight: 1.7 }}>{s.mechanism}</div>
          </div>
        </div>

        {/* Prev/Next */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 40 }}>
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} style={{
            padding: "10px 20px", borderRadius: 6, border: `1px solid ${C.border}`,
            background: step === 0 ? C.surfaceRaised : C.surface, color: step === 0 ? C.textDim : C.text,
            fontFamily: "'IBM Plex Sans'", fontSize: 13, cursor: step === 0 ? "default" : "pointer", fontWeight: 600,
          }}>← Previous</button>
          <button onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} disabled={step === STEPS.length - 1} style={{
            padding: "10px 20px", borderRadius: 6, border: "none",
            background: step === STEPS.length - 1 ? C.surfaceRaised : C.blue, color: step === STEPS.length - 1 ? C.textDim : "#fff",
            fontFamily: "'IBM Plex Sans'", fontSize: 13, cursor: step === STEPS.length - 1 ? "default" : "pointer", fontWeight: 600,
          }}>Next →</button>
        </div>

        {/* The Big Idea (always visible) */}
        <div style={{ background: "linear-gradient(135deg, #3d3529, #3d3529)", borderRadius: 8, padding: "28px 28px", color: "#fff" }}>
          <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: C.teal, textTransform: "uppercase", marginBottom: 12 }}>The Big Idea</div>
          <p style={{ fontFamily: "'IBM Plex Sans'", fontSize: 15, lineHeight: 1.8, color: "#e2e8f0", margin: 0 }}>
            Every variable you add must earn its place through <strong style={{ color: "#fff" }}>causal justification</strong> — a physical mechanism that explains <em>why</em> it drives energy consumption. Correlation alone is not enough.
          </p>
          <p style={{ fontFamily: "'IBM Plex Sans'", fontSize: 15, lineHeight: 1.8, color: "#e2e8f0", margin: "12px 0 0" }}>
            Add enough causal variables — temperature, schedule, occupancy mode, interactions between them — and your statistical model begins to approximate the building's actual physics. The boundary between an <strong style={{ color: "#fff" }}>empirical model</strong> and a <strong style={{ color: "#fff" }}>physical model</strong> isn't a wall. It's a continuum. The TOWT model sits near the far end: 48 separate regressions, each grounded in a distinct operational mode of the building.
          </p>
          <p style={{ fontFamily: "'IBM Plex Sans'", fontSize: 15, lineHeight: 1.8, color: "#94a3b8", margin: "12px 0 0", fontStyle: "italic" }}>
            The question is never "how many variables can I add?" It's "can I explain the mechanism behind each one?"
          </p>
        </div>

        {/* Data source */}
        <div style={{ marginTop: 24, padding: "14px 18px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
          <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, fontWeight: 700, color: C.textDim, marginBottom: 6 }}>About this data</div>
          <p style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: C.textDim, lineHeight: 1.7, margin: 0 }}>
            Hourly interval data from a commercial building baseline year (2023). 8,760 observations. The TOWT (Time-of-Week and Temperature) model uses 48 bins — 24 weekday hours and 24 weekend hours — each with a separate heating slope, cooling slope, and intercept. Heating balance point: 55°F. Cooling balance point: 65°F. Final model: R² = 0.994, CV(RMSE) = 4.8%.
          </p>
        </div>
      </div>
    </div>
  );
}
