import { useState, useRef, useEffect, useMemo } from "react";
import { CS1_BASELINE, CS1_REPORTING, CS2_BASELINE, CS2_REPORTING, HEAT_BP, COOL_BP } from "./caseStudyData.js";

const C = {
  bg: "#f5f0e8", surface: "#ffffff", surfaceRaised: "#ebe5d9",
  border: "#d4cbbf", text: "#3d3529", textSoft: "#6b5f52", textDim: "#998d7e", white: "#1a1612",
  blue: "#2c6fad", blueDim: "rgba(44,111,173,0.08)",
  green: "#16a34a", greenDim: "#dcfce7",
  red: "#dc2626", redDim: "#fef2f2",
  amber: "#a67c28", amberDim: "rgba(166,124,40,0.08)",
  teal: "#b5632e", violet: "#7c3aed", orange: "#ea580c",
};

function P({ children, style }) {
  return <p style={{ fontFamily: "'IBM Plex Sans'", fontSize: 14, color: C.textSoft, lineHeight: 1.85, margin: "0 0 14px", ...style }}>{children}</p>;
}

function Callout({ color, label, children }) {
  const bgMap = { [C.blue]: C.blueDim, [C.green]: C.greenDim, [C.amber]: C.amberDim, [C.red]: C.redDim, [C.teal]: `${C.teal}12`, [C.violet]: `${C.violet}12` };
  return (
    <div style={{ background: bgMap[color] || `${color}12`, border: `1px solid ${color}30`, borderRadius: 8, padding: "16px 20px", marginBottom: 16 }}>
      {label && <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{label}</div>}
      <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, color: C.textSoft, lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}

// ── BAR CHART ──────────────────────────────────────────────────
function MonthlyBarChart({ data, showCounterfactual, showNRA, highlightAnomaly, title, width }) {
  const canvasRef = useRef(null);
  const h = 280;
  const pad = { t: 28, r: 16, b: 48, l: 58 };
  const pw = width - pad.l - pad.r;
  const ph = h - pad.t - pad.b;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, h);

    const n = data.length;
    const barW = pw / n * 0.7;
    const gap = pw / n * 0.3;

    // Determine max value
    let maxVal = 0;
    for (const d of data) {
      const e = d.energy || d.actual || 0;
      const cf = d.counterfactual || 0;
      const nra = (showNRA && d.nra) ? d.nra : 0;
      maxVal = Math.max(maxVal, e, cf, e + nra);
    }
    maxVal = Math.ceil(maxVal / 5000) * 5000;

    const sx = (i) => pad.l + (pw / n) * i + gap / 2;
    const sy = (v) => pad.t + ph - (v / maxVal) * ph;

    // Grid lines
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 0.5;
    for (let v = 0; v <= maxVal; v += 5000) {
      ctx.beginPath(); ctx.moveTo(pad.l, sy(v)); ctx.lineTo(pad.l + pw, sy(v)); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#9ca3af";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t + ph); ctx.lineTo(pad.l + pw, pad.t + ph); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + ph); ctx.stroke();

    // Y labels
    ctx.fillStyle = C.textDim;
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.textAlign = "right";
    for (let v = 0; v <= maxVal; v += 10000) {
      ctx.fillText((v / 1000).toFixed(0) + "k", pad.l - 6, sy(v) + 3);
    }

    // Title
    ctx.fillStyle = C.text;
    ctx.font = "bold 11px 'IBM Plex Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(title, pad.l, pad.t - 10);

    // Bars
    for (let i = 0; i < n; i++) {
      const d = data[i];
      const x = sx(i);
      const energy = d.energy || d.actual || 0;

      // Anomaly highlight
      if (highlightAnomaly && d.anomaly) {
        ctx.fillStyle = `${C.red}15`;
        ctx.fillRect(x - 2, pad.t, barW + 4, ph);
        ctx.strokeStyle = C.red;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(x - 2, pad.t, barW + 4, ph);
        ctx.setLineDash([]);
      }

      if (showCounterfactual && d.counterfactual) {
        // Counterfactual bar (behind)
        const cfH = (d.counterfactual / maxVal) * ph;
        ctx.fillStyle = `${C.blue}30`;
        ctx.strokeStyle = C.blue;
        ctx.lineWidth = 1;
        ctx.fillRect(x, sy(d.counterfactual), barW, cfH);
        ctx.strokeRect(x, sy(d.counterfactual), barW, cfH);
      }

      // Actual bar
      const barH = (energy / maxVal) * ph;
      let barColor = C.teal;
      if (highlightAnomaly && d.anomaly) barColor = C.red;
      if (showNRA && d.nra > 0) {
        // Split bar: retrofit savings portion + NRA portion
        const cleanEnergy = energy - d.nra;
        const cleanH = (cleanEnergy / maxVal) * ph;
        const nraH = (d.nra / maxVal) * ph;
        ctx.fillStyle = `${C.teal}cc`;
        ctx.fillRect(x, sy(cleanEnergy), barW, cleanH);
        ctx.fillStyle = `${C.orange}cc`;
        ctx.fillRect(x, sy(cleanEnergy) - nraH, barW, nraH);
      } else {
        ctx.fillStyle = `${barColor}cc`;
        ctx.fillRect(x, sy(energy), barW, barH);
      }

      // Month label
      ctx.fillStyle = C.textDim;
      ctx.font = "9px 'IBM Plex Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(d.month, x + barW / 2, pad.t + ph + 14);

      // OAT label
      ctx.fillStyle = "#9ca3af";
      ctx.font = "8px 'IBM Plex Mono', monospace";
      ctx.fillText(d.oat + "°", x + barW / 2, pad.t + ph + 26);
    }

    // Y-axis label
    ctx.save();
    ctx.translate(12, pad.t + ph / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = C.textDim;
    ctx.font = "10px 'IBM Plex Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("kWh/month", 0, 0);
    ctx.restore();

  }, [data, showCounterfactual, showNRA, highlightAnomaly, title, width]);

  return <canvas ref={canvasRef} style={{ width, height: h, display: "block" }} />;
}

// ── SCATTER + MODEL LINE ──────────────────────────────────────
function ScatterModel({ data, excludeAnomaly, title, width, color }) {
  const canvasRef = useRef(null);
  const h = 260;
  const pad = { t: 28, r: 16, b: 42, l: 58 };
  const pw = width - pad.l - pad.r;
  const ph = h - pad.t - pad.b;

  // Fit change-point model
  const { fit, points, excluded } = useMemo(() => {
    const pts = data.map(d => ({ x: d.oat, y: d.energy, anomaly: d.anomaly }));
    const include = excludeAnomaly ? pts.filter(p => !p.anomaly) : pts;
    const excl = excludeAnomaly ? pts.filter(p => p.anomaly) : [];

    // 5P change-point regression via normal equations
    const n = include.length;
    let X = [], Y = [];
    for (const p of include) {
      X.push([1, Math.max(HEAT_BP - p.x, 0), Math.max(p.x - COOL_BP, 0)]);
      Y.push(p.y);
    }
    const k = 3;
    const XtX = Array.from({ length: k }, () => Array(k).fill(0));
    const XtY = Array(k).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < k; j++) {
        XtY[j] += X[i][j] * Y[i];
        for (let m = 0; m < k; m++) XtX[j][m] += X[i][j] * X[i][m];
      }
    }
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
    const r2 = 1 - ssRes / ssTot;
    const cvrmse = Math.sqrt(ssRes / n) / meanY * 100;

    return {
      fit: { coef, r2, cvrmse, fn: (t) => coef[0] + coef[1] * Math.max(HEAT_BP - t, 0) + coef[2] * Math.max(t - COOL_BP, 0) },
      points: include,
      excluded: excl,
    };
  }, [data, excludeAnomaly]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, h);

    const xMin = 25, xMax = 90;
    const allY = data.map(d => d.energy);
    const yMin = 0, yMax = Math.ceil(Math.max(...allY) / 5000) * 5000 + 5000;
    const sx = t => pad.l + (t - xMin) / (xMax - xMin) * pw;
    const sy = e => pad.t + ph - (e - yMin) / (yMax - yMin) * ph;

    // Grid
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 0.5;
    for (let t = 30; t <= 90; t += 10) {
      ctx.beginPath(); ctx.moveTo(sx(t), pad.t); ctx.lineTo(sx(t), pad.t + ph); ctx.stroke();
    }
    for (let e = 0; e <= yMax; e += 5000) {
      ctx.beginPath(); ctx.moveTo(pad.l, sy(e)); ctx.lineTo(pad.l + pw, sy(e)); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#9ca3af"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t + ph); ctx.lineTo(pad.l + pw, pad.t + ph); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + ph); ctx.stroke();

    // Labels
    ctx.fillStyle = C.textDim; ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    for (let t = 30; t <= 90; t += 10) ctx.fillText(t + "°F", sx(t), pad.t + ph + 16);
    ctx.textAlign = "right";
    for (let e = 0; e <= yMax; e += 10000) ctx.fillText((e / 1000).toFixed(0) + "k", pad.l - 6, sy(e) + 3);

    // Title
    ctx.fillStyle = C.text; ctx.font = "bold 11px 'IBM Plex Sans', sans-serif";
    ctx.textAlign = "left"; ctx.fillText(title, pad.l, pad.t - 10);

    // Balance point lines
    ctx.setLineDash([4, 4]); ctx.strokeStyle = "#d1d5db"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx(HEAT_BP), pad.t); ctx.lineTo(sx(HEAT_BP), pad.t + ph); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx(COOL_BP), pad.t); ctx.lineTo(sx(COOL_BP), pad.t + ph); ctx.stroke();
    ctx.setLineDash([]);

    // Model line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let t = xMin; t <= xMax; t += 0.5) {
      const e = fit.fn(t);
      const x = sx(t), y = sy(e);
      if (t === xMin) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Excluded points (red X)
    for (const p of excluded) {
      const x = sx(p.x), y = sy(p.y);
      ctx.strokeStyle = C.red; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - 5, y - 5); ctx.lineTo(x + 5, y + 5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 5, y - 5); ctx.lineTo(x - 5, y + 5); ctx.stroke();
    }

    // Included points
    for (const p of points) {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(sx(p.x), sy(p.y), 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Stats annotation
    ctx.fillStyle = C.text;
    ctx.font = "bold 10px 'IBM Plex Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(`R² = ${fit.r2.toFixed(3)}`, pad.l + pw, pad.t + 14);
    ctx.fillStyle = C.textDim;
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.fillText(`CV(RMSE) = ${fit.cvrmse.toFixed(1)}%`, pad.l + pw, pad.t + 28);

    // Axis labels
    ctx.save();
    ctx.translate(12, pad.t + ph / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = C.textDim; ctx.font = "10px 'IBM Plex Sans'";
    ctx.textAlign = "center"; ctx.fillText("kWh/month", 0, 0);
    ctx.restore();
    ctx.fillStyle = C.textDim; ctx.font = "10px 'IBM Plex Sans'";
    ctx.textAlign = "center"; ctx.fillText("Outdoor Air Temperature", pad.l + pw / 2, h - 4);

  }, [data, fit, points, excluded, title, width, color]);

  return <canvas ref={canvasRef} style={{ width, height: h, display: "block" }} />;
}

// ── SAVINGS TABLE ──────────────────────────────────────────────
function SavingsTable({ data, applyNRA, label }) {
  let totalActual = 0, totalCF = 0, totalNRA = 0, totalSavings = 0;
  const rows = data.map(d => {
    const nra = (applyNRA && d.nra) ? d.nra : 0;
    const adjusted = d.actual - nra;
    const savings = d.counterfactual - adjusted;
    totalActual += d.actual;
    totalCF += d.counterfactual;
    totalNRA += nra;
    totalSavings += savings;
    return { ...d, nra: nra, adjusted, savings };
  });

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 16, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}>
      {label && <div style={{ padding: "8px 14px", fontFamily: "'IBM Plex Sans'", fontSize: 11, fontWeight: 700, color: C.textDim, background: C.surfaceRaised, borderBottom: `1px solid ${C.border}` }}>{label}</div>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#3d3529", color: "#fff", fontSize: 10 }}>
            <th style={{ padding: "6px 10px", textAlign: "left" }}>Month</th>
            <th style={{ padding: "6px 10px", textAlign: "right" }}>Actual</th>
            {applyNRA && <th style={{ padding: "6px 10px", textAlign: "right", color: C.orange }}>NRA</th>}
            {applyNRA && <th style={{ padding: "6px 10px", textAlign: "right" }}>Adjusted</th>}
            <th style={{ padding: "6px 10px", textAlign: "right" }}>Counterfactual</th>
            <th style={{ padding: "6px 10px", textAlign: "right", color: C.green }}>Savings</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? C.surface : C.surfaceRaised, color: C.textSoft }}>
              <td style={{ padding: "5px 10px" }}>{r.month}</td>
              <td style={{ padding: "5px 10px", textAlign: "right" }}>{r.actual.toLocaleString()}</td>
              {applyNRA && <td style={{ padding: "5px 10px", textAlign: "right", color: r.nra > 0 ? C.orange : C.textDim }}>{r.nra > 0 ? `-${r.nra.toLocaleString()}` : "—"}</td>}
              {applyNRA && <td style={{ padding: "5px 10px", textAlign: "right" }}>{r.adjusted.toLocaleString()}</td>}
              <td style={{ padding: "5px 10px", textAlign: "right" }}>{r.counterfactual.toLocaleString()}</td>
              <td style={{ padding: "5px 10px", textAlign: "right", color: r.savings > 0 ? C.green : C.red, fontWeight: 600 }}>{r.savings.toLocaleString()}</td>
            </tr>
          ))}
          <tr style={{ background: "#3d3529", color: "#fff", fontWeight: 700 }}>
            <td style={{ padding: "6px 10px" }}>Total</td>
            <td style={{ padding: "6px 10px", textAlign: "right" }}>{totalActual.toLocaleString()}</td>
            {applyNRA && <td style={{ padding: "6px 10px", textAlign: "right", color: C.orange }}>{totalNRA > 0 ? `-${totalNRA.toLocaleString()}` : "—"}</td>}
            {applyNRA && <td style={{ padding: "6px 10px", textAlign: "right" }}>{(totalActual - totalNRA).toLocaleString()}</td>}
            <td style={{ padding: "6px 10px", textAlign: "right" }}>{totalCF.toLocaleString()}</td>
            <td style={{ padding: "6px 10px", textAlign: "right", color: C.green }}>{totalSavings.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}


// ── MAIN ───────────────────────────────────────────────────────
export default function CaseStudies({ onBack }) {
  const [activeCase, setActiveCase] = useState(1);
  const [cs1ShowNRA, setCs1ShowNRA] = useState(false);
  const [cs2Exclude, setCs2Exclude] = useState(false);
  const containerRef = useRef(null);
  const [width, setWidth] = useState(700);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setWidth(Math.min(e.contentRect.width, 780));
    });
    ro.observe(el);
    setWidth(Math.min(el.clientWidth, 780));
    return () => ro.disconnect();
  }, []);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #3d3529 0%, #3d3529 100%)", padding: "48px 32px 40px", borderBottom: `3px solid ${C.orange}` }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {onBack && <button onClick={onBack} style={{ background: "none", border: "none", color: "#998d7e", fontSize: 12, fontFamily: "'IBM Plex Sans'", cursor: "pointer", marginBottom: 16, padding: 0 }}>← Back to course</button>}
          <div style={{ fontSize: 10, letterSpacing: 4, color: C.orange, fontWeight: 600, textTransform: "uppercase", fontFamily: "'IBM Plex Mono'" }}>Case Studies</div>
          <h1 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 30, fontWeight: 700, color: "#fff", margin: "10px 0 0", lineHeight: 1.25 }}>Non-Routine Adjustments</h1>
          <p style={{ fontFamily: "'IBM Plex Sans'", fontSize: 15, color: "#998d7e", margin: "10px 0 0", lineHeight: 1.7 }}>
            When the world doesn't hold still for your model — adjustments in the reporting period and the baseline.
          </p>
        </div>
      </div>

      {/* Content */}
      <div ref={containerRef} style={{ maxWidth: 800, margin: "0 auto", padding: "28px 32px 80px" }}>

        {/* NRA Infographic */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 24, overflow: "hidden" }}>
          <div style={{ padding: "12px 20px", background: C.surfaceRaised, borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, fontWeight: 700, color: C.text }}>📋 Reference: Mastering Non-Routine Adjustments</div>
            <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 10, color: C.textDim }}>Source: CMVP Guide via NotebookLM</div>
          </div>
          <div style={{ padding: 12 }}>
            <img src="/nra-infographic.png" alt="Mastering Non-Routine Adjustments — CMVP Guide to M&V Accuracy" style={{ width: "100%", borderRadius: 4, display: "block" }} />
          </div>
        </div>

        {/* Case tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[
            { id: 1, label: "Case 1: Reporting Period NRA", color: C.orange },
            { id: 2, label: "Case 2: Baseline NRA", color: C.red },
          ].map(c => (
            <button key={c.id} onClick={() => setActiveCase(c.id)} style={{
              flex: 1, padding: "12px 16px", borderRadius: 8, cursor: "pointer",
              border: `2px solid ${activeCase === c.id ? c.color : C.border}`,
              background: activeCase === c.id ? `${c.color}10` : C.surface,
              fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 700,
              color: activeCase === c.id ? c.color : C.textSoft,
              transition: "all 0.15s",
            }}>{c.label}</button>
          ))}
        </div>

        {/* ═══════ CASE STUDY 1 ═══════ */}
        {activeCase === 1 && (
          <div>
            <Callout color={C.teal} label="The scenario">
              A 50,000 sq ft office building completed an LED lighting and controls retrofit in December 2023. The baseline year is January–December 2023. The reporting year is January–December 2024. In <strong>July 2024</strong>, a new server room was commissioned in the building — an additional ~8,200 kWh/month of constant load that has nothing to do with the retrofit.
            </Callout>

            <h3 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 17, fontWeight: 700, marginBottom: 12 }}>Step 1: Build the Baseline Model</h3>
            <P>
              Twelve months of utility bills plotted against average outdoor air temperature. The 5-parameter change-point model fits well — heating below 55°F, cooling above 65°F, flat base load between.
            </P>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, marginBottom: 16 }}>
              <ScatterModel data={CS1_BASELINE} title="Baseline Model (2023)" width={width - 28} color={C.teal} />
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, marginBottom: 20 }}>
              <MonthlyBarChart data={CS1_BASELINE} title="Baseline Monthly Energy (2023)" width={width - 28} />
            </div>

            <h3 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 17, fontWeight: 700, marginBottom: 12 }}>Step 2: Project the Counterfactual</h3>
            <P>
              Apply the baseline model to 2024 weather conditions to predict what the building <em>would have</em> used without the retrofit. Compare to actual metered energy. The first six months look great — clear savings.
            </P>
            <P>
              Then July hits. Suddenly actual energy <em>exceeds</em> the counterfactual. Did the retrofit fail? Did the building get worse? <strong>No — a new load appeared that the model doesn't know about.</strong>
            </P>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, marginBottom: 16 }}>
              <MonthlyBarChart data={CS1_REPORTING} showCounterfactual showNRA={cs1ShowNRA} title="Reporting Period (2024) — Actual vs. Counterfactual" width={width - 28} />
              <div style={{ display: "flex", gap: 16, marginTop: 8, paddingLeft: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, background: `${C.teal}cc`, borderRadius: 2 }} />
                  <span style={{ fontSize: 10, color: C.textDim, fontFamily: "'IBM Plex Sans'" }}>Actual{cs1ShowNRA ? " (clean)" : ""}</span>
                </div>
                {cs1ShowNRA && <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, background: `${C.orange}cc`, borderRadius: 2 }} />
                  <span style={{ fontSize: 10, color: C.textDim, fontFamily: "'IBM Plex Sans'" }}>NRA (server room)</span>
                </div>}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, background: `${C.blue}30`, border: `1px solid ${C.blue}`, borderRadius: 2 }} />
                  <span style={{ fontSize: 10, color: C.textDim, fontFamily: "'IBM Plex Sans'" }}>Counterfactual</span>
                </div>
              </div>
            </div>

            <h3 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 17, fontWeight: 700, marginBottom: 12 }}>Step 3: Apply the Non-Routine Adjustment</h3>
            <P>
              The server room load (8,200 kWh/month) is a <strong>non-routine event</strong> — a change in the facility that is independent of the retrofit and independent of weather. IPMVP requires that we identify and adjust for it.
            </P>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <button onClick={() => setCs1ShowNRA(!cs1ShowNRA)} style={{
                padding: "10px 20px", borderRadius: 6, cursor: "pointer",
                border: `2px solid ${cs1ShowNRA ? C.orange : C.border}`,
                background: cs1ShowNRA ? `${C.orange}15` : C.surface,
                fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 700,
                color: cs1ShowNRA ? C.orange : C.textSoft, transition: "all 0.15s",
              }}>
                {cs1ShowNRA ? "✓ NRA Applied — Server Room Removed" : "Apply Non-Routine Adjustment →"}
              </button>
              {cs1ShowNRA && <span style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: C.green, fontWeight: 600 }}>Savings are now clean</span>}
            </div>

            <SavingsTable data={CS1_REPORTING} applyNRA={cs1ShowNRA} label={cs1ShowNRA ? "Savings with NRA Applied" : "Savings without NRA (misleading)"} />

            <Callout color={cs1ShowNRA ? C.green : C.red} label={cs1ShowNRA ? "With adjustment" : "Without adjustment"}>
              {cs1ShowNRA
                ? "After subtracting the 8,200 kWh/month server room load from July onward, the savings pattern is consistent across all 12 months. The retrofit delivered approximately 12% savings as expected."
                : "Without the adjustment, the second half of the year shows negative savings — it looks like the building is using more energy than the counterfactual. A naïve analysis would conclude the retrofit failed. It didn't. The building changed."}
            </Callout>
          </div>
        )}

        {/* ═══════ CASE STUDY 2 ═══════ */}
        {activeCase === 2 && (
          <div>
            <Callout color={C.teal} label="The scenario">
              A 40,000 sq ft office building is being modeled for a chiller replacement project. The baseline year is 2023 — but during <strong>March and April 2023</strong>, the existing chiller failed and was replaced by temporary portable cooling units that consumed approximately 40% more energy. Do you include those months in your baseline model?
            </Callout>

            <h3 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 17, fontWeight: 700, marginBottom: 12 }}>Step 1: Plot the Baseline Data</h3>
            <P>
              Look at the bar chart. March and April jump out — they're higher than you'd expect for those shoulder-month temperatures. Now look at the scatter plot. Two points are way above the model line.
            </P>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, marginBottom: 16 }}>
              <MonthlyBarChart data={CS2_BASELINE} highlightAnomaly title="Baseline Monthly Energy (2023)" width={width - 28} />
              <div style={{ display: "flex", gap: 16, marginTop: 8, paddingLeft: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, background: `${C.teal}cc`, borderRadius: 2 }} />
                  <span style={{ fontSize: 10, color: C.textDim, fontFamily: "'IBM Plex Sans'" }}>Normal months</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, background: `${C.red}cc`, borderRadius: 2 }} />
                  <span style={{ fontSize: 10, color: C.textDim, fontFamily: "'IBM Plex Sans'" }}>Chiller failure (Mar–Apr)</span>
                </div>
              </div>
            </div>

            <h3 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 17, fontWeight: 700, marginBottom: 12 }}>Step 2: Fit the Model — With and Without Anomalies</h3>
            <P>
              If you include the anomalous months, they pull the model line up and distort the fit. The R² drops and the model overpredicts at mild temperatures. Toggle the exclusion to see the difference.
            </P>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <button onClick={() => setCs2Exclude(!cs2Exclude)} style={{
                padding: "10px 20px", borderRadius: 6, cursor: "pointer",
                border: `2px solid ${cs2Exclude ? C.green : C.border}`,
                background: cs2Exclude ? `${C.green}15` : C.surface,
                fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 700,
                color: cs2Exclude ? C.green : C.textSoft, transition: "all 0.15s",
              }}>
                {cs2Exclude ? "✓ Anomalous Months Excluded" : "Exclude Mar–Apr from Baseline →"}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
                <ScatterModel data={CS2_BASELINE} excludeAnomaly={false} title="All 12 months" width={(width - 40) / 2} color={C.red} />
              </div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
                <ScatterModel data={CS2_BASELINE} excludeAnomaly={cs2Exclude} title={cs2Exclude ? "10 months (Mar–Apr excluded)" : "All 12 months"} width={(width - 40) / 2} color={cs2Exclude ? C.green : C.red} />
              </div>
            </div>

            <Callout color={cs2Exclude ? C.green : C.amber} label={cs2Exclude ? "Clean baseline" : "Contaminated baseline"}>
              {cs2Exclude
                ? "With the two anomalous months removed, the model fits tightly on the remaining 10 data points. The R² improves and the CV(RMSE) drops. The model now represents the building's normal operation — which is what the counterfactual should predict."
                : "Including March and April inflates the model's intercept and flattens its slopes. The counterfactual will systematically overpredict energy use in mild weather — making the retrofit look better than it actually is. That's a false certainty."}
            </Callout>

            <h3 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 17, fontWeight: 700, marginBottom: 12 }}>Step 3: Impact on Reported Savings</h3>
            <P>
              The contaminated model overpredicts the counterfactual, inflating apparent savings. The clean model gives an honest answer.
            </P>

            <SavingsTable data={CS2_REPORTING} applyNRA={false} label={cs2Exclude ? "Savings (clean 10-month baseline)" : "Savings (contaminated 12-month baseline)"} />

            <Callout color={C.red} label="The lesson">
              A non-routine event in the baseline is more insidious than one in the reporting period. In the reporting period, the anomaly is visible — the data doesn't match the prediction. In the baseline, <strong>the anomaly gets baked into the model itself</strong>. The model looks fine. The R² looks acceptable. But the counterfactual is wrong, and every month of reported savings carries that error forward.
            </Callout>
          </div>
        )}

        {/* The Big Idea */}
        <div style={{ background: "linear-gradient(135deg, #3d3529, #3d3529)", borderRadius: 8, padding: "28px 28px", color: "#fff", marginTop: 32 }}>
          <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: C.orange, textTransform: "uppercase", marginBottom: 12 }}>The Big Idea</div>
          <P style={{ fontSize: 15, color: "#e2e8f0", margin: "0 0 12px" }}>
            <strong style={{ color: "#fff" }}>Non-routine adjustments are not optional corrections — they are epistemic obligations.</strong> Every M&V analysis assumes that the baseline model represents normal operation and that the reporting period captures the effect of the retrofit and nothing else. When those assumptions break, the model doesn't warn you. It just gives you the wrong answer with full confidence.
          </P>
          <P style={{ fontSize: 15, color: "#e2e8f0", margin: "0 0 12px" }}>
            Reporting period NRAs are detectable: the data deviates from the prediction. Baseline NRAs are silent: <strong style={{ color: "#fff" }}>the model absorbs them and carries them forward as false certainties</strong>.
          </P>
          <P style={{ fontSize: 15, color: "#94a3b8", margin: 0, fontStyle: "italic" }}>
            The hardest part of M&V isn't the math. It's knowing the story behind the data.
          </P>
        </div>

      </div>
    </div>
  );
}
