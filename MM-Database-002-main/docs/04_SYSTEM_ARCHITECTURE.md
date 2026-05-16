# System Architecture

## Summary

The system should be built as a web application with:

- Next.js 15 for the application shell and route structure
- Convex for the primary operational backend, database, and real-time query model
- Clerk for authentication and role-aware session identity
- Vercel for deployment and web-facing runtime

This document refines the source PRD architecture into a more production-safe model suitable for an internal operator dashboard.

## Architectural Goal

Support a high-signal operational dashboard for 615+ creators at launch, while preserving a clear path to 2,000+ creators without rewriting the core data flow.

## High-Level Architecture

### Client layer

The Next.js application owns:

- route composition
- page-level data wiring
- server and client boundary management
- UI state
- optimistic UX only where operationally safe
- export initiation

### Auth layer

Clerk owns:

- authentication
- session lifecycle
- user identity
- optional organization context if later needed

The app owns:

- application-level roles
- manager-to-creator scope enforcement
- note and export permissions

### Data and function layer

Convex owns:

- source-of-truth operational data
- queries
- mutations
- access checks inside backend functions
- real-time subscriptions
- indexed reads

### Deployment layer

Vercel owns:

- app hosting
- environment management
- deployment previews
- web analytics and speed insights

## Recommended Runtime Shape

### Next.js usage model

Use the App Router. Keep routing clear and shallow:

- `/dashboard`
- `/creators/[creatorId]`
- `/reports`
- `/settings`

Use server-rendered shells where helpful for boot and auth framing, but treat the operational data surfaces as client-driven via Convex subscriptions.

### Convex usage model

Use Convex as the primary operational data backend, not just a side database. Official docs note that Convex query functions are automatically reactive, cached, and propagated consistently across subscribed clients. That is a good fit for a dashboard where many users need a synchronized view of the same creator roster.

### Clerk usage model

Use Clerk for identity, then map Clerk user identity into the app's own `users` table. Official Convex docs show Clerk integration through `ConvexProviderWithClerk` and `ctx.auth.getUserIdentity()`, which should be treated as the standard path for all protected queries and mutations.

## Domain Architecture

Treat the system as six domains:

### Identity domain

- users
- roles
- manager assignment
- optional team membership

### Creator domain

- creators
- linked social accounts
- creator tags
- lifecycle state

### Metric domain

- current rollups
- historical snapshots
- metric source metadata
- last refresh state

### Activity domain

- wins
- losses
- observations
- adjustments
- audit-friendly event history

### Reporting domain

- dashboard list view
- manager rollups
- exports
- at-risk segments

### Integration domain

- Discord lookup or sync
- GMV import
- webhook ingestion
- outbound notifications later

## Data Flow

Use the following end-to-end shape.

### Inbound metric flow

1. Source data arrives from manual entry or later automation.
2. Data is normalized into raw or snapshot form.
3. Current rollups are recalculated or replaced for the active windows.
4. Dashboard list and creator detail subscriptions update automatically.

### Activity flow

1. Manager opens creator detail.
2. Manager submits a structured activity.
3. Backend validates role and creator scope.
4. Activity record is stored with actor and timestamp.
5. Creator detail feed updates immediately.
6. Optional dashboard badges or counters update if relevant.

### Export flow

1. User initiates export with visible filters.
2. Backend re-validates authorization.
3. Export is generated from the same scoped query semantics as the dashboard.
4. File is returned or staged for download depending on size.

## Recommended Query Strategy

### Dashboard query

The dashboard query should return a shaped roster optimized for table display, not raw table collections.

It should include:

- creator identity subset
- current 7D metrics
- current MTD metrics
- status
- tier
- last metric update
- recent activity summary if cheap

It should not require the client to fan out into one query per creator.

### Creator detail query

The creator detail query should return:

- creator record
- linked accounts
- current rollups
- recent activity page
- optional historical chart points later

### Rollup query

The manager rollup query should be separate from the dashboard list. Do not overload the dashboard list query with every aggregate needed by reports.

## Pagination and Scale Strategy

Public Convex docs are explicit that paginated queries should use cursor-based pagination via `.paginate(paginationOpts)` and `usePaginatedQuery`. That guidance should be followed for:

- dashboard creators list once data volume grows,
- activity timeline feeds,
- report views where the result set can exceed one page.

Avoid loading all creators into memory for filtering in the application layer. The sample query in the source PRD does this for search and role filtering. That is acceptable for a sketch, but it is not the right long-term production shape.

## Index Strategy

Convex docs also make clear that indexes determine query speed and ordering. Build indexes around actual access patterns, not only entity relationships.

Minimum likely indexes:

- creators by manager
- creators by tier
- creators by active status
- accounts by creator
- activities by creator and event time
- activities by type and event time
- metric snapshots by creator and date
- current rollups by creator and window
- users by Clerk id

Potential composite indexes:

- current rollups by window and GMV
- creators by manager and active status
- activities by creator and type

## Real-Time Design Guidance

Convex official docs note three relevant properties:

- query results are automatically reactive,
- cached results are reused,
- clients update to the same data snapshot.

That is useful, but the app still needs restraint:

- live updates should target views that benefit operationally,
- heavy global list queries should remain shaped and paginated,
- write storms from batch updates should not trigger expensive full recomputation on the client.

## Error and Failure Modes

### Auth mismatch

Risk:

- Clerk identity exists but no app user mapping exists.

Response:

- fail closed,
- show controlled unauthorized or provisioning-needed state,
- add admin tooling later for user provisioning.

### Stale metrics

Risk:

- a creator appears healthy but the metrics are old.

Response:

- store `lastUpdated`,
- expose freshness on list and detail views,
- optionally mark stale records.

### Partial integration failure

Risk:

- one import source updates some creators but not others.

Response:

- source and freshness metadata per metric record,
- job logs later,
- avoid silent overwrite.

### Overbroad role query

Risk:

- a manager sees creators outside their scope.

Response:

- all scope checks on the backend,
- no trust in client filters,
- export path reuses same scope logic.

## Recommended Architecture Adjustments To The Source PRD

### Adjustment 1: Separate current rollups from history

The source PRD uses one `performance` table keyed by creator and period. That is enough for a demo but too weak for trend analysis and auditing. Use:

- `creator_metric_snapshots` for historical facts
- `creator_metric_rollups` for current 7D, 30D, and MTD operational views

### Adjustment 2: Avoid array-based manager ownership where possible

If the manager-to-creator relationship is single-owner for MVP, store `managerId` on creator and derive team views from that. Use separate assignment records only if multi-owner semantics become necessary.

### Adjustment 3: Add an audit-friendly mutation model

Any role change, tier change, or performance override should be loggable later. Even if a formal audit log is deferred, the architecture should not block it.

## Recommended Route and Feature Map

- `/dashboard`: list, filters, summary cards, export entry
- `/creators/[creatorId]`: detail, metrics, accounts, activities
- `/reports`: manager rollups, exports, later saved views
- `/settings`: user provisioning, tier definitions, later integration settings

## Observability Architecture

Use:

- Vercel Web Analytics for traffic and route usage
- Vercel Speed Insights for web performance
- product analytics later for adoption events
- application-level mutation and import logging for operational support

## Sources

- [UGC_CREATOR_DASHBOARD_PRD.md](</C:/Users/Lenovo/Downloads/MM Database/docs/UGC_CREATOR_DASHBOARD_PRD.md>)
- Convex realtime: https://docs.convex.dev/realtime
- Convex pagination: https://docs.convex.dev/database/pagination
- Convex indexes: https://docs.convex.dev/database/reading-data/indexes/
- Convex with Clerk: https://docs.convex.dev/auth/clerk
- Clerk Organizations overview: https://clerk.com/docs/guides/organizations/overview
- Vercel Next.js docs: https://vercel.com/docs/frameworks/nextjs
- Vercel Speed Insights: https://vercel.com/docs/speed-insights

