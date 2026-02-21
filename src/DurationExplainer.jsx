import { useState, useRef, useEffect, useMemo } from "react";
import { YEAR_2022, YEAR_2023, YEAR_2024, HEAT_BP, COOL_BP } from "./durationData.js";

const C = {
  bg: "#f8f9fb", surface: "#ffffff", surfaceRaised: "#f0f2f5",
  border: "#d8dde6", text: "#1a2332", textSoft: "#4a5568", textDim: "#8494a7",
  teal: "#0d9488", tealDim: "#ccfbf1",
  blue: "#2563eb", blueDim: "#dbeafe",
  green: "#16a34a", greenDim: "#dcfce7",
  red: "#dc2626", redDim: "#fef2f2",
  amber: "#b45309", amberDim: "#fef3c7",
  violet: "#7c3aed", orange: "#ea580c", rose: "#be185d",
};

function P({ children, style }) {
  return <p style={{ fontFamily: "'IBM Plex Sans'", fontSize: 14, color: C.textSoft, lineHeight: 1.85, margin: "0 0 14px", ...style }}>{children}</p>;
}

function Callout({ color, label, children }) {
  const bgMap = { [C.teal]: C.tealDim, [C.blue]: C.blueDim, [C.green]: C.greenDim, [C.amber]: C.amberDim, [C.red]: C.redDim };
  return (
    <div style={{ background: bgMap[color] || `${color}12`, border: `1px solid ${color}30`, borderRadius: 8, padding: "16px 20px", marginBottom: 16 }}>
      {label && <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{label}</div>}
      <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, color: C.textSoft, lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}

// ── OCCUPANCY TIMELINE ────────────────────────────────────────
function OccupancyTimeline({ selected, onSelect }) {
  const canvasRef = useRef(null);
  const w = 720, h = 180;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const pad = { l: 50, r: 20, t: 30, b: 40 };
    const pw = w - pad.l - pad.r;
    const ph = h - pad.t - pad.b;

    // All 36 months of occupancy data
    const allData = [
      ...YEAR_2022.map(d => ({ ...d, yr: 2022 })),
      ...YEAR_2023.map(d => ({ ...d, yr: 2023 })),
      ...YEAR_2024.map(d => ({ occ: d.occ, yr: 2024 })),
    ];

    const n = allData.length;
    const barW = pw / n * 0.75;

    // Grid
    ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 0.5;
    for (let v = 0; v <= 100; v += 25) {
      const y = pad.t + ph - (v / 100) * ph;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + pw, y); ctx.stroke();
    }

    // Y labels
    ctx.fillStyle = C.textDim; ctx.font = "9px 'IBM Plex Mono', monospace"; ctx.textAlign = "right";
    for (let v = 0; v <= 100; v += 25) {
      const y = pad.t + ph - (v / 100) * ph;
      ctx.fillText(v + "%", pad.l - 6, y + 3);
    }

    // Title
    ctx.fillStyle = C.text; ctx.font = "bold 11px 'IBM Plex Sans', sans-serif"; ctx.textAlign = "left";
    ctx.fillText("Building Occupancy — 36 Months", pad.l, pad.t - 12);

    // Bars
    for (let i = 0; i < n; i++) {
      const d = allData[i];
      const x = pad.l + (pw / n) * i + (pw / n - barW) / 2;
      const barH = (d.occ / 100) * ph;
      const y = pad.t + ph - barH;

      let color;
      if (d.yr === 2022) color = selected === 2022 ? C.green : "#94a3b8";
      else if (d.yr === 2023) color = selected === 2023 ? C.red : "#94a3b8";
      else color = C.blue;

      const alpha = (d.yr === selected || d.yr === 2024) ? "cc" : "40";
      ctx.fillStyle = color + alpha;
      ctx.fillRect(x, y, barW, barH);
    }

    // Year separators and labels
    ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
    [12, 24].forEach(i => {
      const x = pad.l + (pw / n) * i;
      ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, pad.t + ph); ctx.stroke();
    });
    ctx.setLineDash([]);

    ctx.font = "bold 10px 'IBM Plex Sans', sans-serif"; ctx.textAlign = "center";
    const labels = [
      { x: pad.l + (pw / n) * 6, label: "2022", sub: "88% avg", color: selected === 2022 ? C.green : "#94a3b8" },
      { x: pad.l + (pw / n) * 18, label: "2023", sub: "61% avg", color: selected === 2023 ? C.red : "#94a3b8" },
      { x: pad.l + (pw / n) * 30, label: "2024", sub: "Reporting", color: C.blue },
    ];
    for (const l of labels) {
      ctx.fillStyle = l.color;
      ctx.fillText(l.label, l.x, pad.t + ph + 16);
      ctx.font = "9px 'IBM Plex Sans', sans-serif";
      ctx.fillText(l.sub, l.x, pad.t + ph + 30);
      ctx.font = "bold 10px 'IBM Plex Sans', sans-serif";
    }

    // Selection brackets
    if (selected) {
      const startIdx = selected === 2022 ? 0 : 12;
      const x1 = pad.l + (pw / n) * startIdx;
      const x2 = pad.l + (pw / n) * (startIdx + 12);
      const bracketColor = selected === 2022 ? C.green : C.red;
      ctx.strokeStyle = bracketColor; ctx.lineWidth = 2.5; ctx.setLineDash([]);
      ctx.strokeRect(x1 - 2, pad.t - 4, x2 - x1 + 4, ph + 8);

      ctx.fillStyle = bracketColor; ctx.font = "bold 9px 'IBM Plex Sans', sans-serif";
      ctx.fillText("← SELECTED BASELINE →", (x1 + x2) / 2, pad.t - 8);
    }

  }, [selected]);

  return <canvas ref={canvasRef} style={{ width: w, height: h, display: "block", maxWidth: "100%", cursor: "pointer" }} />;
}

// ── COMPARISON BAR CHART ──────────────────────────────────────
function ComparisonChart({ selected, width }) {
  const canvasRef = useRef(null);
  const h = 300;
  const pad = { t: 30, r: 16, b: 50, l: 58 };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, h);

    const pw = width - pad.l - pad.r;
    const ph = h - pad.t - pad.b;
    const n = 12;
    const groupW = pw / n;
    const barW = groupW * 0.35;

    const cfKey = selected === 2022 ? "cf_good" : "cf_bad";
    const cfColor = selected === 2022 ? C.green : C.red;

    let maxVal = 0;
    for (const d of YEAR_2024) {
      maxVal = Math.max(maxVal, d.actual, d.cf_good, d.cf_bad);
    }
    maxVal = Math.ceil(maxVal / 5000) * 5000;

    const sy = v => pad.t + ph - (v / maxVal) * ph;

    // Grid
    ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 0.5;
    for (let v = 0; v <= maxVal; v += 10000) {
      ctx.beginPath(); ctx.moveTo(pad.l, sy(v)); ctx.lineTo(pad.l + pw, sy(v)); ctx.stroke();
    }

    // Y labels
    ctx.fillStyle = C.textDim; ctx.font = "10px 'IBM Plex Mono', monospace"; ctx.textAlign = "right";
    for (let v = 0; v <= maxVal; v += 10000) {
      ctx.fillText((v / 1000).toFixed(0) + "k", pad.l - 6, sy(v) + 3);
    }

    // Title
    ctx.fillStyle = C.text; ctx.font = "bold 11px 'IBM Plex Sans', sans-serif"; ctx.textAlign = "left";
    ctx.fillText(`Reporting Year (2024) — Using ${selected} Baseline`, pad.l, pad.t - 10);

    // Bars
    for (let i = 0; i < n; i++) {
      const d = YEAR_2024[i];
      const gx = pad.l + groupW * i;

      // Counterfactual bar
      const cfVal = d[cfKey];
      const cfH = (cfVal / maxVal) * ph;
      ctx.fillStyle = cfColor + "40";
      ctx.strokeStyle = cfColor;
      ctx.lineWidth = 1;
      ctx.fillRect(gx + 2, sy(cfVal), barW, cfH);
      ctx.strokeRect(gx + 2, sy(cfVal), barW, cfH);

      // Actual bar
      const actH = (d.actual / maxVal) * ph;
      ctx.fillStyle = C.blue + "cc";
      ctx.fillRect(gx + barW + 4, sy(d.actual), barW, actH);

      // Savings indicator
      const diff = cfVal - d.actual;
      if (Math.abs(diff) > 500) {
        const midX = gx + groupW / 2;
        const topY = Math.min(sy(cfVal), sy(d.actual));
        ctx.fillStyle = diff > 0 ? C.green : C.red;
        ctx.font = "bold 8px 'IBM Plex Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(diff > 0 ? "↓" : "↑", midX, topY - 4);
      }

      // Month label
      ctx.fillStyle = C.textDim; ctx.font = "9px 'IBM Plex Sans', sans-serif"; ctx.textAlign = "center";
      ctx.fillText(d.month, gx + groupW / 2, pad.t + ph + 14);
    }

    // Legend
    const ly = pad.t + ph + 30;
    ctx.fillStyle = cfColor + "40"; ctx.fillRect(pad.l, ly, 12, 10);
    ctx.strokeStyle = cfColor; ctx.lineWidth = 1; ctx.strokeRect(pad.l, ly, 12, 10);
    ctx.fillStyle = C.textDim; ctx.font = "10px 'IBM Plex Sans', sans-serif"; ctx.textAlign = "left";
    ctx.fillText(`Counterfactual (${selected} baseline)`, pad.l + 16, ly + 9);

    ctx.fillStyle = C.blue + "cc"; ctx.fillRect(pad.l + 220, ly, 12, 10);
    ctx.fillText("Actual (2024)", pad.l + 236, ly + 9);

    // Y axis label
    ctx.save(); ctx.translate(12, pad.t + ph / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = C.textDim; ctx.font = "10px 'IBM Plex Sans'"; ctx.textAlign = "center";
    ctx.fillText("kWh/month", 0, 0); ctx.restore();

  }, [selected, width]);

  return <canvas ref={canvasRef} style={{ width, height: h, display: "block" }} />;
}

// ── SAVINGS SUMMARY ───────────────────────────────────────────
function SavingsSummary({ selected }) {
  const cfKey = selected === 2022 ? "cf_good" : "cf_bad";
  const totalActual = YEAR_2024.reduce((s, d) => s + d.actual, 0);
  const totalCF = YEAR_2024.reduce((s, d) => s + d[cfKey], 0);
  const savings = totalCF - totalActual;
  const pct = (savings / totalCF * 100);
  const isGood = savings > 0;

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20,
    }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px 18px", textAlign: "center" }}>
        <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 10, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Counterfactual</div>
        <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 22, fontWeight: 700, color: C.text }}>{(totalCF / 1000).toFixed(0)}k</div>
        <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 10, color: C.textDim }}>kWh/yr</div>
      </div>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px 18px", textAlign: "center" }}>
        <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 10, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Actual Metered</div>
        <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 22, fontWeight: 700, color: C.blue }}>{(totalActual / 1000).toFixed(0)}k</div>
        <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 10, color: C.textDim }}>kWh/yr</div>
      </div>
      <div style={{
        background: isGood ? C.greenDim : C.redDim,
        border: `2px solid ${isGood ? C.green : C.red}`,
        borderRadius: 8, padding: "16px 18px", textAlign: "center",
      }}>
        <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 10, color: isGood ? C.green : C.red, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontWeight: 700 }}>
          {isGood ? "Savings" : "Apparent Increase"}
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 22, fontWeight: 700, color: isGood ? C.green : C.red }}>
          {isGood ? "" : "+"}{Math.abs(pct).toFixed(1)}%
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: isGood ? C.green : C.red }}>
          {savings > 0 ? "−" : "+"}{Math.abs(savings).toLocaleString()} kWh
        </div>
      </div>
    </div>
  );
}

// ── THREE CONCEPTS ────────────────────────────────────────────
function ThreeConcepts() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
      {[
        { num: "1", title: "Baseline Period", desc: "The time frame for data collection", example: '"Jan 1 – Dec 31, 2022"', color: C.teal },
        { num: "2", title: "Baseline Data", desc: "Actual measurements from that period — evidence of what DID happen", example: '"12 months of utility bills + weather"', color: C.blue },
        { num: "3", title: "Baseline Model", desc: "Mathematical relationship derived from data — tool for predicting what WOULD happen", example: '"E = 35,000 × Occ + 500×HDD + 700×CDD"', color: C.violet },
      ].map(c => (
        <div key={c.num} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px 18px", borderTop: `3px solid ${c.color}` }}>
          <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 20, fontWeight: 700, color: c.color, marginBottom: 6 }}>{c.num}</div>
          <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>{c.title}</div>
          <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: C.textSoft, lineHeight: 1.6, marginBottom: 8 }}>{c.desc}</div>
          <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10, color: C.textDim, background: C.surfaceRaised, padding: "6px 10px", borderRadius: 4 }}>{c.example}</div>
        </div>
      ))}
    </div>
  );
}

// ── MAIN ───────────────────────────────────────────────────────
export default function DurationExplainer({ onBack }) {
  const [selected, setSelected] = useState(2022);
  const containerRef = useRef(null);
  const [width, setWidth] = useState(700);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setWidth(Math.min(e.contentRect.width, 740));
    });
    ro.observe(el);
    setWidth(Math.min(el.clientWidth, 740));
    return () => ro.disconnect();
  }, []);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1a2332 0%, #2d3748 100%)", padding: "48px 32px 40px", borderBottom: `3px solid ${C.teal}` }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {onBack && <button onClick={onBack} style={{ background: "none", border: "none", color: "#8494a7", fontSize: 12, fontFamily: "'IBM Plex Sans'", cursor: "pointer", marginBottom: 16, padding: 0 }}>← Back to course</button>}
          <div style={{ fontSize: 10, letterSpacing: 4, color: C.teal, fontWeight: 600, textTransform: "uppercase", fontFamily: "'IBM Plex Mono'" }}>Counterfactual Design · Dimension 3</div>
          <h1 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 30, fontWeight: 700, color: "#fff", margin: "10px 0 0", lineHeight: 1.25 }}>Duration: Which Past Predicts the Future?</h1>
          <p style={{ fontFamily: "'IBM Plex Sans'", fontSize: 15, color: "#8494a7", margin: "10px 0 0", lineHeight: 1.7 }}>
            The baseline period isn't "the most recent 12 months." It's the slice of history most relevant to the future you're trying to predict.
          </p>
        </div>
      </div>

      {/* Content */}
      <div ref={containerRef} style={{ maxWidth: 800, margin: "0 auto", padding: "28px 32px 80px" }}>

        <h2 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Three Distinct Concepts</h2>
        <P>
          Before we can ask "how long?" we need to distinguish three things that practitioners often conflate. The baseline <em>period</em> is a window in time. The baseline <em>data</em> is what was measured during that window. The baseline <em>model</em> is the mathematical relationship extracted from that data — and it's the model, not the data, that generates the counterfactual.
        </P>

        <ThreeConcepts />

        <P>
          An M&V plan must specify all three. Getting the model right but choosing the wrong period can be worse than a mediocre model on the right period — because the model will faithfully reproduce conditions that are no longer relevant.
        </P>

        <h2 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 20, fontWeight: 700, marginBottom: 14, marginTop: 32 }}>The Question Nobody Asks</h2>

        <Callout color={C.teal} label="The conventional wisdom">
          Standard practice says: use the most recent 12 months. Capture a full year of weather variation. Get the coverage factor above 90%. Check the box.
        </Callout>

        <P>
          But this misses a deeper question: <strong>Is the most recent year representative of the future this model needs to predict?</strong>
        </P>
        <P>
          "Most recent" is a proxy for "most relevant." Usually it's a good proxy. But when the building's operating conditions have shifted — occupancy changes, schedule changes, use-type changes — the most recent data may be the <em>worst</em> predictor of what comes next. A good counterfactual designer asks: which historical period best represents the conditions the building will operate under during the reporting period?
        </P>

        <h2 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 20, fontWeight: 700, marginBottom: 14, marginTop: 32 }}>Example: The Occupancy Trap</h2>

        <Callout color={C.amber} label="The scenario">
          An 80,000 sq ft office building completed an HVAC controls retrofit in December 2023. The M&V practitioner must choose a baseline period.<br /><br />
          <strong>2022</strong>: The building was 85–92% occupied (average 88%). Normal operations, full floors, typical schedules.<br />
          <strong>2023</strong>: Hybrid work transition. Three floors closed. Occupancy dropped to 55–68% (average 61%).<br />
          <strong>2024</strong> (reporting year): Company returned to office. Occupancy is back to 87–93%. The building is operating like 2022, not 2023.
        </Callout>

        <P>
          Look at the occupancy over 36 months. The dip in 2023 is obvious. Toggle between baselines and watch what happens to the counterfactual.
        </P>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, marginBottom: 16, overflowX: "auto" }}>
          <OccupancyTimeline selected={selected} />
        </div>

        {/* Toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[
            { yr: 2022, label: "2022 Baseline (88% occupancy)", color: C.green },
            { yr: 2023, label: "2023 Baseline (61% occupancy)", color: C.red },
          ].map(b => (
            <button key={b.yr} onClick={() => setSelected(b.yr)} style={{
              flex: 1, padding: "10px 16px", borderRadius: 8, cursor: "pointer",
              border: `2px solid ${selected === b.yr ? b.color : C.border}`,
              background: selected === b.yr ? `${b.color}10` : C.surface,
              fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 700,
              color: selected === b.yr ? b.color : C.textSoft,
              transition: "all 0.15s",
            }}>{b.label}</button>
          ))}
        </div>

        <SavingsSummary selected={selected} />

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, marginBottom: 16 }}>
          <ComparisonChart selected={selected} width={width - 28} />
        </div>

        {selected === 2022 && (
          <Callout color={C.green} label="2022 baseline → correct answer">
            The 2022 baseline was trained on 88% occupancy — close to the 90% the building is running at now. The counterfactual (451k kWh) represents what the building would have used at current occupancy without the retrofit. The 9.8% savings match the engineering estimate for the HVAC controls upgrade.
          </Callout>
        )}
        {selected === 2023 && (
          <Callout color={C.red} label="2023 baseline → wrong answer">
            The 2023 baseline was trained on 61% occupancy. The model learned that this building uses ~331k kWh/year. But the building is now at 90% occupancy — of course it's using more than that. The model sees a 23% <em>increase</em> and concludes the retrofit failed. It didn't. <strong>The baseline is answering the wrong question.</strong>
          </Callout>
        )}

        <h2 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 20, fontWeight: 700, marginBottom: 14, marginTop: 32 }}>When to Reach Further Back</h2>
        <P>
          The rule isn't "always use the most recent year" or "always use the oldest year." The rule is: <strong>choose the period whose operating conditions most closely match the conditions the building will operate under during the reporting period.</strong> Sometimes that's the most recent year. Sometimes it isn't.
        </P>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px 18px" }}>
            <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, fontWeight: 700, color: C.green, textTransform: "uppercase", marginBottom: 8 }}>Reach further back when...</div>
            <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: C.textSoft, lineHeight: 1.8 }}>
              Recent year had unusual occupancy (COVID, move-in, renovation)<br />
              Recent year had construction or equipment failures<br />
              Operating schedules recently reverted to a prior pattern<br />
              Recent year had temporary use changes (surge space, event hosting)
            </div>
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px 18px" }}>
            <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, fontWeight: 700, color: C.blue, textTransform: "uppercase", marginBottom: 8 }}>Use most recent when...</div>
            <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: C.textSoft, lineHeight: 1.8 }}>
              Operations have been stable for 12+ months<br />
              No major occupancy or schedule changes<br />
              Equipment condition hasn't degraded significantly<br />
              Most recent year is the best available representation of the future
            </div>
          </div>
        </div>

        <h2 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 20, fontWeight: 700, marginBottom: 14, marginTop: 32 }}>Coverage and Completeness</h2>
        <P>
          Whichever period you choose, the baseline data must cover the full range of conditions the building will experience during the reporting period. For a weather-dependent building, this typically means a full year — capturing the heating season, cooling season, and shoulder months. ASHRAE Guideline 14 calls this a "coverage factor" of at least 90%.
        </P>
        <P>
          But coverage alone isn't enough. A year of data at 60% occupancy has excellent weather coverage — every season is represented. It just represents the wrong building. <strong>Coverage tells you the range of conditions is complete. Relevance tells you the conditions are representative.</strong>
        </P>

        <h2 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 20, fontWeight: 700, marginBottom: 14, marginTop: 32 }}>Adjustments: Routine and Non-Routine</h2>
        <P>
          Once the baseline period is chosen and the model is built, the counterfactual must be <em>adjusted</em> so that we're comparing apples to apples.
        </P>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div style={{ background: C.surface, border: `2px solid ${C.teal}`, borderRadius: 8, padding: "16px 18px" }}>
            <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 700, color: C.teal, marginBottom: 8 }}>Routine Adjustments</div>
            <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: C.textSoft, lineHeight: 1.8 }}>
              Changes in <strong>independent variables</strong> that the model already accounts for. Weather is the classic example: the model adjusts automatically when you feed it this year's temperatures. No manual intervention needed — this is what the model <em>does</em>.
            </div>
          </div>
          <div style={{ background: C.surface, border: `2px solid ${C.orange}`, borderRadius: 8, padding: "16px 18px" }}>
            <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 700, color: C.orange, marginBottom: 8 }}>Non-Routine Adjustments</div>
            <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: C.textSoft, lineHeight: 1.8 }}>
              Changes in <strong>static factors</strong> — things the model assumed wouldn't change but did. A new server room, a floor closing, extended operating hours. These must be identified, quantified, and subtracted (or added) manually.
            </div>
          </div>
        </div>

        <Callout color={C.amber} label="The relationship between duration and adjustments">
          The choice of baseline period and the burden of adjustments are inversely related. If you choose a baseline period whose conditions closely match the reporting period, you'll need fewer non-routine adjustments. If you choose a period that's convenient but unrepresentative, you'll spend the reporting period making adjustments — each one adding uncertainty.
        </Callout>

        <h2 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 20, fontWeight: 700, marginBottom: 14, marginTop: 32 }}>Three Flavors of Comparison</h2>
        <P>
          Once you have a baseline model and reporting period data, there are three ways to construct the comparison — each answering a slightly different question.
        </P>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { title: "Avoided Energy", desc: "Adjust baseline to reporting period conditions", question: '"What would we have used THIS year without the retrofit?"', color: C.teal, common: true },
            { title: "Normalized Savings", desc: "Adjust both to typical (TMY) conditions", question: '"What would savings look like in a typical year?"', color: C.blue, common: false },
            { title: "Backcasting", desc: "Adjust reporting model back to baseline conditions", question: '"What if we apply the new model to old conditions?"', color: C.violet, common: false },
          ].map(f => (
            <div key={f.title} style={{ background: C.surface, border: `1px solid ${f.common ? f.color : C.border}`, borderRadius: 8, padding: "14px 16px", borderTop: `3px solid ${f.color}` }}>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, fontWeight: 700, color: f.color, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: C.textSoft, lineHeight: 1.7, marginBottom: 8 }}>{f.desc}</div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 10, color: C.textDim, fontStyle: "italic", lineHeight: 1.5 }}>{f.question}</div>
            </div>
          ))}
        </div>

        {/* Where this course lives */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 32, marginBottom: 20 }}>
          {[
            { dim: "Boundary", val: "Whole Facility", status: "Explored", color: C.rose, link: "boundary" },
            { dim: "Model Form", val: "Statistical → Physical", status: "Explored in depth", color: C.blue },
            { dim: "Duration", val: "Relevance over recency", status: "You are here", color: C.teal, active: true },
          ].map(d => (
            <div key={d.dim} style={{
              background: d.active ? `${d.color}08` : C.surface,
              border: `2px solid ${d.active ? d.color : C.border}`,
              borderRadius: 8, padding: "16px 18px", textAlign: "center",
            }}>
              <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10, fontWeight: 600, color: d.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{d.dim}</div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{d.val}</div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: d.active ? d.color : C.textDim, fontWeight: 600 }}>{d.status}</div>
            </div>
          ))}
        </div>

        {/* The Big Idea */}
        <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", borderRadius: 8, padding: "28px 28px", color: "#fff", marginTop: 32 }}>
          <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: C.teal, textTransform: "uppercase", marginBottom: 12 }}>The Big Idea</div>
          <P style={{ fontSize: 15, color: "#e2e8f0", margin: "0 0 12px" }}>
            <strong style={{ color: "#fff" }}>Duration is not a number — it's a judgment about which past best represents the future.</strong> The conventional rule ("use the most recent 12 months") is a heuristic, not a principle. The principle is: choose the baseline period whose operating conditions are most relevant to the conditions the building will operate under during the reporting period.
          </P>
          <P style={{ fontSize: 15, color: "#e2e8f0", margin: "0 0 12px" }}>
            The same model, trained on different periods, can produce opposite conclusions — 10% savings or 23% increase — from the same metered data. <strong style={{ color: "#fff" }}>The math doesn't protect you from asking the wrong question.</strong>
          </P>
          <P style={{ fontSize: 15, color: "#94a3b8", margin: 0, fontStyle: "italic" }}>
            Don't ask "how much data do I need?" Ask "which data tells the truth about the future?"
          </P>
        </div>

      </div>
    </div>
  );
}
