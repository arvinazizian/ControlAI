# ControlAI — Visual Studio MVP

**[Open development checklist / roadmap](./ROADMAP.md)** — completed and upcoming work tracked with checkboxes.

A free, local-first Project Control visual analytics prototype.

## Run

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite. To check a production build, run `npm run build`.

## Included

- React + TypeScript + ECharts comparison bars
- Change orientation, metric, palette, labels, and sorting
- Click a bar to inspect project budget, forecast and variance
- Import simple CSV (`id,name,budget,forecast,actual`), values in EUR millions
- Export current visual settings and data to JSON
- Experimental prompt field uses keyword matching, **not a connected AI model**

## New: Excel + company vocabulary (prototype)

- Import `.xlsx` workbooks, select worksheet and header row, map ID/project/BAC/EAC/AC columns, choose source units, and update chart data.
- Edit and validate a company terminology JSON glossary. Glossary is stored **only in browser localStorage**, not synced across users or organizations.
- A company AI connector is **not yet implemented**. Do not paste API keys, private company prompts, or confidential data into the public prototype.
- The default definition of EAC is final total forecast; with a bottom-up ETC, EAC = AC + ETC. A field named `forecast` must mean final total forecast, not remaining-only forecast.

## Limitations

This is an untested starter implementation. No login, tenant isolation, server, database or AI service is connected. Do not upload confidential company data. CSV parser is intentionally basic and does not support quoted commas.

## Roadmap

1. Verify build and interaction tests
2. Add Excel parsing and column mapping
3. Add validated visualization specification and version history
4. Add secure backend and local Ollama integration
5. Add multi-tenant authentication and row-level security
