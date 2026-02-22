# Claude.md — M&V Educational Platforms Project

## Project Owner
Steve Kromer — author of *The Role of the Measurement and Verification Professional* (River Publishers, 2024), former Chair of IPMVP.

## Overview
Two separate interactive educational platforms teaching Measurement & Verification (M&V) through different philosophical lenses. Both are Vite + React apps using Recharts, deployed on Vercel via GitHub.

---

## Platform 1: IPMVP-Aligned Course
- **URL:** https://mv-course.vercel.app
- **Repo:** https://github.com/jskromer/mv-course
- **Branding:** "Statistical Modeling for IPMVP Implementation"
- **Approach:** Uses standard IPMVP protocol terminology (Options A–D). Targets learners who need protocol compliance literacy.
- **Terminology disclaimer:** Definitions align with pre-copyright public domain versions of IPMVP (pre-EVO). References Appendix II of Steve's book, which tracks definition evolution from the 1996 NEMVP through current EVO-copyrighted versions. Current EVO-copyrighted versions may differ.

## Platform 2: Counterfactual Designs
- **URL:** https://cfdesigns.vercel.app
- **Repo:** https://github.com/jskromer/CFdesigns
- **Branding:** "Counterfactual Designs"
- **Theme:** Warm, cream-colored (inspired by Claude's interface). Deliberately distinct from the IPMVP site.
- **Approach:** Frames M&V as "design under uncertainty" rather than protocol compliance. Built around Steve's three-dimension framework:
  1. **Boundary** — what is the measurement boundary drawn around?
  2. **Model Form** — how is the counterfactual constructed? (statistical regression, physical/engineering model, hybrid)
  3. **Duration** — how much baseline and reporting period data is available/needed?
- **No IPMVP terminology.** No "Option C" or protocol labels. The core question is: *"What would energy use have been without the intervention?"*
- **Audience:** Professionals who need to exercise judgment beyond standard procedures.

## Cross-Linking
Both sites link to each other and to Steve's central resource: https://counterfactual-designs.com

---

## Tech Stack & Deployment
- **Framework:** Vite + React (JSX)
- **Charts:** Recharts
- **Hosting:** Vercel (auto-deploys from GitHub `main` branch)
- **GitHub:** https://github.com/jskromer
- **Workflow:** Claude pushes directly to GitHub repos using Steve's personal access token (PAT), eliminating the zip-download-unzip-push cycle.
- **Branch note:** Vercel deploys from `main`. If local work is on `master`, use `git push --force origin master:main`.

## Key Source Files
Each site is a single-page app with hash routing. Main components:
- `src/App.jsx` — routing shell, landing page, nav
- `src/Fundamentals.jsx` — statistical fundamentals modules (scatter vs time series, linear models, residuals, goodness of fit)
- `src/Workbench.jsx` — interactive M&V workbench (dataset selection, exploration, model fitting, validation, savings calculation)
- `src/ArchitectureOfUncertainty.jsx` — explainer page based on Steve's essay
- `src/UncertaintyPedagogy.jsx` — explainer page on teaching uncertainty
- `index.html` — entry point (light background: `#f8f9fb` for IPMVP site, cream for CfDesigns)

## Interactive Modules (shared across both sites, with different framing)

### Fundamentals
1. **Two Views of Data** — same 12 months as time series and scatter plot side by side
2. **Why Linear Models?** — drag slope/intercept sliders, see residuals update, reveal OLS best fit
3. **What Is a Residual?** — click points to see step-by-step calculation, visual error bars, squared error visualization
4. **Goodness of Fit** — animated variance decomposition, click-to-expand cards for R², RMSE, CV(RMSE), NMBE

### Workbench
1. **Scenario/Dataset** — sample buildings (heating-dominant, cooling-dominant, mixed-use) with boundary annotations
2. **Explore** — interactive scatter, visual pattern recognition before model selection
3. **Model/Counterfactual** — 2P, 3PC, 3PH, 5P change-point models with grid-search optimization + OLS
4. **Validate** — ASHRAE Guideline 14 monthly criteria (CV(RMSE) ≤ 15%, NMBE ≤ ±5%), F-statistic, t-stats, p-values
5. **Savings** — baseline predictions vs. actual, fractional savings uncertainty at 95% CI

### Explainer Pages
- **Architecture of Uncertainty** — adapted from Steve's essay, with embedded video links (Rumsfeld known unknowns, Feynman, Taleb, Box)
- **Uncertainty Pedagogy** — guide for teaching uncertainty concepts

---

## Design Decisions & Context

### Why two sites?
Steve's framework (Boundary, Model Form, Duration) is fundamentally different from IPMVP's Options A–D classification. Mixing them in one site would confuse both audiences. The IPMVP site serves those who need protocol-aligned training; the CfDesigns site serves practitioners who need to think beyond protocols.

### IPMVP copyright stance
Steve opposed copyrighting the IPMVP document during his tenure as Chair. The IPMVP site's disclaimer acknowledges that its definitions align with historical, pre-copyright public domain versions. Current EVO-copyrighted versions may define terms differently. Appendix II of Steve's book documents the full evolution of definitions from the 1996 NEMVP onward.

### Color themes
- **IPMVP site:** Light theme (`#f8f9fb` background), blue/green/amber accents
- **CfDesigns site:** Warm cream theme, deliberately softer — signals a different relationship to the material

### Counterfactual framing (CfDesigns only)
The CfDesigns site replaces protocol language throughout:
- "Select & Fit a Model" → "Construct the Counterfactual"
- "Option C analysis" → "Whole-building statistical counterfactual"
- Step labels: Scenario → Explore → Counterfactual → Validate → Savings
- Savings formula framed as: `Counterfactual(T_post) − Actual_post`

---

## Common Issues & Fixes
- **Vite `base` path:** Use `base: '/'` for Vercel (not `'./'`)
- **Branch mismatch:** Local `master` vs. GitHub `main` — use `git push --force origin master:main`
- **Path with `#` character:** macOS unzip sometimes creates folders with `#` in the name; Vite can't handle this. Rename/move the folder.
- **Percentage display bug:** Watch for `+-` in formatted percentages when energy increases rather than decreases.

---

## Related Resources
- **Steve's book:** *The Role of the Measurement and Verification Professional* (River Publishers, 2024)
- **Central site:** https://counterfactual-designs.com
- **ASHRAE Guideline 14** — referenced for model validation criteria
