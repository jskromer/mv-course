import { useState, useMemo, useRef, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// ─── CUSTOM SVG SCATTER PLOT ─────────────────────────────────────
function SVGScatter({ data, xKey, yKey, xLabel, yLabel, width: containerWidth, height: containerHeight, modelLine, changePoints, residualMode, unit }) {
  const [hovered, setHovered] = useState(null);
  const svgRef = useRef(null);
  const pad = { top: 20, right: 30, bottom: 50, left: 70 };
  const w = (containerWidth || 700) - pad.left - pad.right;
  const h = (containerHeight || 380) - pad.top - pad.bottom;

  const xVals = data.map((d) => d[xKey]);
  const yVals = data.map((d) => d[yKey]);
  const xMin = Math.min(...xVals) - (Math.max(...xVals) - Math.min(...xVals)) * 0.08;
  const xMax = Math.max(...xVals) + (Math.max(...xVals) - Math.min(...xVals)) * 0.08;
  const yMin = residualMode ? Math.min(...yVals, 0) - Math.abs(Math.max(...yVals) - Math.min(...yVals)) * 0.15 : Math.min(...yVals) * 0.85;
  const yMax = residualMode ? Math.max(...yVals, 0) + Math.abs(Math.max(...yVals) - Math.min(...yVals)) * 0.15 : Math.max(...yVals) * 1.08;

  const scaleX = (v) => pad.left + ((v - xMin) / (xMax - xMin)) * w;
  const scaleY = (v) => pad.top + h - ((v - yMin) / (yMax - yMin)) * h;

  // Tick generation
  const makeTicks = (min, max, count) => {
    const range = max - min;
    const step = Math.pow(10, Math.floor(Math.log10(range / count)));
    const candidates = [step, step * 2, step * 5, step * 10];
    const best = candidates.find((s) => range / s <= count + 2) || candidates[candidates.length - 1];
    const start = Math.ceil(min / best) * best;
    const ticks = [];
    for (let v = start; v <= max; v += best) ticks.push(v);
    return ticks;
  };
  const xTicks = makeTicks(xMin, xMax, 8);
  const yTicks = makeTicks(yMin, yMax, 6);

  const handleMouseMove = useCallback((e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let closest = null;
    let minDist = 20;
    data.forEach((d, i) => {
      const dx = scaleX(d[xKey]) - mx;
      const dy = scaleY(d[yKey]) - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) { minDist = dist; closest = { ...d, i, cx: scaleX(d[xKey]), cy: scaleY(d[yKey]) }; }
    });
    setHovered(closest);
  }, [data, xKey, yKey, xMin, xMax, yMin, yMax, w, h]);

  return (
    <svg ref={svgRef} width={containerWidth || 700} height={containerHeight || 380} style={{ fontFamily: "'IBM Plex Mono', monospace", overflow: "visible" }} onMouseMove={handleMouseMove} onMouseLeave={() => setHovered(null)}>
      {/* Grid lines */}
      {xTicks.map((t) => <line key={`gx${t}`} x1={scaleX(t)} x2={scaleX(t)} y1={pad.top} y2={pad.top + h} stroke="#e2e8f0" strokeDasharray="3 3" />)}
      {yTicks.map((t) => <line key={`gy${t}`} x1={pad.left} x2={pad.left + w} y1={scaleY(t)} y2={scaleY(t)} stroke="#e2e8f0" strokeDasharray="3 3" />)}

      {/* Zero line for residuals */}
      {residualMode && <line x1={pad.left} x2={pad.left + w} y1={scaleY(0)} y2={scaleY(0)} stroke="#94a3b8" strokeDasharray="5 3" strokeWidth={1.5} />}

      {/* Change point reference lines */}
      {changePoints?.heating != null && (
        <>
          <line x1={scaleX(changePoints.heating)} x2={scaleX(changePoints.heating)} y1={pad.top} y2={pad.top + h} stroke="#b45309" strokeDasharray="6 3" strokeWidth={1.5} />
          <text x={scaleX(changePoints.heating) + 4} y={pad.top + 14} fill="#b45309" fontSize={10} fontFamily="'IBM Plex Sans', sans-serif">CP_h {changePoints.heating.toFixed(0)}°F</text>
        </>
      )}
      {changePoints?.cooling != null && (
        <>
          <line x1={scaleX(changePoints.cooling)} x2={scaleX(changePoints.cooling)} y1={pad.top} y2={pad.top + h} stroke="#ea580c" strokeDasharray="6 3" strokeWidth={1.5} />
          <text x={scaleX(changePoints.cooling) + 4} y={pad.top + 14} fill="#ea580c" fontSize={10} fontFamily="'IBM Plex Sans', sans-serif">CP_c {changePoints.cooling.toFixed(0)}°F</text>
        </>
      )}

      {/* Model line */}
      {modelLine && modelLine.length > 1 && (
        <polyline
          points={modelLine.map((d) => `${scaleX(d.temp)},${scaleY(d.energy)}`).join(" ")}
          fill="none" stroke="#ea580c" strokeWidth={2.5} strokeLinejoin="round"
        />
      )}

      {/* Data points */}
      {data.map((d, i) => {
        const cx = scaleX(d[xKey]);
        const cy = scaleY(d[yKey]);
        const fill = residualMode ? (d[yKey] > 0 ? "#4da6ff" : "#b18cfe") : "#4da6ff";
        return (
          <circle key={i} cx={cx} cy={cy} r={hovered?.i === i ? 7 : 5} fill={fill} fillOpacity={0.85} stroke={hovered?.i === i ? "#1a2332" : "#bfdbfe"} strokeWidth={hovered?.i === i ? 2 : 1} style={{ transition: "r 0.1s, stroke 0.1s" }} />
        );
      })}

      {/* Axes */}
      <line x1={pad.left} x2={pad.left + w} y1={pad.top + h} y2={pad.top + h} stroke="#cbd5e1" />
      <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + h} stroke="#cbd5e1" />

      {/* X ticks & labels */}
      {xTicks.map((t) => (
        <g key={`xt${t}`}>
          <line x1={scaleX(t)} x2={scaleX(t)} y1={pad.top + h} y2={pad.top + h + 5} stroke="#94a3b8" />
          <text x={scaleX(t)} y={pad.top + h + 18} textAnchor="middle" fill="#94a3b8" fontSize={11}>{t}</text>
        </g>
      ))}
      {/* Y ticks & labels */}
      {yTicks.map((t) => (
        <g key={`yt${t}`}>
          <line x1={pad.left - 5} x2={pad.left} y1={scaleY(t)} y2={scaleY(t)} stroke="#94a3b8" />
          <text x={pad.left - 10} y={scaleY(t) + 4} textAnchor="end" fill="#94a3b8" fontSize={11}>{residualMode ? t.toFixed(0) : t >= 1000 ? `${(t / 1000).toFixed(1)}k` : t}</text>
        </g>
      ))}

      {/* Axis labels */}
      <text x={pad.left + w / 2} y={pad.top + h + 40} textAnchor="middle" fill="#64748b" fontSize={12} fontFamily="'IBM Plex Sans', sans-serif">{xLabel}</text>
      <text x={16} y={pad.top + h / 2} textAnchor="middle" fill="#64748b" fontSize={12} fontFamily="'IBM Plex Sans', sans-serif" transform={`rotate(-90, 16, ${pad.top + h / 2})`}>{yLabel}</text>

      {/* Tooltip */}
      {hovered && (
        <g>
          <rect x={hovered.cx + 12} y={hovered.cy - 36} width={180} height={hovered.month ? 48 : 36} rx={4} fill="#ffffff" stroke="#e2e8f0" />
          {hovered.month && <text x={hovered.cx + 20} y={hovered.cy - 18} fill="#1a2332" fontSize={12} fontWeight={600} fontFamily="'IBM Plex Sans', sans-serif">{hovered.month}</text>}
          <text x={hovered.cx + 20} y={hovered.cy + (hovered.month ? 0 : -16)} fill="#64748b" fontSize={11}>
            {hovered[xKey]?.toFixed?.(1) || hovered[xKey]}°F → {residualMode ? hovered[yKey]?.toFixed(0) : hovered[yKey]?.toLocaleString()} {unit || ""}
          </text>
        </g>
      )}
    </svg>
  );
}

// Responsive wrapper for SVGScatter
function ResponsiveSVGScatter(props) {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ width: 700, height: props.height || 380 });

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      setDims({ width: containerRef.current.clientWidth, height: props.height || 380 });
    }
  }, [props.height]);

  // Simple resize observer
  useState(() => {
    const interval = setInterval(handleResize, 500);
    setTimeout(handleResize, 100);
    return () => clearInterval(interval);
  });

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <SVGScatter {...props} width={dims.width} height={dims.height} />
    </div>
  );
}


// ─── SAMPLE DATASETS ─────────────────────────────────────────────
const DATASETS = {
  heating: {
    name: "Office Building — Heating Dominant (Gas)",
    description: "50,000 sq ft office in Chicago. Monthly gas consumption (therms). Strong heating dependency with a flat summer baseload.",
    unit: "therms",
    fuel: "Natural Gas",
    boundary: "Whole-building",
    boundaryNote: "Gas meter captures total building gas use: space heating, domestic hot water, and kitchen loads.",
    data: [
      { month: "Jan-22", temp: 26, energy: 4820 },
      { month: "Feb-22", temp: 30, energy: 4410 },
      { month: "Mar-22", temp: 40, energy: 3280 },
      { month: "Apr-22", temp: 52, energy: 1950 },
      { month: "May-22", temp: 62, energy: 820 },
      { month: "Jun-22", temp: 72, energy: 480 },
      { month: "Jul-22", temp: 77, energy: 450 },
      { month: "Aug-22", temp: 75, energy: 460 },
      { month: "Sep-22", temp: 66, energy: 610 },
      { month: "Oct-22", temp: 54, energy: 1750 },
      { month: "Nov-22", temp: 40, energy: 3350 },
      { month: "Dec-22", temp: 28, energy: 4650 },
      { month: "Jan-23", temp: 24, energy: 5010 },
      { month: "Feb-23", temp: 28, energy: 4700 },
      { month: "Mar-23", temp: 38, energy: 3500 },
      { month: "Apr-23", temp: 50, energy: 2100 },
      { month: "May-23", temp: 60, energy: 900 },
      { month: "Jun-23", temp: 70, energy: 510 },
      { month: "Jul-23", temp: 78, energy: 440 },
      { month: "Aug-23", temp: 76, energy: 455 },
      { month: "Sep-23", temp: 64, energy: 680 },
      { month: "Oct-23", temp: 52, energy: 1870 },
      { month: "Nov-23", temp: 38, energy: 3550 },
      { month: "Dec-23", temp: 26, energy: 4850 },
    ],
  },
  cooling: {
    name: "Retail Store — Cooling Dominant (Electric)",
    description: "25,000 sq ft retail in Houston. Monthly electricity (kWh). Strong cooling dependency with a constant baseload floor.",
    unit: "kWh",
    fuel: "Electricity",
    boundary: "Whole-building",
    boundaryNote: "Electric meter captures everything: HVAC, lighting, plug loads, refrigeration. The ECM only affects cooling, but the meter sees it all.",
    data: [
      { month: "Jan-22", temp: 52, energy: 18200 },
      { month: "Feb-22", temp: 56, energy: 18500 },
      { month: "Mar-22", temp: 63, energy: 19800 },
      { month: "Apr-22", temp: 70, energy: 22400 },
      { month: "May-22", temp: 78, energy: 27600 },
      { month: "Jun-22", temp: 84, energy: 32100 },
      { month: "Jul-22", temp: 88, energy: 35400 },
      { month: "Aug-22", temp: 89, energy: 36200 },
      { month: "Sep-22", temp: 82, energy: 30800 },
      { month: "Oct-22", temp: 72, energy: 23500 },
      { month: "Nov-22", temp: 60, energy: 19200 },
      { month: "Dec-22", temp: 53, energy: 18300 },
      { month: "Jan-23", temp: 50, energy: 18000 },
      { month: "Feb-23", temp: 54, energy: 18400 },
      { month: "Mar-23", temp: 61, energy: 19500 },
      { month: "Apr-23", temp: 72, energy: 23200 },
      { month: "May-23", temp: 80, energy: 29100 },
      { month: "Jun-23", temp: 86, energy: 33800 },
      { month: "Jul-23", temp: 90, energy: 36800 },
      { month: "Aug-23", temp: 91, energy: 37500 },
      { month: "Sep-23", temp: 84, energy: 31900 },
      { month: "Oct-23", temp: 70, energy: 22800 },
      { month: "Nov-23", temp: 62, energy: 19600 },
      { month: "Dec-23", temp: 55, energy: 18450 },
    ],
  },
  mixed: {
    name: "School — Mixed Heating & Cooling (Electric)",
    description: "75,000 sq ft K-8 school in Nashville. Monthly electricity (kWh). Both heating and cooling loads visible, with a dead band in shoulder months.",
    unit: "kWh",
    fuel: "Electricity",
    boundary: "Whole-building",
    boundaryNote: "All-electric building. The meter captures heat pumps, lighting, ventilation, and plug loads. Both heating and cooling show up on the same meter.",
    data: [
      { month: "Jan-22", temp: 38, energy: 62000 },
      { month: "Feb-22", temp: 42, energy: 58500 },
      { month: "Mar-22", temp: 52, energy: 48000 },
      { month: "Apr-22", temp: 60, energy: 42500 },
      { month: "May-22", temp: 70, energy: 41000 },
      { month: "Jun-22", temp: 78, energy: 52000 },
      { month: "Jul-22", temp: 82, energy: 58000 },
      { month: "Aug-22", temp: 81, energy: 57500 },
      { month: "Sep-22", temp: 74, energy: 48000 },
      { month: "Oct-22", temp: 62, energy: 42000 },
      { month: "Nov-22", temp: 48, energy: 50000 },
      { month: "Dec-22", temp: 40, energy: 60000 },
      { month: "Jan-23", temp: 36, energy: 64000 },
      { month: "Feb-23", temp: 40, energy: 60500 },
      { month: "Mar-23", temp: 50, energy: 49500 },
      { month: "Apr-23", temp: 62, energy: 42200 },
      { month: "May-23", temp: 72, energy: 42500 },
      { month: "Jun-23", temp: 80, energy: 55000 },
      { month: "Jul-23", temp: 84, energy: 60000 },
      { month: "Aug-23", temp: 83, energy: 59000 },
      { month: "Sep-23", temp: 76, energy: 50000 },
      { month: "Oct-23", temp: 60, energy: 41800 },
      { month: "Nov-23", temp: 46, energy: 52000 },
      { month: "Dec-23", temp: 38, energy: 62500 },
    ],
  },
};

// ─── MODEL TYPES ─────────────────────────────────────────────────
const MODEL_TYPES = {
  "2P": {
    name: "2-Parameter Linear",
    formula: "E = β₀ + β₁ · T",
    description: "Energy varies linearly with temperature across the entire range. No change point — the relationship is the same at every temperature. Rarely appropriate for buildings (most have a temperature where heating or cooling turns on), but useful as a comparison baseline.",
    shape: "A straight diagonal line through the data.",
    params: ["β₀ (intercept)", "β₁ (slope)"],
  },
  "3PC": {
    name: "3-Parameter Cooling",
    formula: "E = β₀ + β₁ · (T − Tcp)⁺",
    description: "Below the change point, energy is flat at the baseload — the building isn't cooling. Above the change point, energy rises linearly with temperature as cooling load increases. The (x)⁺ notation means max(0, x).",
    shape: "Flat on the left, rising on the right. An 'L' rotated clockwise.",
    params: ["β₀ (baseload)", "β₁ (cooling slope)", "Tcp (change point)"],
  },
  "3PH": {
    name: "3-Parameter Heating",
    formula: "E = β₀ + β₁ · (Tcp − T)⁺",
    description: "Above the change point, energy is flat at the baseload — no heating needed. Below the change point, energy rises as temperature drops and heating demand increases.",
    shape: "Rising on the left, flat on the right. A mirrored 'L'.",
    params: ["β₀ (baseload)", "β₁ (heating slope)", "Tcp (change point)"],
  },
  "5P": {
    name: "5-Parameter (Heating + Cooling)",
    formula: "E = β₀ + β₁·(Tcp_h − T)⁺ + β₂·(T − Tcp_c)⁺",
    description: "Two change points create three regimes: heating on the left, flat baseload in the middle (the 'dead band'), and cooling on the right. The model captures buildings where both heating and cooling loads are visible on the same meter.",
    shape: "A 'U' or 'V' shape — energy is lowest in the mild middle.",
    params: ["β₀ (baseload)", "β₁ (heating slope)", "β₂ (cooling slope)", "Tcp_h (heating CP)", "Tcp_c (cooling CP)"],
  },
};

// ─── STATISTICAL FUNCTIONS ───────────────────────────────────────
function mean(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }

function normalCDF(x) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1.0 + sign * y);
}

function tDistCDF(t, df) {
  if (df <= 0) return 1;
  const absT = Math.abs(t);
  if (absT < 0.01) return 1.0;
  if (absT > 10) return 0.0001;
  const pVal = 2 * (1 - normalCDF(absT * (df > 30 ? 1 : Math.sqrt((1 - 2 / (9 * df)) / (1 + absT * absT / (2 * df))))));
  return Math.max(0.0001, Math.min(1, pVal));
}

function fitOLS(X, y) {
  const n = y.length, p = X[0].length;
  const XtX = Array.from({ length: p }, () => Array(p).fill(0));
  for (let i = 0; i < n; i++) for (let j = 0; j < p; j++) for (let k = 0; k < p; k++) XtX[j][k] += X[i][j] * X[i][k];
  const Xty = Array(p).fill(0);
  for (let i = 0; i < n; i++) for (let j = 0; j < p; j++) Xty[j] += X[i][j] * y[i];
  const aug = XtX.map((row, i) => [...row, Xty[i]]);
  for (let col = 0; col < p; col++) {
    let maxRow = col;
    for (let row = col + 1; row < p; row++) if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    if (Math.abs(aug[col][col]) < 1e-12) return null;
    for (let row = 0; row < p; row++) { if (row === col) continue; const f = aug[row][col] / aug[col][col]; for (let j = col; j <= p; j++) aug[row][j] -= f * aug[col][j]; }
  }
  const beta = aug.map((row, i) => row[p] / row[i]);
  const yHat = X.map((xi) => xi.reduce((s, v, j) => s + v * beta[j], 0));
  const residuals = y.map((yi, i) => yi - yHat[i]);
  const yMean = mean(y);
  const SSres = residuals.reduce((s, r) => s + r * r, 0);
  const SStot = y.reduce((s, yi) => s + (yi - yMean) ** 2, 0);
  const R2 = 1 - SSres / SStot;
  const MSE = SSres / (n - p);
  const RMSE = Math.sqrt(MSE);
  const cvRMSE = (RMSE / yMean) * 100;
  const NMBE = (residuals.reduce((a, b) => a + b, 0) / ((n - p) * yMean)) * 100;
  const XtXinv = invertMatrix(XtX);
  const se = XtXinv ? beta.map((_, j) => Math.sqrt(MSE * XtXinv[j][j])) : beta.map(() => NaN);
  const tStats = beta.map((b, j) => (isNaN(se[j]) || se[j] === 0) ? NaN : b / se[j]);
  const pValues = tStats.map((t) => isNaN(t) ? NaN : tDistCDF(t, n - p));
  const F = (p - 1) > 0 ? ((SStot - SSres) / (p - 1)) / (SSres / (n - p)) : NaN;
  return { beta, yHat, residuals, R2, cvRMSE, NMBE, RMSE, se, tStats, pValues, F, n, p, SSres, SStot };
}

function invertMatrix(matrix) {
  const n = matrix.length;
  const aug = matrix.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    if (Math.abs(aug[col][col]) < 1e-12) return null;
    const pivot = aug[col][col];
    for (let j = 0; j < 2 * n; j++) aug[col][j] /= pivot;
    for (let row = 0; row < n; row++) { if (row === col) continue; const f = aug[row][col]; for (let j = 0; j < 2 * n; j++) aug[row][j] -= f * aug[col][j]; }
  }
  return aug.map((row) => row.slice(n));
}

function fitModel(modelType, data) {
  const temps = data.map((d) => d.temp), energy = data.map((d) => d.energy);
  if (modelType === "2P") {
    const X = temps.map((t) => [1, t]);
    const r = fitOLS(X, energy);
    if (!r) return null;
    return { ...r, type: "2P", changePoints: {}, predict: (t) => r.beta[0] + r.beta[1] * t, paramLabels: ["β₀ (intercept)", "β₁ (slope)"] };
  }
  if (modelType === "3PC") {
    let best = null, bestSS = Infinity;
    for (let cp = Math.min(...temps) + 2; cp <= Math.max(...temps) - 2; cp += 0.5) {
      const X = temps.map((t) => [1, Math.max(0, t - cp)]);
      const r = fitOLS(X, energy);
      if (r && r.SSres < bestSS && r.beta[1] > 0) { bestSS = r.SSres; best = { ...r, cp }; }
    }
    if (!best) return null;
    return { ...best, type: "3PC", changePoints: { cooling: best.cp }, predict: (t) => best.beta[0] + best.beta[1] * Math.max(0, t - best.cp), paramLabels: ["β₀ (baseload)", "β₁ (cooling slope)", `Tcp = ${best.cp.toFixed(1)}°F`] };
  }
  if (modelType === "3PH") {
    let best = null, bestSS = Infinity;
    for (let cp = Math.min(...temps) + 2; cp <= Math.max(...temps) - 2; cp += 0.5) {
      const X = temps.map((t) => [1, Math.max(0, cp - t)]);
      const r = fitOLS(X, energy);
      if (r && r.SSres < bestSS && r.beta[1] > 0) { bestSS = r.SSres; best = { ...r, cp }; }
    }
    if (!best) return null;
    return { ...best, type: "3PH", changePoints: { heating: best.cp }, predict: (t) => best.beta[0] + best.beta[1] * Math.max(0, best.cp - t), paramLabels: ["β₀ (baseload)", "β₁ (heating slope)", `Tcp = ${best.cp.toFixed(1)}°F`] };
  }
  if (modelType === "5P") {
    let best = null, bestSS = Infinity;
    for (let cph = Math.min(...temps) + 3; cph <= Math.max(...temps) - 8; cph += 1) {
      for (let cpc = cph + 5; cpc <= Math.max(...temps) - 3; cpc += 1) {
        const X = temps.map((t) => [1, Math.max(0, cph - t), Math.max(0, t - cpc)]);
        const r = fitOLS(X, energy);
        if (r && r.SSres < bestSS && r.beta[1] > 0 && r.beta[2] > 0) { bestSS = r.SSres; best = { ...r, cph, cpc }; }
      }
    }
    if (!best) return null;
    return { ...best, type: "5P", changePoints: { heating: best.cph, cooling: best.cpc }, predict: (t) => best.beta[0] + best.beta[1] * Math.max(0, best.cph - t) + best.beta[2] * Math.max(0, t - best.cpc), paramLabels: ["β₀ (baseload)", "β₁ (heating slope)", "β₂ (cooling slope)", `Tcp_h = ${best.cph.toFixed(1)}°F`, `Tcp_c = ${best.cpc.toFixed(1)}°F`] };
  }
  return null;
}

const G14 = { cvRMSE: 15, NMBE: 5 };

// ─── COLORS ──────────────────────────────────────────────────────
const C = {
  bg: "#f8f9fb", surface: "#ffffff", surfaceRaised: "#f0f2f5",
  border: "#d8dde6", borderHover: "#b0b8c8",
  text: "#1a2332", textSoft: "#4a5568", textDim: "#8494a7", white: "#111827",
  blue: "#2563eb", blueDim: "#dbeafe",
  green: "#16a34a", greenDim: "#dcfce7",
  red: "#dc2626", redDim: "#fee2e2",
  amber: "#b45309", amberDim: "#fef3c7",
  orange: "#ea580c", violet: "#7c3aed", teal: "#0d9488",
};

// ─── MAIN APP ────────────────────────────────────────────────────
export default function MVWorkbench() {
  const [step, setStep] = useState(0);
  const [datasetKey, setDatasetKey] = useState(null);
  const [modelType, setModelType] = useState(null);
  const [modelResult, setModelResult] = useState(null);
  const [showResiduals, setShowResiduals] = useState(false);
  const [showParams, setShowParams] = useState(true);
  const [fitError, setFitError] = useState(false);

  const dataset = datasetKey ? DATASETS[datasetKey] : null;

  const goStep = (s) => {
    if (s === 0) { setDatasetKey(null); setModelType(null); setModelResult(null); }
    if (s <= 1) { setModelType(null); setModelResult(null); }
    setFitError(false);
    setStep(s);
  };

  const nav = [
    { label: "Scenario", num: "01" },
    { label: "Explore", num: "02" },
    { label: "Counterfactual", num: "03" },
    { label: "Validate", num: "04" },
    { label: "Savings", num: "05" },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <header style={{ borderBottom: `1px solid ${C.border}`, padding: "20px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 4, color: C.textDim, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Counterfactual Design</div>
            <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 24, fontWeight: 700, margin: 0, color: C.white, letterSpacing: -0.3 }}>M&V Statistical Modeling Workbench</h1>
          </div>
          <div style={{ fontSize: 11, color: C.textDim, textAlign: "right", lineHeight: 1.6, fontFamily: "'IBM Plex Sans', sans-serif" }}>
            <div>Model form: <span style={{ color: C.blue }}>Statistical regression</span></div>
            <div>Boundary: <span style={{ color: C.teal }}>Whole-building</span></div>
          </div>
        </div>
      </header>

      <nav style={{ borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex" }}>
          {nav.map((n, i) => {
            const active = step === i;
            const reachable = i === 0 || (i <= 2 && dataset) || (i >= 3 && modelResult);
            return (
              <button key={i} onClick={() => reachable && goStep(i)} style={{
                background: "transparent", border: "none",
                borderBottom: active ? `2px solid ${C.blue}` : "2px solid transparent",
                padding: "12px 22px", color: active ? C.blue : reachable ? C.textSoft : C.textDim,
                fontSize: 12, fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: active ? 600 : 400,
                cursor: reachable ? "pointer" : "default", opacity: reachable ? 1 : 0.35,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", opacity: 0.5 }}>{n.num}</span>{n.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 32px 60px" }}>
        {step === 0 && <StepScenario onSelect={(k) => { setDatasetKey(k); setStep(1); }} />}
        {step === 1 && dataset && <StepExplore dataset={dataset} onNext={() => setStep(2)} />}
        {step === 2 && dataset && <StepCounterfactual dataset={dataset} datasetKey={datasetKey} modelType={modelType} fitError={fitError} onSelectModel={(k) => { setModelType(k); setFitError(false); }} onFit={() => { const r = fitModel(modelType, dataset.data); if (r) { setModelResult(r); setFitError(false); setStep(3); } else { setFitError(true); } }} />}
        {step === 3 && modelResult && <StepValidate dataset={dataset} result={modelResult} showResiduals={showResiduals} setShowResiduals={setShowResiduals} showParams={showParams} setShowParams={setShowParams} onNext={() => setStep(4)} onBack={() => { setModelResult(null); setStep(2); }} />}
        {step === 4 && modelResult && <StepSavings dataset={dataset} result={modelResult} />}
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STEP 0 — SCENARIO
   ═══════════════════════════════════════════════════════════════════ */
function StepScenario({ onSelect }) {
  return (
    <div>
      <SectionTitle>Choose a scenario</SectionTitle>
      <P>Each scenario represents a building with 24 months of metered energy data and paired outdoor air temperature. This is your <Em>baseline period</Em> — the historical record from which you'll construct a counterfactual.</P>
      <Box type="concept" title="The three design dimensions">
        <P>Every M&V analysis requires three decisions that define how you'll construct the counterfactual:</P>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 12 }}>
          <DimensionCard num="1" name="Boundary" desc="What does the meter capture? Whole building, a subsystem, or a single piece of equipment?" active="Whole-building" color={C.teal} />
          <DimensionCard num="2" name="Model Form" desc="How will you construct the counterfactual? Statistical regression, physical simulation, or engineering calculation?" active="Statistical regression" color={C.blue} />
          <DimensionCard num="3" name="Duration" desc="How much baseline data do you have? How long is the reporting period? Is it sufficient to capture the full range of conditions?" active="24 months baseline" color={C.amber} />
        </div>
        <P style={{ marginTop: 12, fontSize: 11, color: C.textDim }}>In this workbench, we hold boundary at whole-building and model form at statistical regression, and focus on teaching you how to do the regression well. Duration is embedded in the data you choose.</P>
      </Box>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14, marginTop: 24 }}>
        {Object.entries(DATASETS).map(([key, ds]) => (
          <button key={key} onClick={() => onSelect(key)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: 20, textAlign: "left", cursor: "pointer", color: C.text, transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.style.background = C.surfaceRaised; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface; }}>
            <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{ds.name}</div>
            <div style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.6, fontFamily: "'IBM Plex Sans', sans-serif" }}>{ds.description}</div>
            <div style={{ marginTop: 10, fontSize: 11, color: C.textDim, fontFamily: "'IBM Plex Sans', sans-serif" }}>
              <strong style={{ color: C.teal }}>Boundary:</strong> {ds.boundary} — {ds.boundaryNote}
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <Tag>{ds.data.length} months</Tag><Tag>{ds.fuel}</Tag><Tag>{ds.unit}</Tag>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STEP 1 — EXPLORE
   ═══════════════════════════════════════════════════════════════════ */
function StepExplore({ dataset, onNext }) {
  return (
    <div>
      <SectionTitle>Explore the baseline data</SectionTitle>
      <P>Before choosing a model, look at the data. Plot energy against the independent variable (temperature) and read the shape. The shape tells you what kind of counterfactual model is appropriate.</P>
      <Box type="concept" title="Reading the scatter plot">
        <P>You're looking for the <Em>functional form</Em> of the energy-temperature relationship. Key patterns:</P>
        <P style={{ marginTop: 8 }}>
          <strong>Flat + rising right tail</strong> → cooling change-point. <strong>Rising left tail + flat</strong> → heating change-point. <strong>Both tails rising</strong> → two change points (5-parameter). <strong>Straight diagonal</strong> → simple linear (uncommon for buildings).
        </P>
      </Box>
      <Panel style={{ marginTop: 20 }}>
        <PanelLabel>Energy ({dataset.unit}) vs. Outdoor Air Temperature (°F)</PanelLabel>
        <ResponsiveSVGScatter
          data={dataset.data}
          xKey="temp" yKey="energy"
          xLabel="Outdoor Air Temperature (°F)"
          yLabel={`Energy (${dataset.unit})`}
          height={380}
          unit={dataset.unit}
        />
      </Panel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 14 }}>
        <Stat label="Observations" value={dataset.data.length} />
        <Stat label="Mean Energy" value={`${mean(dataset.data.map((d) => d.energy)).toFixed(0)}`} unit={dataset.unit} />
        <Stat label="Temp Range" value={`${Math.min(...dataset.data.map((d) => d.temp))} – ${Math.max(...dataset.data.map((d) => d.temp))}`} unit="°F" />
        <Stat label="Duration" value="24" unit="months" />
      </div>
      <Box type="question" title="Design dimension check: Duration">
        <P>24 months covers two full seasonal cycles. That's generally strong for monthly regression — it gives you repeated observations at similar temperatures, which helps the model distinguish signal from noise. With only 12 months you'd have a single observation per weather condition, and your uncertainty would be higher.</P>
      </Box>
      <Right><Btn onClick={onNext}>Build the counterfactual →</Btn></Right>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STEP 2 — COUNTERFACTUAL
   ═══════════════════════════════════════════════════════════════════ */
function StepCounterfactual({ dataset, datasetKey, modelType, onSelectModel, onFit, fitError }) {
  // Model suitability hints based on dataset
  const hints = {
    heating: { "2P": "okay", "3PC": "poor", "3PH": "recommended", "5P": "okay" },
    cooling: { "2P": "okay", "3PC": "recommended", "3PH": "poor", "5P": "okay" },
    mixed:   { "2P": "poor", "3PC": "poor", "3PH": "poor", "5P": "recommended" },
  };
  const suitability = hints[datasetKey] || {};
  const hintLabels = { recommended: ["✓ Recommended", C.green], okay: ["Compatible", C.textDim], poor: ["Poor fit likely", C.red] };

  return (
    <div>
      <SectionTitle>Construct the counterfactual</SectionTitle>
      <P>The counterfactual answers: <Em>"What would this building's energy use have been if nothing had changed?"</Em> You're building a mathematical model of the baseline behavior that can be projected forward into new conditions.</P>
      <Box type="concept" title="Why change-point models?">
        <P>Buildings have thermostatic controls. Below a certain temperature, heating turns on. Above another, cooling turns on. Between them, HVAC energy is minimal. Change-point regression captures this physics with a simple, interpretable functional form. The change point <Em>is</Em> the thermostat setpoint (approximately) — it's where the building's behavior shifts.</P>
        <P style={{ marginTop: 8 }}>Choosing the right model form is a design decision. You match the model to the physics you see in the scatter plot. If you pick the wrong form, the model will either overfit noise or miss real structure.</P>
      </Box>
      <PanelLabel style={{ marginTop: 20, marginBottom: 10 }}>Select a model form</PanelLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
        {Object.entries(MODEL_TYPES).map(([key, m]) => {
          const sel = modelType === key;
          const [hintText, hintColor] = hintLabels[suitability[key]] || ["", C.textDim];
          return (
            <button key={key} onClick={() => onSelectModel(key)} style={{ background: sel ? C.surfaceRaised : C.surface, border: `1px solid ${sel ? C.blue : C.border}`, borderRadius: 6, padding: 16, textAlign: "left", cursor: "pointer", color: C.text, transition: "all 0.15s" }}
              onMouseEnter={(e) => { if (!sel) e.currentTarget.style.borderColor = C.borderHover; }}
              onMouseLeave={(e) => { if (!sel) e.currentTarget.style.borderColor = sel ? C.blue : C.border; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, fontWeight: 600, color: sel ? C.blue : C.text }}>{m.name}</div>
                {hintText && <span style={{ fontSize: 9, fontWeight: 600, color: hintColor, fontFamily: "'IBM Plex Sans'" }}>{hintText}</span>}
              </div>
              <code style={{ display: "inline-block", marginTop: 8, padding: "5px 10px", background: C.bg, borderRadius: 4, fontSize: 12, color: C.amber }}>{m.formula}</code>
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 8, lineHeight: 1.5, fontFamily: "'IBM Plex Sans', sans-serif" }}>{m.shape}</div>
            </button>
          );
        })}
      </div>
      {modelType && (
        <Panel style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.7, fontFamily: "'IBM Plex Sans', sans-serif" }}>{MODEL_TYPES[modelType].description}</div>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 10, fontFamily: "'IBM Plex Mono', monospace" }}>Parameters: {MODEL_TYPES[modelType].params.join(" · ")}</div>
          {suitability[modelType] === "poor" && (
            <div style={{ background: C.redDim, border: `1px solid ${C.red}40`, borderRadius: 4, padding: "8px 12px", marginTop: 12, fontSize: 11, color: C.red, fontFamily: "'IBM Plex Sans'" }}>
              ⚠ This model form is unlikely to fit well for this building. The data shape doesn't match the model's assumptions. You can still try it — seeing a bad fit is instructive.
            </div>
          )}
          <Box type="concept" title="How the fitting works">
            <P>For models with change points, we can't use ordinary least squares directly because the change point makes the model nonlinear. Instead, we search: try every candidate change-point temperature (in 0.5°F increments), fit the linear portion with OLS at each candidate, and keep the change point that minimizes the sum of squared residuals. This is a grid search over a piecewise-linear model.</P>
          </Box>
          {fitError && (
            <div style={{ background: C.redDim, border: `1px solid ${C.red}40`, borderRadius: 4, padding: "10px 14px", marginTop: 12, fontSize: 12, color: C.red, fontFamily: "'IBM Plex Sans'" }}>
              <strong>Fitting failed.</strong> The solver couldn't find valid parameters for this model + dataset combination. The model form doesn't match the data — for example, a heating-only model can't fit cooling-dominant data because there's no heating slope to detect. Try a different model form.
            </div>
          )}
          <div style={{ marginTop: 14 }}><Btn onClick={onFit}>Fit model to baseline data</Btn></div>
        </Panel>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STEP 3 — VALIDATE
   ═══════════════════════════════════════════════════════════════════ */
function StepValidate({ dataset, result, showResiduals, setShowResiduals, showParams, setShowParams, onNext, onBack }) {
  // Generate model line sorted by temperature
  const minT = Math.min(...dataset.data.map((d) => d.temp)) - 5;
  const maxT = Math.max(...dataset.data.map((d) => d.temp)) + 5;
  const modelLine = [];
  for (let t = minT; t <= maxT; t += 0.5) modelLine.push({ temp: t, energy: result.predict(t) });

  const residualData = dataset.data.map((d, i) => ({ temp: d.temp, month: d.month, residual: result.residuals[i] }));

  const cvPass = Math.abs(result.cvRMSE) <= G14.cvRMSE;
  const nmbePass = Math.abs(result.NMBE) <= G14.NMBE;
  const pass = cvPass && nmbePass;

  return (
    <div>
      <SectionTitle>Validate the counterfactual</SectionTitle>
      <P>A model is only useful if it's accurate enough to trust. Statistical validation answers: <Em>"Is this counterfactual precise enough and unbiased enough to detect real savings?"</Em></P>

      {/* Pass/Fail */}
      <div style={{ background: pass ? C.greenDim : C.redDim, border: `1px solid ${pass ? C.green : C.red}50`, borderRadius: 6, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, marginTop: 16 }}>
        <span style={{ fontSize: 24 }}>{pass ? "✓" : "✗"}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'IBM Plex Sans', sans-serif", color: pass ? C.green : C.red }}>
            {pass ? "Counterfactual meets statistical validity thresholds" : "Counterfactual does not meet statistical validity thresholds"}
          </div>
          <div style={{ fontSize: 12, color: C.textSoft, marginTop: 3, fontFamily: "'IBM Plex Sans', sans-serif" }}>
            {pass ? "CV(RMSE) and NMBE are within ASHRAE Guideline 14 monthly limits." : "Try a different model form that better matches the data's shape, or investigate data quality."}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10, marginTop: 16 }}>
        <MetricCard label="CV(RMSE)" value={`${Math.abs(result.cvRMSE).toFixed(1)}%`} threshold={`≤ ${G14.cvRMSE}%`} pass={cvPass} tip="Measures scatter of residuals relative to the mean. Lower = more precise counterfactual, smaller savings uncertainty." />
        <MetricCard label="NMBE" value={`${result.NMBE.toFixed(2)}%`} threshold={`± ${G14.NMBE}%`} pass={nmbePass} tip="Measures systematic bias. Near zero = unbiased counterfactual that won't systematically inflate or deflate savings." />
        <MetricCard label="R²" value={result.R2.toFixed(4)} threshold="≥ 0.75 (heuristic)" pass={result.R2 >= 0.75} tip="Fraction of energy variation explained by temperature. Not an official threshold, but below 0.75 usually means something is missing." />
        <MetricCard label="F-statistic" value={result.F.toFixed(1)} threshold="> ~4" pass={result.F > 4} tip="Tests whether the regression explains significantly more than a flat line. Low F = temperature isn't a meaningful predictor." />
      </div>

      {/* Parameters */}
      <Collapsible open={showParams} onToggle={() => setShowParams(!showParams)} label="Model parameters">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Parameter", "Estimate", "Std Error", "t-stat", "p-value", "Sig?"].map((h, i) => (
                <th key={i} style={{ textAlign: i === 0 ? "left" : i === 5 ? "center" : "right", padding: "8px 10px", color: C.textDim, fontWeight: 500, fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.beta.map((b, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}30` }}>
                <td style={{ padding: "8px 10px", fontFamily: "'IBM Plex Sans'" }}>{result.paramLabels[i]}</td>
                <td style={{ padding: "8px 10px", textAlign: "right", color: C.blue }}>{b.toFixed(2)}</td>
                <td style={{ padding: "8px 10px", textAlign: "right", color: C.textDim }}>{isNaN(result.se[i]) ? "—" : result.se[i].toFixed(2)}</td>
                <td style={{ padding: "8px 10px", textAlign: "right", color: C.textDim }}>{isNaN(result.tStats[i]) ? "—" : result.tStats[i].toFixed(2)}</td>
                <td style={{ padding: "8px 10px", textAlign: "right", color: C.textDim }}>{isNaN(result.pValues[i]) ? "—" : result.pValues[i] < 0.001 ? "< 0.001" : result.pValues[i].toFixed(4)}</td>
                <td style={{ padding: "8px 10px", textAlign: "center", color: !isNaN(result.pValues[i]) && result.pValues[i] < 0.05 ? C.green : C.red, fontWeight: 600 }}>
                  {isNaN(result.pValues[i]) ? "" : result.pValues[i] < 0.05 ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(result.changePoints.heating || result.changePoints.cooling) && (
          <div style={{ padding: "10px 10px 0", fontSize: 11, color: C.textDim }}>
            {result.changePoints.heating && <div>Heating change point: <span style={{ color: C.amber }}>{result.changePoints.heating.toFixed(1)}°F</span></div>}
            {result.changePoints.cooling && <div>Cooling change point: <span style={{ color: C.orange }}>{result.changePoints.cooling.toFixed(1)}°F</span></div>}
          </div>
        )}
      </Collapsible>

      {/* Fitted chart */}
      <Panel style={{ marginTop: 16 }}>
        <PanelLabel>Counterfactual model vs. observed data</PanelLabel>
        <ResponsiveSVGScatter
          data={dataset.data}
          xKey="temp" yKey="energy"
          xLabel="Temperature (°F)"
          yLabel={`Energy (${dataset.unit})`}
          height={360}
          unit={dataset.unit}
          modelLine={modelLine}
          changePoints={result.changePoints}
        />
        <ChartLegend items={[{ color: C.blue, label: "Observed", type: "dot" }, { color: C.orange, label: "Counterfactual", type: "line" }]} />
      </Panel>

      {/* Residuals */}
      <Collapsible open={showResiduals} onToggle={() => setShowResiduals(!showResiduals)} label="Residual diagnostics">
        <Box type="concept" title="Why look at residuals?">
          <P>Residuals = Actual − Predicted. If the counterfactual is well-specified, residuals should be randomly scattered around zero with no pattern. Curves, trends, clusters, or funneling indicate the model is missing something.</P>
        </Box>
        <div style={{ marginTop: 12 }}>
          <ResponsiveSVGScatter
            data={residualData}
            xKey="temp" yKey="residual"
            xLabel="Temperature (°F)"
            yLabel={`Residual (${dataset.unit})`}
            height={260}
            unit={dataset.unit}
            residualMode
          />
        </div>
      </Collapsible>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <BtnSecondary onClick={onBack}>← Try a different model</BtnSecondary>
        {pass ? <Btn onClick={onNext}>Calculate savings →</Btn> : <span style={{ fontSize: 12, color: C.textDim, fontFamily: "'IBM Plex Sans'", alignSelf: "center" }}>Model must pass validation to proceed</span>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STEP 4 — SAVINGS
   ═══════════════════════════════════════════════════════════════════ */
function StepSavings({ dataset, result }) {
  const savingsPct = 12;
  const postData = useMemo(() => [
    { month: "Jan-24", temp: 28 }, { month: "Feb-24", temp: 32 }, { month: "Mar-24", temp: 42 },
    { month: "Apr-24", temp: 55 }, { month: "May-24", temp: 64 }, { month: "Jun-24", temp: 74 },
    { month: "Jul-24", temp: 80 }, { month: "Aug-24", temp: 78 }, { month: "Sep-24", temp: 68 },
    { month: "Oct-24", temp: 56 }, { month: "Nov-24", temp: 42 }, { month: "Dec-24", temp: 30 },
  ].map((d) => {
    const predicted = result.predict(d.temp);
    const actual = predicted * (1 - savingsPct / 100) + (Math.random() - 0.5) * predicted * 0.03;
    return { ...d, predicted: Math.round(predicted), actual: Math.round(actual), savings: Math.round(predicted - actual) };
  }), [result]);

  const totP = postData.reduce((s, d) => s + d.predicted, 0);
  const totA = postData.reduce((s, d) => s + d.actual, 0);
  const totS = totP - totA;
  const pct = ((totS / totP) * 100).toFixed(1);
  const cvrmse = result.cvRMSE / 100;
  const fsu = (1.96 * cvrmse * Math.sqrt(result.n) * Math.sqrt(1 + 2 / result.n)) / (Math.sqrt(12) * (totS / totP));
  const fsuPct = (fsu * 100).toFixed(1);

  const chartData = postData.map((d) => ({ month: d.month.split("-")[0], Counterfactual: d.predicted, Actual: d.actual }));

  return (
    <div>
      <SectionTitle>Determine savings</SectionTitle>
      <P>Project the counterfactual into the reporting period using actual post-retrofit weather. The difference between the counterfactual prediction and metered reality is the avoided energy.</P>
      <Box type="concept" title="The core equation">
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, color: C.amber, padding: "8px 0" }}>Savings = Counterfactual(T_post) − Actual_post</div>
        <P>The counterfactual model takes reporting-period weather and answers "what would have happened." The metered data tells you what actually happened. The gap is attributable to the intervention — provided no other significant changes occurred.</P>
      </Box>
      <Box type="note" title="Simulated reporting period">
        <P>This is synthetic data: 12 months of post-retrofit weather with ~{savingsPct}% energy reduction and realistic noise. In practice, you'd use real utility data.</P>
      </Box>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginTop: 20 }}>
        <Stat label="Counterfactual (12 mo)" value={totP.toLocaleString()} unit={dataset.unit} color={C.orange} />
        <Stat label="Actual metered" value={totA.toLocaleString()} unit={dataset.unit} color={C.blue} />
        <Stat label="Avoided energy" value={totS.toLocaleString()} unit={dataset.unit} color={C.green} />
        <Stat label="Savings" value={`${pct}%`} color={C.green} />
      </div>

      <Panel style={{ marginTop: 16 }}>
        <PanelLabel>Counterfactual projection vs. actual metered data</PanelLabel>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="month" tick={{ fill: C.textDim, fontSize: 11 }} />
            <YAxis tick={{ fill: C.textDim, fontSize: 11 }} />
            <Tooltip contentStyle={{ background: C.surfaceRaised, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Counterfactual" fill={C.orange} fillOpacity={0.65} radius={[3, 3, 0, 0]} />
            <Bar dataKey="Actual" fill={C.blue} fillOpacity={0.65} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel style={{ marginTop: 16 }}>
        <PanelLabel>Savings uncertainty</PanelLabel>
        <Box type="concept" title="Why uncertainty is not optional">
          <P>Every counterfactual has prediction error. Fractional Savings Uncertainty (FSU) quantifies the confidence interval. In performance contracts, savings must be statistically distinguishable from zero. If the uncertainty band includes zero, you can't claim the intervention worked.</P>
        </Box>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          <Stat label="Fractional Savings Uncertainty (95%)" value={`± ${fsuPct}%`} color={isNaN(fsu) || fsu > 0.5 ? C.red : C.green} />
          <Stat label="Savings range (95% CI)" value={`${Math.round(totS * (1 - fsu)).toLocaleString()} – ${Math.round(totS * (1 + fsu)).toLocaleString()}`} unit={dataset.unit} color={C.blue} />
        </div>
      </Panel>

      <div style={{ marginTop: 24, background: C.blueDim, border: `1px solid ${C.blue}40`, borderRadius: 6, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'IBM Plex Sans', sans-serif", color: C.blue, marginBottom: 8 }}>What you just did</div>
        <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.8, fontFamily: "'IBM Plex Sans', sans-serif" }}>
          You designed a counterfactual: chose a measurement boundary (whole-building meter), selected a model form (change-point regression), used 24 months of baseline duration, fit and validated the model against statistical thresholds, then projected it into the reporting period to quantify avoided energy with uncertainty bounds.
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   UI PRIMITIVES
   ═══════════════════════════════════════════════════════════════════ */
function SectionTitle({ children }) { return <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 20, fontWeight: 700, color: C.white, margin: "0 0 10px", letterSpacing: -0.3 }}>{children}</h2>; }
function P({ children, style = {} }) { return <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: C.textSoft, lineHeight: 1.7, margin: "0 0 6px", ...style }}>{children}</p>; }
function Em({ children }) { return <span style={{ color: C.amber, fontStyle: "italic" }}>{children}</span>; }

function Box({ type, title, children, style = {} }) {
  const s = { concept: { bg: C.amberDim, border: C.amber + "40", accent: C.amber }, question: { bg: C.blueDim, border: C.blue + "40", accent: C.blue }, note: { bg: C.surfaceRaised, border: C.border, accent: C.textSoft } }[type] || { bg: C.surfaceRaised, border: C.border, accent: C.textSoft };
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 6, padding: "14px 18px", marginTop: 14, ...style }}>
      <div style={{ fontSize: 11, fontWeight: 600, fontFamily: "'IBM Plex Sans', sans-serif", color: s.accent, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1.5 }}>{title}</div>
      {children}
    </div>
  );
}

function DimensionCard({ num, name, desc, active, color }) {
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: 14 }}>
      <div style={{ fontSize: 10, color: C.textDim, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>Dimension {num}</div>
      <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'IBM Plex Sans', sans-serif", color: C.white }}>{name}</div>
      <div style={{ fontSize: 11, color: C.textDim, marginTop: 6, lineHeight: 1.5, fontFamily: "'IBM Plex Sans', sans-serif" }}>{desc}</div>
      <div style={{ marginTop: 8, fontSize: 11, color, fontWeight: 600, fontFamily: "'IBM Plex Sans', sans-serif" }}>→ {active}</div>
    </div>
  );
}

function Panel({ children, style = {} }) { return <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: 20, ...style }}>{children}</div>; }
function PanelLabel({ children, style = {} }) { return <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "'IBM Plex Sans', sans-serif", color: C.textDim, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1, ...style }}>{children}</div>; }
function Tag({ children }) { return <span style={{ background: C.surfaceRaised, border: `1px solid ${C.border}`, borderRadius: 3, padding: "2px 8px", fontSize: 11, color: C.textDim }}>{children}</span>; }

function Stat({ label, value, unit, color }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: 14 }}>
      <div style={{ fontSize: 10, color: C.textDim, fontFamily: "'IBM Plex Sans', sans-serif", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", color: color || C.text }}>
        {value}{unit && <span style={{ fontSize: 10, fontWeight: 400, color: C.textDim, marginLeft: 4 }}>{unit}</span>}
      </div>
    </div>
  );
}

function MetricCard({ label, value, threshold, pass, tip }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} style={{ background: C.surface, border: `1px solid ${pass ? C.green : C.red}50`, borderRadius: 6, padding: 14, cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, color: C.textSoft }}>{label}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: pass ? C.green : C.red }}>{pass ? "PASS" : "FAIL"}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", color: pass ? C.green : C.red }}>{value}</div>
      <div style={{ fontSize: 10, color: C.textDim, marginTop: 3 }}>Threshold: {threshold}</div>
      {open && <div style={{ marginTop: 8, fontSize: 11, color: C.textSoft, lineHeight: 1.6, fontFamily: "'IBM Plex Sans'", borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>{tip}</div>}
    </div>
  );
}

function Collapsible({ open, onToggle, label, children }) {
  return (
    <div style={{ marginTop: 16 }}>
      <button onClick={onToggle} style={{ background: C.surfaceRaised, border: `1px solid ${C.border}`, borderRadius: open ? "6px 6px 0 0" : 6, padding: "10px 16px", color: C.textSoft, cursor: "pointer", fontSize: 12, fontFamily: "'IBM Plex Sans'", width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10, display: "inline-block", transform: open ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.15s" }}>▸</span>{label}
      </button>
      {open && <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderTop: "none", borderRadius: "0 0 6px 6px", padding: 16 }}>{children}</div>}
    </div>
  );
}

function ChartLegend({ items }) {
  return (
    <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 8 }}>
      {items.map((it, i) => (
        <span key={i} style={{ fontSize: 11, color: C.textDim, display: "flex", alignItems: "center", gap: 6, fontFamily: "'IBM Plex Sans'" }}>
          {it.type === "dot" && <span style={{ width: 8, height: 8, borderRadius: "50%", background: it.color, display: "inline-block" }} />}
          {it.type === "line" && <span style={{ width: 16, height: 2.5, background: it.color, display: "inline-block", borderRadius: 2 }} />}
          {it.label}
        </span>
      ))}
    </div>
  );
}

function Btn({ onClick, children, disabled }) {
  return <button onClick={onClick} disabled={disabled} style={{ background: disabled ? C.surfaceRaised : `linear-gradient(135deg, ${C.blue}, #2563eb)`, border: "none", borderRadius: 5, padding: "10px 22px", color: disabled ? C.textDim : "#fff", fontSize: 13, fontWeight: 600, fontFamily: "'IBM Plex Sans'", cursor: disabled ? "not-allowed" : "pointer" }}>{children}</button>;
}
function BtnSecondary({ onClick, children }) {
  return <button onClick={onClick} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 5, padding: "10px 18px", color: C.textSoft, fontSize: 12, fontFamily: "'IBM Plex Sans'", cursor: "pointer" }}>{children}</button>;
}
function Right({ children }) { return <div style={{ marginTop: 20, textAlign: "right" }}>{children}</div>; }
