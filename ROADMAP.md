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
