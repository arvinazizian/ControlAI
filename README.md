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

## Limitations

This is an untested starter implementation. No login, tenant isolation, Excel/XLSX parser, server, database or AI service is connected. Do not upload confidential company data. CSV parser is intentionally basic and does not support quoted commas.

## Roadmap

1. Verify build and interaction tests
2. Add Excel parsing and column mapping
3. Add validated visualization specification and version history
4. Add secure backend and local Ollama integration
5. Add multi-tenant authentication and row-level security
