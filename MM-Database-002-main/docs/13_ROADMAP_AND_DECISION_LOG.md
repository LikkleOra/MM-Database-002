# Roadmap and Decision Log

## Summary

This document records the intended delivery sequence, the major defaults chosen so far, and the decisions that should not be re-litigated during implementation unless new information appears.

## Delivery Roadmap

### Phase 1: Foundation MVP

Goal:

Deliver a stable internal creator operations dashboard.

Target capabilities:

- auth and role-aware access
- creator list
- creator detail
- linked accounts
- current metric rollups
- activity logging
- search and filters
- tier and status visibility
- CSV export

### Phase 2: Operational Expansion

Goal:

Reduce manual work and improve reporting quality.

Candidate capabilities:

- Discord lookup or summary sync
- webhook or import-based GMV ingestion
- team rollups
- richer reports
- bulk tier updates
- responsive refinement

### Phase 3: Intelligence and Automation

Goal:

Add predictive, automated, or advisory capabilities once the operating model is trusted.

Candidate capabilities:

- AI recommendations
- risk flags
- scheduled reporting
- advanced saved filters
- more workflow automation

## Decisions Locked For Now

### The system is internal-first

Reason:

The product is intended to support operators, not behave as a broad creator-facing portal.

### Manual or low-automation metrics are acceptable for MVP

Reason:

The operating model needs validation before automation complexity is justified.

### Role-based access is part of MVP

Reason:

This is a core trust and governance requirement, not a later enhancement.

### Activity logging is core, not optional

Reason:

Without intervention history, the dashboard becomes a passive report instead of an operating system.

### Export is MVP

Reason:

Operational teams will continue to need external artifacts even if the app is the system of record.

## Recommended Technical Defaults

- use Next.js App Router
- use Convex as primary operational backend
- use Clerk for authentication
- deploy on Vercel
- use current rollups plus historical metric snapshots
- enforce authorization in backend queries and mutations

## Open Decisions Still Worth Revisiting During Build

### Creator self-view timing

Recommendation:

defer until manager workflows are stable and note visibility rules are clear.

### Team model complexity

Recommendation:

start with `managerId` on creator unless true multi-owner workflows already exist.

### Metric source normalization

Recommendation:

agree on one canonical GMV definition before automation.

### Export implementation shape

Recommendation:

start synchronous if datasets are small, introduce export jobs only if needed.

## Risks That Could Change The Roadmap

### Rapid growth in creator volume

Impact:

- stronger pagination,
- more aggressive query shaping,
- more reporting infrastructure.

### External data source instability

Impact:

- delays automation,
- increases need for freshness and manual override semantics.

### New stakeholder requirements

Impact:

- self-service creator views,
- more granular permissions,
- more advanced reporting.

## Decision Logging Guidance

When implementation begins, log decisions that affect:

- metric definitions
- role semantics
- schema changes
- export shape
- integration timing
- source-of-truth ownership

Each decision should record:

- date
- owner
- decision
- rationale
- impact

## Recommended Immediate Next Build Order

1. auth and user mapping
2. creator and role-scoped list
3. creator detail
4. activity logging
5. export and QA hardening

## Sources

- [UGC_CREATOR_DASHBOARD_PRD.md](</C:/Users/Lenovo/Downloads/MM Database/docs/UGC_CREATOR_DASHBOARD_PRD.md>)
- [03_MVP_SCOPE.md](</C:/Users/Lenovo/Downloads/MM Database/docs/03_MVP_SCOPE.md>)
- [04_SYSTEM_ARCHITECTURE.md](</C:/Users/Lenovo/Downloads/MM Database/docs/04_SYSTEM_ARCHITECTURE.md>)

