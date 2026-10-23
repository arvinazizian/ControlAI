# ControlAI — Open Development Checklist

> Living project checklist. Update this file whenever a feature is implemented, tested, or added to the plan.
> **[x] = implemented/confirmed; [ ] = not complete.** A deployed UI is not proof that every interaction has been tested.

Last reviewed: 2026-10-23

## 0. Project setup
- [x] Create independent GitHub repository `arvinazizian/ControlAI`
- [x] Add React + TypeScript + Vite application source
- [x] Add Apache ECharts renderer and sample dataset
- [x] Add README, gitignore, and starter configuration
- [x] User reports seeing the deployed application in Vercel
- [ ] Verify Vercel deployment URL, build logs, and production health
- [x] Add GitHub Actions TypeScript/Vite build workflow (workflow committed; first run result not verified)
- [ ] Add unit and UI interaction tests
- [ ] Add staging environment and release process
- [ ] Configure domain and production deployment settings

## 1. Visual B — Comparison Bars (MVP)
- [x] Render Budget vs Forecast/Actual as grouped bars (code implemented)
- [x] Switch horizontal/vertical orientation (code implemented)
- [x] Switch color palettes (code implemented)
- [x] Show/hide value labels (code implemented)
- [x] Sort projects by name or forecast variance (code implemented)
- [x] Click bar for project detail panel (code implemented)
- [x] Show budget, forecast and variance summary cards (code implemented)
- [x] Export visual settings and data as JSON (code implemented)
- [ ] Test every control on mobile and desktop
- [ ] Add zoom, selection, filtering, and cross-filtering
- [ ] Support units, currencies, precision, and locale formatting
- [ ] Add conditional formatting and target/reference lines
- [ ] Add accessibility and responsive improvements

## 2. Data connectivity
- [x] Include demo project financial dataset
- [x] Basic client-side CSV import for fixed columns (code implemented)
- [ ] Robust CSV parsing and data quality checks
- [x] XLSX upload with sheet selection (code implemented; build/UI verification pending)
- [x] Manual column mapping and basic header matching (code implemented; build/UI verification pending)
- [ ] Full data type inference and advanced Excel validation
- [ ] Reusable datasets and upload history
- [ ] Connect read-only SQL/PostgreSQL
- [ ] Scheduled refresh and incremental updates
- [ ] Connect SAP, Planview, and other enterprise sources
- [ ] Power BI interoperability where feasible

## Semantic data modeling — required reporting foundation
- [x] Browser-local multi-file XLSX/CSV import, sheet profiling, unique-key candidates and shared-column relationship suggestions (code committed; build unverified)
- [ ] Validate joins against actual values, grain, nulls, orphan keys and fan-out before relationship approval
- [ ] Add source adapter interfaces for SQL databases, APIs and on-premises gateways
- [x] Initial five-language guided questionnaire with multi-select answers and provisional model JSON (code committed; build/UI unverified)
- [ ] Connect wizard answers to uploaded data profiling and generate actual tables and relationships
- [ ] Adaptive follow-up questions based on source inspection, missing keys and ambiguous grain
- [ ] Data profiling for Excel, CSV and SQL sources: types, uniqueness, nulls, grain and candidate keys
- [ ] AI-assisted semantic model proposal with explicit user review and approval
- [ ] Visual model designer: tables, relationships, cardinality, filter direction and validation
- [ ] Generate reusable dimensions (DimProject, DimDate, DimCostType) and fact tables based on declared grain
- [ ] Support multiple fact tables and conformed dimensions; avoid fact-to-fact joins and double counting
- [ ] Detect mismatched grains, many-to-many relationships, ambiguous paths and orphan keys
- [ ] Semantic metrics and business glossary with versioned organization-specific definitions (BAC, AC, ETC, EAC, VAC)
- [ ] Model preview and validation tests: row counts, join fan-out, totals before/after, key uniqueness
- [ ] Manual modeling override, reversible proposals, lineage and model version history
- [ ] Lightweight single-table mode for simple spreadsheets without forced star schema
- [ ] SQL pushdown and query performance strategy for larger enterprise datasets
- [ ] Organization-scoped model permissions and safe read-only source connections

## 3. Visual editor & dashboard builder
- [x] Initial properties panel (code implemented)
- [ ] Formal versioned VisualSpec JSON schema and validation
- [ ] Save/reopen/edit visual without losing settings
- [ ] Undo/redo and version history
- [ ] Multiple preview alternatives for each visualization request
- [ ] Drag-and-drop dashboard canvas, layout, resize
- [ ] Additional chart types: line, stacked bar, waterfall, S-curve, KPI
- [ ] Interactions between visuals, drill-through, tooltips
- [ ] Templates for Project Control reports
- [ ] Export dashboards to PDF/image and sharing controls

## Learning engine and reusable knowledge
- [x] Initial local approved-pattern registry with organization ID, column signatures and similarity matching (code only; not connected to wizard or production security)
- [x] Connect wizard draft approval to browser-local pattern storage and suggest matches from manually entered column names (code committed; not source profiling or production-ready)
- [ ] Version approved model templates, formulas, terminology, relationships and dashboard patterns
- [ ] Feedback loop: accept/reject/edit decisions, provenance, quality metrics and rollback
- [ ] Context-aware clarification questions driven by prior approvals and source profiling
- [ ] Separate global curated templates from tenant-private knowledge; prohibit cross-tenant leakage
- [ ] Secure server-side tenant isolation, RLS, permissions, audit logs and retention controls
- [ ] Optional consent-based, anonymized cross-organization learning with privacy review
- [ ] Evaluate recommendations on held-out datasets; guard against incorrect auto-learning
- [ ] Retrieval-based learning before considering model fine-tuning or training
- [ ] Reuse learned patterns across projects with human approval and data quality checks

## 4. AI-assisted design
- [x] Manual AI exchange: generate and copy prompt, paste JSON response, validate and apply supported visual settings (code implemented; deployment verification pending)
- [ ] Extend manual AI response schema for chart creation and approved company terminology updates
- [ ] Manual AI prompt templates per organization with permissions and versioning
- [x] Editable company terminology glossary with alias collision validation (browser-local prototype)
- [ ] Company-specific glossary stored securely per organization
- [ ] Authorized company AI integration (API endpoint, auth, permission scopes)
- [ ] Bidirectional enterprise AI gateway: send ControlAI prompts to company AI and receive structured responses
- [ ] Pluggable adapters for company GPT, Microsoft Copilot agents, Azure OpenAI and approved APIs
- [ ] Enterprise connection configuration with per-organization credentials and consent
- [ ] Prompt template registry, request/response schema and traceable execution history
- [ ] Structured response validation before applying chart or dataset changes
- [ ] Per-user delegated identity and access checks on every AI request
- [ ] Minimize/redact sensitive payloads; prohibit unapproved external data transfer
- [ ] Timeout, retries, error handling and connector health checks
- [ ] Support organization-provided GPT/agent such as Achmea GPT (verify platform and supported API)
- [ ] Microsoft Copilot Studio agent connection via approved channels and Entra authentication
- [ ] Company-approved terminology sync from authorized knowledge sources (read-only, versioned, source-attributed)
- [ ] Per-user delegated permissions for company AI and knowledge retrieval
- [ ] Approved import of company AI prompt, instructions, and terminology with review/versioning
- [ ] Enterprise data governance: redact sensitive context before external model calls
- [x] Experimental text-command UI with limited keyword rules (NOT real AI)
- [ ] Connect AI model via validated backend API
- [ ] Local Ollama option for development
- [ ] Natural-language chart creation and edits in Persian/English
- [ ] Generate multiple working chart variants and compare them
- [ ] Accept iterative prompts and user selection
- [ ] Support screenshot/reference-driven visual suggestions
- [ ] Validate AI-proposed operations; never execute arbitrary AI SQL
- [ ] Audit log and user approval for sensitive operations

## 5. Backend, security & SaaS
- [ ] API backend (FastAPI or equivalent)
- [ ] Supabase/PostgreSQL integration
- [ ] Authentication and account management
- [ ] Organizations/workspaces and role-based permissions
- [ ] Multi-tenant isolation with Row Level Security
- [ ] Encrypted secrets, least-privilege connectors, secure uploads
- [ ] Rate limits, monitoring, backups, audit trails
- [ ] Data retention/deletion, privacy and GDPR review
- [ ] Billing, subscriptions, and usage quotas
- [ ] Confirm commercial hosting terms before public paid launch

## 5A. Identity, organizations and sharing
- [ ] Individual accounts, verified emails and secure sessions
- [ ] Organization membership and switching between organizations
- [ ] Organization roles and workspace permissions
- [ ] Invite by organizational email, accept/revoke/expire invitations
- [ ] Share reports and dashboards with members or groups
- [ ] Share permission levels: view, edit, manage; expiry and revoke
- [ ] "Shared with me" page and permission management UI
- [ ] Dataset-level permissions enforced alongside visual sharing
- [ ] Organization isolation, RLS and cross-tenant security tests
- [ ] Audit log of access changes and sharing
- [ ] Optional enterprise SSO and user provisioning
- [ ] Organization-specific AI connector access policies

## 6. Product quality & release
- [x] Initial English/Dutch/Persian/Arabic/Turkish dictionaries, main-dashboard switcher, language persistence and Persian/Arabic RTL styles (code implemented; deployment verification pending)
- [x] Pass locale to manual AI, Excel import and company glossary panels; translate initial controls (code committed)
- [ ] Translate remaining secondary-panel descriptions, validation messages, charts, exports and accessibility labels
- [ ] Add scalable language packs and translation completeness checks for additional languages
- [ ] Separate interface locale, source-data language and AI prompt/response language
- [ ] Per-user language preference synchronized across devices
- [ ] Onboarding, sample templates, help pages
- [ ] Performance testing with larger datasets
- [ ] Error handling and loading/empty states
- [ ] User feedback and usability testing
- [ ] Public beta release criteria and release notes

Architecture: [Identity, Organizations & Sharing](./docs/identity-and-sharing.md) (design only, not implemented).

## Next recommended sprint
1. Verify deployed URL and mobile/desktop chart interactions.
2. Add automated build checks and fix any runtime issues.
3. Verify Excel upload, sheet selection, and column mapping in deployment.
4. Define VisualSpec schema and persist visuals.
5. Add multiple live preview alternatives.

## Maintenance rules
- Add new requested work under the relevant section as an unchecked item.
- Tick an item only after its implementation is verified; note when only code is present.
- Keep incomplete work unchecked, even when related UI exists.
- Preserve completed history; use Git commits to track changes.

## Decision-driven preparation, measures and visual authoring
- [x] Initial read-only data-quality suggestions (missing values, duplicate identifiers, date issues and calendar questions); manual JSON sample input only, build unverified
- [x] Initial five-language UI for suggest / guided / custom formula modes and draft EAC, VAC, variance measures (not executable)
- [x] Connect uploaded multi-file CSV/XLSX datasets to the decision advisor through in-memory app state; select a source table and generate deterministic questions (code committed, build/UI unverified)
- [ ] Connect decisions to SQL/API/enterprise sources and richer data profiling
- [x] Record explicit per-dataset question answers in browser session state without modifying data (code committed; not persisted)
- [x] Initial non-destructive preview for trim, exclude-empty and first-key deduplication; before/after counts and sample (code committed, build/UI unverified)
- [ ] Apply explicitly approved transformations to derived datasets, with rollback and audit trail
- [ ] Validate formulas against semantic model, types, granularity, units and permissions; safe calculation runtime
- [ ] Natural-language and code-assisted SQL/DAX/transform generation with sandbox and explicit approval
- [ ] Recommend visual types and chart measures using validated model and reporting intent
- [ ] Auto-suggest date dimension, surrogate keys and rolling three-month measures without inventing data

## Engineering decisions and implementation log (2026-10-23)
- [x] Decision: source-neutral data modeling, initially multiple XLSX/CSV files, later online/offline databases through secure adapters
- [x] Decision: nontechnical guided questions rather than asking users to classify Fact/Dimension directly
- [x] Decision: no automatic destructive cleaning, joins, generated code or measure execution without validation and explicit user approval
- [x] Decision: tenant-private approved patterns; cross-company learning requires consent and privacy safeguards
- [x] Code: multi-file importer now sends parsed rows and column names into in-memory datasets in App.tsx
- [x] Code: advisor now accepts imported datasets, lets user select a table, and records answers in session state
- [ ] Verify TypeScript build, GitHub Actions and Vercel deployment for all new changes
- [ ] Add automated test fixtures: four linked project-control files with duplicates, missing dates, mismatched grains and orphan keys
- [ ] Build safe transformation preview: filter, trim, normalize, deduplicate with explicit strategy and audit trail
- [ ] Add per-column inferred types, numeric/date parsing and data-quality statistics with sample limits
- [ ] Add robust join-key validation and actual relationship approval UI
- [ ] Create validated semantic model from approved tables and relationships; feed visuals from the model
- [ ] Implement executable, sandboxed formula/measure engine with dependency graph, unit validation and aggregate semantics
- [ ] Offer code writing modes: user writes / guided coauthoring / AI drafts, with safe execution and diff review
- [ ] Suggest charts, rolling-three-month date logic and calendar tables from actual available columns
- [ ] Persist decisions, model versions and learning feedback securely per organization with auth and RLS
- [ ] Build connector SDK for read-only SQL, REST APIs, on-prem gateway, SAP, Planview and Power BI interoperability
- [ ] Support lineage, refresh policies, privacy classification and permission-aware AI suggestions
- [ ] Full translations for new advisor questions and accessibility messages across five languages
- [ ] Evaluate model and cleaning suggestions against real-world project-control cases; human review before production use

**Status convention:** Checked entries marked "code committed" are not evidence of successful build, deployment or end-to-end functionality. All unimplemented, blocked or unverified items remain explicitly recorded.

## Verification and release notes — 2026-10-23
- [x] Added immutable cleaningPreview.ts utility; trim whitespace, filter missing rows, deduplicate by selected key; original imported dataset remains untouched
- [x] Added cleaning preview controls to DataDecisionStudio for selected uploaded datasets
- [x] Queried GitHub commit status for cleaning-preview commit: Vercel check **pending** at time of inspection; this is NOT a passing build
- [x] Queried Vercel project list for team `team_j4nSbPBJ4tY4FN658DpqIZoP` and search `controlai`: no matching projects returned; project/scope may differ
- [ ] Confirm the actual Vercel project and final READY status, inspect logs, run a live browser smoke test
- [ ] Run TypeScript/Vite build and automated tests (local container cannot resolve github.com; no successful build evidence)
- [ ] Confirm how missing rows, duplicate keys, date parsing, currency units and grain should be handled for each dataset before any irreversible change
- [ ] Wire approved cleaning steps to derived tables, model builder, chart measures and version history

## Proactive first-contact data understanding — 2026-10-23
- [x] Initial heuristic header-row candidate ranking over first 12 rows, with confidence score, reasons and header preview (code committed; not yet build-verified)
- [x] On multi-file import, present proactive questions about header position, leading title/metadata rows, fully blank rows and total/subtotal rows (code committed)
- [x] Capture answers to these start-up questions in current browser session, without modifying original file
- [ ] Apply approved header-row selection to actual parsed table schema and downstream data advisor
- [ ] Preview before/after header promotion, retained metadata, removed blank/total rows and totals validation
- [ ] Detect merged Excel cells, multi-row headers, footnotes, repeated headers, sheet-level metadata and localized dates
- [ ] Ask contextual questions about ambiguous column types, numeric formats, units, time grain and key uniqueness
- [ ] Learn user-approved preparation patterns per organization after authenticated persistence exists
- [ ] Add realistic import fixture tests and confirm heuristic false-positive rate before any auto-application
- [ ] Translate every proactive question, option and explanation into all five interface languages
- [ ] Verify TypeScript/Vite build, UI interactions and Vercel production deployment after latest changes

## Progressive report discovery — 2026-10-23
- [x] Three-stage, checkbox-based discovery UI: high-level goals, multiple closest report types, then tailored questions per selected type (code committed; build unverified)
- [x] Report categories: project cost, schedule, sales, inventory, executive overview and custom; initial labels/questions in five languages
- [x] Generate read-only report-plan JSON with selected needs, candidate metrics, suggested visuals and follow-up questions
- [x] Mount discovery before semantic modeling wizard in main application
- [ ] Merge discovery results into the existing model wizard and imported-source profiling
- [ ] Use real source columns to prioritize options, detect missing required fields and ask adaptive follow-up questions
- [ ] Let users save/reopen/change selections per workspace securely; preserve multi-select selections across steps
- [ ] Generate executable report specification, validated measures and real visuals from approved selections
- [ ] Verify build, deployed interactions, accessibility, translations and mobile layouts
