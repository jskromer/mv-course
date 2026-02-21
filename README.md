# Statistical Modeling for M&V — Interactive Course

A two-part interactive course for M&V professionals learning statistical regression modeling for energy savings verification.

## Part 1: Statistical Fundamentals

Build intuition from the ground up before touching a real model.

- **Two Views of Data** — Time series vs. scatter plot, same data, different stories
- **Why Linear Models?** — Interactive slope/intercept fitting with real-time SSE feedback
- **What Is a Residual?** — Step-by-step error anatomy, squared errors visualization, heteroskedasticity diagnostics
- **Goodness of Fit** — R², RMSE, CV(RMSE), NMBE explained and connected to M&V practice

## Part 2: M&V Modeling Workbench

Apply the fundamentals to a realistic building scenario.

- **Scenario** — Choose a building and understand the counterfactual design
- **Explore** — Read the scatter plot to identify the right model form
- **Counterfactual** — Select and fit a change-point regression model
- **Validate** — Test against ASHRAE Guideline 14 thresholds + residual diagnostics
- **Savings** — Project the counterfactual and quantify uncertainty

## Getting Started

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run build
```

Deploy the `dist/` folder to Vercel, Netlify, GitHub Pages, or any static host.
