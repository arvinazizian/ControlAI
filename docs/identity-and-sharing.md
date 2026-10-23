# ControlAI — Identity, Organizations and Secure Sharing (Design v0.1)

**Status: architecture proposal, not implemented.** No authorization enforcement is active in the current frontend prototype.

## Product behavior
- Every person has their own identity/account, verified email and session.
- One person may belong to multiple organizations and choose an active organization.
- Each organization owns workspaces, projects, datasets, visualizations, dashboards, glossaries and AI connector configurations.
- Invitations target a specific verified email address; accept only when the authenticated account controls that address. Expire, revoke, resend and audit invitations.
- Domain allowlists may restrict eligibility but **do not auto-grant access** solely because an address ends in a company domain.
- Share a report, dashboard, or dataset with a member or group, specifying viewer/editor/manager and optionally an expiry. A share never overrides organization membership or dataset permissions.
- Display an accessible "Shared with me" area and a permission management panel.
- Optional enterprise SSO/OIDC/SAML and SCIM provisioning later, subject to provider support and licensing.

## Roles (initial proposal)
| Role | Scope | Rights |
| --- | --- | --- |
| Organization Owner | organization | manage members, settings, billing, policies |
| Organization Admin | organization | manage membership, groups and workspace permissions |
| Workspace Manager | workspace | manage workspace resources and shares |
| Editor | permitted resources | edit visuals and dashboards, subject to data access |
| Viewer | permitted resources | view only |
| Data Steward | permitted datasets | approve data access, mappings, definitions |
| Guest | explicitly shared resources | constrained read-only access when organization policy allows |

Enforce permissions on the server/database, never solely by hiding UI buttons. Owner/Admin rights do not automatically bypass sensitive dataset restrictions unless the organization policy explicitly grants that authority.

## Proposed relational model
- profiles(user_id, display_name)
- organizations(id, name, verified_domain_policy)
- organization_memberships(org_id, user_id, role, status)
- groups(id, org_id, name)
- group_memberships(group_id, user_id)
- workspaces(id, org_id, name)
- workspace_memberships(workspace_id, user_id, role)
- projects(id, org_id, workspace_id, name)
- datasets(id, org_id, workspace_id, owner_id, classification, ...)
- dataset_grants(id, dataset_id, principal_type, principal_id, permission)
- dashboards(id, org_id, workspace_id, owner_id, ...)
- visualizations(id, org_id, dashboard_id, dataset_id, spec_json, ...)
- resource_grants(id, org_id, resource_type, resource_id, principal_type, principal_id, permission, expires_at)
- invitations(id, org_id, email_normalized, invited_role, invited_by, expires_at, accepted_at, revoked_at)
- glossary_terms(id, org_id, key, aliases, definition, formula, version)
- ai_connectors(id, org_id, provider, config_reference, status)
- audit_events(id, org_id, actor_id, action, resource, timestamp, metadata)

## Authorization invariant
Allow access only if:
1. User has a valid authenticated session.
2. User has active membership in the resource's organization.
3. User has sufficient workspace/resource grants for the requested action.
4. For a visual backed by a dataset, user also has sufficient dataset/row/column permissions.
5. Share is unexpired and not revoked; organization data classification rules permit sharing.

All database rows carry org_id where appropriate. Use server-side policy checks and Postgres RLS, including policies for indirect references, inserts and updates. Keep service credentials server-side only. Validate access on exports, drilldown, chart queries, files and AI requests too.

## User journeys
1. Register/login -> verify email -> choose or request organization -> accept invitation.
2. Organization admin -> invite email -> choose organization/workspace/role -> recipient accepts.
3. Editor -> Share dashboard -> select existing organization member/group -> choose view/edit -> grant access.
4. Recipient -> Shared with me -> open permitted dashboard -> underlying dataset authorization checked again.
5. Admin -> revoke membership/share -> access ends server-side; audit event recorded.

## Security and rollout plan
- First implement authentication and membership, then read-only RLS and negative cross-tenant tests.
- Next add invitation workflow, sharing permissions, and audit logs.
- Test owner/member/guest/non-member access and IDOR attacks with synthetic data.
- Do not activate public sharing links by default. No cross-organization sharing until explicit policy and security review.
- Enterprise identity and AI connectors must use explicit administrator consent, scoped credentials, encryption and secret rotation.
- Browser localStorage glossary is temporary demo behavior and must not be treated as enterprise-secure storage.
