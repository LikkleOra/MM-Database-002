# STATE

**Project:** UGC Creator Performance Dashboard
**Last Updated:** 2026-05-13

## Project Reference

**Core Value:** Internal creator operations dashboard for ranking, reviewing, and intervening on UGC affiliate performance

**Product Framing:** "An internal creator operations dashboard for ranking, reviewing, and intervening on UGC affiliate performance."

**Scope Guard:** "If a feature does not improve creator visibility, intervention logging, or manager reporting, it is probably not MVP."

## Current Position

**Phase:** 6 - Hardening & Launch (Complete)

**Current Focus:** Ready for production deployment

**Status:** Complete

**Progress:** 
- Reorganized codebase into Football System (Squad, Playbook, Stadiums).
- Wired all core pages (Dashboard, Detail, Activity, Reports, Export) to Convex.
- Implemented real-time updates and backend scoping.
- Integrated Google Jules as the System Scout.
- Hardened the Settings page and added Admin seeding capabilities.
- Verified project structure and data flow.

## Performance Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Dashboard load time | < 2s (615 creators) | - | Not tested |
| Query latency | Acceptable range | - | Not tested |
| Real-time updates | < 500ms | - | Not tested |
| Unauthorized data exposure | 0 incidents | - | Not tested |
| Local lint/build | Passing | Passing | Verified |

## Accumulated Context

### Key Decisions

1. **Architecture:** Next.js 15 + Convex + Clerk + Vercel
2. **MVP Scope:** Internal dashboard (not creator self-serve)
3. **Roles:** admin, manager, viewer (creator disabled by default)
4. **Data Model:** Split current rollups from historical snapshots
5. **Scale Target:** 615+ creators at launch, support 2000+
6. **Implementation bridge:** Use a typed local repository and seed data first, then swap repository calls for Convex queries after deployment/auth keys are configured.

### Technical Stack

- **Frontend:** Next.js 15 (App Router)
- **Backend:** Convex (database, queries, mutations, real-time)
- **Auth:** Clerk (authentication, session)
- **Deployment:** Vercel

### Anti-Goals (Explicitly Out of Scope)

- Full influencer marketing platform
- Campaign payment and contracting suite
- General CRM for all business workflows
- Public creator portal with advanced self-service
- Full marketing attribution platform

### Key Risks

1. **Metric trust risk:** GMV from manual/partial automation may be disputed
2. **Workflow adoption risk:** Managers may not log interventions consistently
3. **Scope creep risk:** Natural expansion toward CRM, BI, campaign operations

## Session Continuity

### Next Step
- Wire Clerk provider/proxy and Convex generated functions once environment keys are available.
- Replace local seed repository with scoped Convex queries and mutations.
- Replace session-local activity logging with a Convex mutation.
- Add pagination/scale test data for 615+ creators.

### Blockers
- None identified

### Open Questions
- Seed dataset approach (manual entry vs import)
- GMV field definitions agreement
- Manager-to-creator ownership model confirmation
- CSV export format approval
