import { useState, useRef, useEffect } from "react";

const C = {
  bg: "#f5f0e8", surface: "#ffffff", surfaceRaised: "#ebe5d9",
  border: "#d4cbbf", text: "#3d3529", textSoft: "#6b5f52", textDim: "#998d7e",
  rose: "#be185d", roseDim: "#fce7f3", roseMid: "#f9a8d4",
  blue: "#2c6fad", blueDim: "rgba(44,111,173,0.08)",
  green: "#16a34a", greenDim: "#dcfce7",
  amber: "#a67c28", amberDim: "rgba(166,124,40,0.08)",
  red: "#dc2626", redDim: "#fef2f2",
  teal: "#b5632e", violet: "#7c3aed", orange: "#ea580c",
};

function P({ children, style }) {
  return <p style={{ fontFamily: "'IBM Plex Sans'", fontSize: 14, color: C.textSoft, lineHeight: 1.85, margin: "0 0 14px", ...style }}>{children}</p>;
}

function Callout({ color, label, children }) {
  const bgMap = { [C.rose]: C.roseDim, [C.blue]: C.blueDim, [C.green]: C.greenDim, [C.amber]: C.amberDim, [C.red]: C.redDim, [C.teal]: `${C.teal}12`, [C.violet]: `${C.violet}12` };
  return (
    <div style={{ background: bgMap[color] || `${color}12`, border: `1px solid ${color}30`, borderRadius: 8, padding: "16px 20px", marginBottom: 16 }}>
      {label && <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{label}</div>}
      <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, color: C.textSoft, lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}

// ── INTERACTIVE BUILDING DIAGRAM ──────────────────────────────
function BuildingDiagram({ mode }) {
  const canvasRef = useRef(null);
  const w = 680, h = 440;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const isWhole = mode === "whole";
    const isIso = mode === "isolation";

    // ── Building outline ──
    const bx = 140, by = 40, bw = 400, bh = 340;
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeRect(bx, by, bw, bh);

    // Roof
    ctx.beginPath();
    ctx.moveTo(bx - 10, by);
    ctx.lineTo(bx + bw / 2, by - 30);
    ctx.lineTo(bx + bw + 10, by);
    ctx.closePath();
    ctx.fillStyle = "#e2e8f0";
    ctx.fill();
    ctx.stroke();

    // Building label
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px 'IBM Plex Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("50,000 SQ FT OFFICE BUILDING", bx + bw / 2, by - 34);

    // ── Internal systems ──
    const systems = [
      { name: "Lighting", sub: "LED + Controls", x: 160, y: 70, w: 160, h: 90, color: "#fbbf24", icon: "💡" },
      { name: "HVAC", sub: "Chiller + AHUs", x: 360, y: 70, w: 160, h: 90, color: "#60a5fa", icon: "❄️" },
      { name: "Plug Loads", sub: "Offices + IT", x: 160, y: 190, w: 160, h: 80, color: "#a78bfa", icon: "🔌" },
      { name: "Server Room", sub: "24/7 Operation", x: 360, y: 190, w: 160, h: 80, color: "#f87171", icon: "🖥️" },
    ];

    for (const s of systems) {
      const isTarget = isIso && s.name === "Lighting";
      ctx.fillStyle = isTarget ? `${C.rose}18` : "#ffffff";
      ctx.strokeStyle = isTarget ? C.rose : "#cbd5e1";
      ctx.lineWidth = isTarget ? 2.5 : 1;
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.strokeRect(s.x, s.y, s.w, s.h);

      ctx.font = "18px serif";
      ctx.textAlign = "center";
      ctx.fillText(s.icon, s.x + s.w / 2, s.y + 30);

      ctx.fillStyle = C.text;
      ctx.font = "bold 12px 'IBM Plex Sans', sans-serif";
      ctx.fillText(s.name, s.x + s.w / 2, s.y + 50);

      ctx.fillStyle = C.textDim;
      ctx.font = "10px 'IBM Plex Sans', sans-serif";
      ctx.fillText(s.sub, s.x + s.w / 2, s.y + 65);
    }

    // ── Interactive effects arrows ──
    if (isWhole || mode === "both") {
      // Lighting → HVAC arrow (interactive effect)
      ctx.save();
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(320, 115);
      ctx.lineTo(360, 115);
      ctx.stroke();
      // Arrowhead
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(360, 115);
      ctx.lineTo(353, 110);
      ctx.lineTo(353, 120);
      ctx.closePath();
      ctx.fillStyle = "#f59e0b";
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = "#f59e0b";
      ctx.font = "italic 9px 'IBM Plex Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("less heat = less cooling", 340, 105);
    }

    // ── Utility meter ──
    const mx = 50, my = 180;
    ctx.fillStyle = isWhole ? `${C.rose}20` : "#f1f5f9";
    ctx.strokeStyle = isWhole ? C.rose : "#94a3b8";
    ctx.lineWidth = isWhole ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.arc(mx, my, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isWhole ? C.rose : C.text;
    ctx.font = "bold 11px 'IBM Plex Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Utility", mx, my - 4);
    ctx.fillText("Meter", mx, my + 10);

    // Wire from meter to building
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(mx + 28, my);
    ctx.lineTo(bx, my);
    ctx.stroke();

    // ── Sub-meter on lighting panel ──
    if (isIso) {
      const smx = 160, smy = 160;
      ctx.fillStyle = `${C.rose}20`;
      ctx.strokeStyle = C.rose;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(smx, smy + 14, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = C.rose;
      ctx.font = "bold 8px 'IBM Plex Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("M2", smx, smy + 17);

      // Label
      ctx.fillStyle = C.rose;
      ctx.font = "bold 10px 'IBM Plex Sans', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Sub-meter", smx + 16, smy + 18);
    }

    // ── Measurement boundary ──
    ctx.setLineDash([8, 5]);
    ctx.lineWidth = 3;

    if (isWhole) {
      ctx.strokeStyle = C.rose;
      ctx.strokeRect(bx - 12, by - 12, bw + 24, bh + 24);

      ctx.setLineDash([]);
      ctx.fillStyle = C.rose;
      ctx.font = "bold 12px 'IBM Plex Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("MEASUREMENT BOUNDARY", bx + bw / 2, bh + by + 30);

      ctx.font = "10px 'IBM Plex Sans', sans-serif";
      ctx.fillStyle = C.textDim;
      ctx.fillText("Everything inside is measured. Nothing is isolated.", bx + bw / 2, bh + by + 46);
    } else if (isIso) {
      ctx.strokeStyle = C.rose;
      ctx.strokeRect(152, 62, 176, 106);

      ctx.setLineDash([]);
      ctx.fillStyle = C.rose;
      ctx.font = "bold 12px 'IBM Plex Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("MEASUREMENT BOUNDARY", 240, 184);

      ctx.font = "10px 'IBM Plex Sans', sans-serif";
      ctx.fillStyle = C.textDim;
      ctx.fillText("Only lighting is measured. Everything else is excluded.", 340, 394);
    }

    // ── Single-line diagram hint ──
    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px 'IBM Plex Mono', monospace";
    ctx.textAlign = "left";
    ctx.setLineDash([]);

    // Vertical riser
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx + 5, by + 10);
    ctx.lineTo(bx + 5, by + bh - 10);
    ctx.stroke();

    // Branch taps
    const taps = [85, 155, 205, 255];
    for (const ty of taps) {
      ctx.beginPath();
      ctx.moveTo(bx + 5, ty);
      ctx.lineTo(bx + 20, ty);
      ctx.stroke();
    }

    // Panel labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "8px 'IBM Plex Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("Panel A", bx + 8, 80);
    ctx.fillText("Panel B", bx + 8, 150);
    ctx.fillText("Panel C", bx + 8, 200);
    ctx.fillText("Panel D", bx + 8, 250);

    // ── What the meter "sees" ──
    const seeY = 310;
    ctx.fillStyle = C.text;
    ctx.font = "bold 11px 'IBM Plex Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("What the meter sees:", 170, seeY);

    if (isWhole) {
      const items = ["Lighting savings ✓", "HVAC interactive effects ✓", "Plug load changes ✓", "Server room addition ✓"];
      ctx.font = "11px 'IBM Plex Sans', sans-serif";
      for (let i = 0; i < items.length; i++) {
        ctx.fillStyle = C.green;
        ctx.fillText(items[i], 170 + (i < 2 ? 0 : 210), seeY + 18 + (i % 2) * 18);
      }
      ctx.fillStyle = C.amber;
      ctx.font = "italic 10px 'IBM Plex Sans', sans-serif";
      ctx.fillText("...but can't separate them.", 170, seeY + 58);
    } else if (isIso) {
      ctx.font = "11px 'IBM Plex Sans', sans-serif";
      ctx.fillStyle = C.green;
      ctx.fillText("Lighting kW + hours ✓", 170, seeY + 18);
      ctx.fillStyle = C.red;
      ctx.fillText("HVAC interactive effects ✗", 170, seeY + 36);
      ctx.fillText("Plug loads ✗", 380, seeY + 18);
      ctx.fillText("Server room ✗", 380, seeY + 36);
      ctx.fillStyle = C.amber;
      ctx.font = "italic 10px 'IBM Plex Sans', sans-serif";
      ctx.fillText("Clean signal — but misses the ripple effects.", 170, seeY + 58);
    }

  }, [mode]);

  return <canvas ref={canvasRef} style={{ width: w, height: h, display: "block", maxWidth: "100%" }} />;
}

// ── COMPARISON TABLE ──────────────────────────────────────────
function ComparisonTable() {
  const rows = [
    { dim: "Meter location", wf: "Utility billing meter", ri: "Sub-meter on target system" },
    { dim: "What you capture", wf: "All savings + all noise", ri: "ECM savings only (if isolated)" },
    { dim: "Interactive effects", wf: "Captured automatically", ri: "Missed — must estimate or model" },
    { dim: "Non-routine adjustments", wf: "More frequent, more complex", ri: "Less frequent (tighter boundary)" },
    { dim: "Attribution", wf: "Cannot separate individual ECMs", ri: "Clear attribution to specific ECM" },
    { dim: "Metering cost", wf: "Often zero (existing meter)", ri: "Sub-metering required" },
    { dim: "Model type", wf: "Statistical (Option C) or Physical (Option D)", ri: "Key parameter (Option A) or All parameter (Option B)" },
    { dim: "Best for", wf: "Multiple ECMs, utility-bill projects, NMEC", ri: "Single ECM, performance contracting, isolated systems" },
  ];

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 20, fontSize: 12, fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#3d3529" }}>
            <th style={{ padding: "10px 14px", textAlign: "left", color: "#fff", fontSize: 11, width: "22%" }}></th>
            <th style={{ padding: "10px 14px", textAlign: "left", color: C.blue, fontSize: 11, width: "39%" }}>Whole Facility</th>
            <th style={{ padding: "10px 14px", textAlign: "left", color: C.rose, fontSize: 11, width: "39%" }}>Retrofit Isolation</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? C.surface : C.surfaceRaised }}>
              <td style={{ padding: "8px 14px", fontWeight: 600, color: C.text, fontSize: 11 }}>{r.dim}</td>
              <td style={{ padding: "8px 14px", color: C.textSoft, lineHeight: 1.6 }}>{r.wf}</td>
              <td style={{ padding: "8px 14px", color: C.textSoft, lineHeight: 1.6 }}>{r.ri}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── IPMVP OPTIONS GRID ────────────────────────────────────────
function OptionsGrid() {
  const options = [
    { letter: "A", name: "Key Parameter Measurement", boundary: "Retrofit Isolation", method: "Measure key parameters, estimate the rest", example: "Measure lighting watts, stipulate hours", color: C.amber },
    { letter: "B", name: "All Parameter Measurement", boundary: "Retrofit Isolation", method: "Measure all parameters continuously", example: "Sub-meter on chiller: kW, flow, temps", color: C.orange },
    { letter: "C", name: "Whole Facility — Statistical", boundary: "Whole Facility", method: "Statistical model of utility meter data", example: "Monthly bills + weather → regression model", color: C.blue },
    { letter: "D", name: "Whole Facility — Physical", boundary: "Whole Facility", method: "Calibrated simulation (EnergyPlus, etc.)", example: "Physics model calibrated to measured data", color: C.violet },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
      {options.map(o => (
        <div key={o.letter} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px 18px", borderTop: `3px solid ${o.color}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${o.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono'", fontWeight: 700, fontSize: 14, color: o.color }}>{o.letter}</div>
            <div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 700, color: C.text }}>{o.name}</div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 10, color: o.color, fontWeight: 600 }}>{o.boundary}</div>
            </div>
          </div>
          <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, color: C.textSoft, lineHeight: 1.7, marginBottom: 8 }}>{o.method}</div>
          <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10, color: C.textDim, background: C.surfaceRaised, padding: "6px 10px", borderRadius: 4 }}>{o.example}</div>
        </div>
      ))}
    </div>
  );
}

// ── INTERACTIVE EFFECTS DIAGRAM ───────────────────────────────
function InteractiveEffects() {
  const canvasRef = useRef(null);
  const w = 660, h = 200;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // Three boxes: Lighting → HVAC → Total
    const boxes = [
      { x: 20, label: "LED Retrofit", sub: "−30,000 kWh/yr", sub2: "Less heat into space", color: "#fbbf24" },
      { x: 240, label: "HVAC Impact", sub: "−8,500 kWh/yr", sub2: "Less cooling needed", color: "#60a5fa" },
      { x: 460, label: "Total Savings", sub: "−38,500 kWh/yr", sub2: "Only visible at whole facility", color: C.green },
    ];

    for (const b of boxes) {
      ctx.fillStyle = `${b.color}15`;
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 2;
      const bw = 180, bh = 110, by = 40;

      // Rounded rect
      ctx.beginPath();
      ctx.roundRect(b.x, by, bw, bh, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = C.text;
      ctx.font = "bold 13px 'IBM Plex Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(b.label, b.x + bw / 2, by + 35);

      ctx.fillStyle = b.color;
      ctx.font = "bold 16px 'IBM Plex Mono', monospace";
      ctx.fillText(b.sub, b.x + bw / 2, by + 62);

      ctx.fillStyle = C.textDim;
      ctx.font = "italic 11px 'IBM Plex Sans', sans-serif";
      ctx.fillText(b.sub2, b.x + bw / 2, by + 82);
    }

    // Arrows
    const drawArrow = (x1, x2, y, label) => {
      ctx.strokeStyle = C.textDim;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2 - 8, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x2 - 8, y);
      ctx.lineTo(x2 - 16, y - 5);
      ctx.lineTo(x2 - 16, y + 5);
      ctx.closePath();
      ctx.fillStyle = C.textDim;
      ctx.fill();

      ctx.fillStyle = C.textDim;
      ctx.font = "italic 9px 'IBM Plex Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, (x1 + x2) / 2, y - 10);
    };

    drawArrow(200, 240, 95, "interactive effect");
    drawArrow(420, 460, 95, "combined");

    // Bottom annotations
    ctx.fillStyle = C.rose;
    ctx.font = "bold 10px 'IBM Plex Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Retrofit Isolation sees this ──────────┐", 110, 170);
    ctx.fillText("│", 202, 178);

    ctx.fillStyle = C.blue;
    ctx.fillText("Whole Facility sees all three ─────────────────────────────────────────", 340, 190);

  }, []);

  return <canvas ref={canvasRef} style={{ width: w, height: h, display: "block", maxWidth: "100%" }} />;
}

// ── MAIN ───────────────────────────────────────────────────────
export default function BoundaryExplainer({ onBack }) {
  const [boundaryMode, setBoundaryMode] = useState("whole");

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #3d3529 0%, #3d3529 100%)", padding: "48px 32px 40px", borderBottom: `3px solid ${C.rose}` }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {onBack && <button onClick={onBack} style={{ background: "none", border: "none", color: "#998d7e", fontSize: 12, fontFamily: "'IBM Plex Sans'", cursor: "pointer", marginBottom: 16, padding: 0 }}>← Back to course</button>}
          <div style={{ fontSize: 10, letterSpacing: 4, color: C.rose, fontWeight: 600, textTransform: "uppercase", fontFamily: "'IBM Plex Mono'" }}>Counterfactual Design · Dimension 1</div>
          <h1 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 30, fontWeight: 700, color: "#fff", margin: "10px 0 0", lineHeight: 1.25 }}>The Measurement Boundary</h1>
          <p style={{ fontFamily: "'IBM Plex Sans'", fontSize: 15, color: "#998d7e", margin: "10px 0 0", lineHeight: 1.7 }}>
            Where you draw the line determines what the model can tell you — and what it hides.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 32px 80px" }}>

        <h2 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 20, fontWeight: 700, marginBottom: 14 }}>What Is a Measurement Boundary?</h2>
        <P>
          Every M&V analysis starts with a line — sometimes physical, sometimes conceptual — that separates what you're measuring from what you're ignoring. This is the <strong>measurement boundary</strong>. It determines which meters you use, which variables enter your model, and ultimately what your savings estimate means.
        </P>
        <P>
          There are two fundamentally different places to draw it: around the <strong>whole facility</strong> (typically at the utility meter) or around the <strong>specific equipment</strong> being retrofitted (retrofit isolation, requiring sub-metering). The choice is the first dimension of counterfactual design.
        </P>

        <Callout color={C.rose} label="The core tradeoff">
          <strong>Whole facility</strong> captures everything — including savings you didn't expect, interactive effects between systems, and noise from non-routine changes. <strong>Retrofit isolation</strong> gives you a clean signal for a specific measure — but anything outside the boundary is invisible.
        </Callout>

        <h2 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 20, fontWeight: 700, marginBottom: 14, marginTop: 32 }}>Same Building, Different Boundaries</h2>
        <P>
          Toggle between approaches. Watch how the boundary changes what the meter "sees" and what your model can tell you.
        </P>

        {/* Toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[
            { id: "whole", label: "Whole Facility (Option C/D)", color: C.blue },
            { id: "isolation", label: "Retrofit Isolation (Option A/B)", color: C.rose },
          ].map(m => (
            <button key={m.id} onClick={() => setBoundaryMode(m.id)} style={{
              flex: 1, padding: "10px 16px", borderRadius: 8, cursor: "pointer",
              border: `2px solid ${boundaryMode === m.id ? m.color : C.border}`,
              background: boundaryMode === m.id ? `${m.color}10` : C.surface,
              fontFamily: "'IBM Plex Sans'", fontSize: 13, fontWeight: 700,
              color: boundaryMode === m.id ? m.color : C.textSoft,
              transition: "all 0.15s",
            }}>{m.label}</button>
          ))}
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, marginBottom: 20, overflowX: "auto" }}>
          <BuildingDiagram mode={boundaryMode} />
        </div>

        {boundaryMode === "whole" && (
          <Callout color={C.blue} label="Whole facility">
            The utility meter captures the building's total energy use. Your model sees the lighting retrofit savings, the HVAC interactive effects from reduced heat, the server room addition, plug load changes — all of it. The advantage: nothing escapes. The disadvantage: the model can't tell you which ECM produced which savings, and every non-routine change in the building is noise you must adjust for.
          </Callout>
        )}
        {boundaryMode === "isolation" && (
          <Callout color={C.rose} label="Retrofit isolation">
            A sub-meter on the lighting panel captures only lighting energy. The model sees exactly what the LEDs saved — a clean, attributable number. But it misses the 8,500 kWh/yr of cooling savings caused by less heat from the lights. And when the server room comes online, it's invisible — it's outside the boundary. You'll never need a non-routine adjustment for it, but you'll never know it happened either.
          </Callout>
        )}

        {/* Interactive Effects */}
        <h2 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 20, fontWeight: 700, marginBottom: 14, marginTop: 32 }}>Interactive Effects: What the Boundary Hides</h2>
        <P>
          When you replace fluorescent lights with LEDs, the building gets cooler. That's less work for the chiller. The cooling savings are real — but they only show up if your boundary is wide enough to see them.
        </P>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, marginBottom: 20, overflowX: "auto" }}>
          <InteractiveEffects />
        </div>

        <P>
          This is the fundamental tension. Retrofit isolation gives you <em>attributable</em> savings. Whole facility gives you <em>total</em> savings. If you need both — say, for a performance contract with measure-level guarantees — you may need to combine approaches or use a calibrated simulation to estimate interactions.
        </P>

        {/* IPMVP Options */}
        <h2 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 20, fontWeight: 700, marginBottom: 14, marginTop: 32 }}>The Four IPMVP Options</h2>
        <P>
          IPMVP codifies boundary choice into four options. Options A and B isolate the retrofit. Options C and D look at the whole facility. Within each boundary, the method varies by how much you measure versus estimate.
        </P>

        <OptionsGrid />

        <Callout color={C.amber} label="Single-line diagrams">
          Before choosing a boundary, you need to understand the building's electrical distribution. A <strong>single-line diagram</strong> shows the path from utility meter to panels to end uses. It tells you where sub-meters can go, which loads are on which circuits, and whether isolation is even physically feasible. Without one, you're doing M&V blind.
        </Callout>

        {/* Comparison */}
        <h2 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 20, fontWeight: 700, marginBottom: 14, marginTop: 32 }}>Side by Side</h2>
        <ComparisonTable />

        {/* Where this course fits */}
        <h2 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 20, fontWeight: 700, marginBottom: 14, marginTop: 32 }}>Where This Course Lives</h2>
        <P>
          This course holds the boundary constant at <strong>whole facility</strong> (Options C and D) and teaches you to execute the model form and duration dimensions with rigor. That means utility meter data, statistical and physical models, and the full weight of non-routine adjustments.
        </P>
        <P>
          That's a deliberate choice. Whole-facility approaches are where the epistemological challenges are richest — where weather normalization, change-point models, time-of-week patterns, and Bayesian calibration all come into play. Retrofit isolation is important, but its modeling challenges are different: instrumentation, stipulation, and engineering calculation rather than statistical inference.
        </P>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 20, marginBottom: 20 }}>
          {[
            { dim: "Boundary", val: "Whole Facility", status: "You are here", color: C.rose, active: true },
            { dim: "Model Form", val: "Statistical → Physical", status: "Explored in depth", color: C.blue, active: true },
            { dim: "Duration", val: "How much data?", status: "Coming soon", color: C.teal, active: false },
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
        <div style={{ background: "linear-gradient(135deg, #3d3529, #3d3529)", borderRadius: 8, padding: "28px 28px", color: "#fff", marginTop: 32 }}>
          <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: C.rose, textTransform: "uppercase", marginBottom: 12 }}>The Big Idea</div>
          <P style={{ fontSize: 15, color: "#e2e8f0", margin: "0 0 12px" }}>
            <strong style={{ color: "#fff" }}>The measurement boundary is not a technical detail — it's a decision about what counts.</strong> Draw it wide and you see everything, including noise you'll need to account for. Draw it tight and you get clarity, but you're blind to the ripple effects. There is no "correct" boundary — only a boundary that's appropriate for the question you're trying to answer.
          </P>
          <P style={{ fontSize: 15, color: "#94a3b8", margin: 0, fontStyle: "italic" }}>
            Before you model anything, decide what the meter should see. Everything else follows from that.
          </P>
        </div>

        {/* Further Reading */}
        <h3 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 15, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>Further Reading</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { title: "IPMVP Core Concepts", url: "https://evo-world.org/en/products-services-mainmenu-en/protocols/ipmvp", desc: "Options A–D framework" },
            { title: "ASHRAE Guideline 14", url: "https://www.ashrae.org/technical-resources/bookstore/ashrae-guideline-14-2014", desc: "Table 5-2: retrofit isolation approaches" },
            { title: "CalTrack / OpenEE Meter", url: "https://www.caltrack.org/", desc: "Standardized whole-facility methods" },
            { title: "SkySpark Analytics", url: "https://skyfoundry.com/", desc: "Fault detection + static factor monitoring" },
          ].map(r => (
            <a key={r.title} href={r.url} target="_blank" rel="noopener noreferrer" style={{
              display: "block", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
              padding: "12px 16px", textDecoration: "none", transition: "border-color 0.15s",
            }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = C.rose}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = C.border}
            >
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 12, fontWeight: 700, color: C.rose, marginBottom: 4 }}>{r.title}</div>
              <div style={{ fontFamily: "'IBM Plex Sans'", fontSize: 11, color: C.textDim }}>{r.desc}</div>
            </a>
          ))}
        </div>

      </div>
    </div>
  );
}
