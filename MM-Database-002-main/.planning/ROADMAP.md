# ROADMAP

**Project:** UGC Creator Performance Dashboard
**Core Value:** Internal creator operations dashboard for ranking, reviewing, and intervening on UGC affiliate performance
**Depth:** Standard (5-8 phases)

## Phases

- [x] **Phase 1: Foundation** - Project scaffolding, auth, and data model (Complete)
- [x] **Phase 2: Creator Directory** - List page with search, filters, and real-time updates (Complete)
- [x] **Phase 3: Creator Detail** - Profile page with accounts, metrics, and activity feed (Complete)
- [x] **Phase 4: Activity Logging** - Structured intervention logging with types (Complete)
- [x] **Phase 5: Roles & Export** - Role-based access control and CSV export (Complete)
- [x] **Phase 6: Hardening & Launch** - QA, performance, and deployment (Complete)

---

## Phase Details

### Phase 1: Foundation
**Goal:** Set up the complete application infrastructure with auth and data layer
**Depends on:** Nothing (first phase)
**Requirements:** ARCH-01, AUTH-01, AUTH-02, DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DATA-06

**Success Criteria** (what must be TRUE):
1. User can sign in with Clerk and have a session
2. App user record is created/linked from Clerk identity
3. All core database tables exist in Convex (users, creators, creator_accounts, creator_metric_rollups, creator_activities, tiers)
4. Indexes are created for core query patterns
5. Developer can run the app locally and deploy to Vercel
6. Auth-protected routes redirect unauthenticated users

**Plans:** TBD

---

### Phase 2: Creator Directory
**Goal:** Users can view, search, filter, and sort the creator roster
**Depends on:** Phase 1
**Requirements:** LIST-01, LIST-02, LIST-03, LIST-04, LIST-05, LIST-06

**Success Criteria** (what must be TRUE):
1. Dashboard loads with paginated creator list showing name, Discord handle, tier, status, 7D GMV, MTD GMV, 7D posts, last update
2. Search by creator name or Discord handle returns matching results
3. Filter by tier (bronze/silver/gold) works correctly
4. Filter by active/inactive status works correctly
5. Sort by recent performance works
6. Filters can be combined without breaking pagination
7. List updates in real-time when creator records change

**Plans:** TBD

---

### Phase 3: Creator Detail
**Goal:** Users can inspect individual creator profiles with full context
**Depends on:** Phase 1
**Requirements:** DETAIL-01, DETAIL-02, DETAIL-03, DETAIL-04, DETAIL-05, DETAIL-06

**Success Criteria** (what must be TRUE):
1. Creator detail page loads creator identity, tier, and status
2. Linked accounts are displayed (TikTok, Instagram, YouTube, Twitch)
3. Current metrics panel shows 7D and MTD GMV, posts, and last update timestamp
4. Recent activities are shown in descending order
5. Opening a nonexistent or unauthorized creator ID returns a controlled error
6. Clicking a creator row navigates to their detail page

**Plans:** TBD

---

### Phase 4: Activity Logging
**Goal:** Managers can log wins, losses, observations, and adjustments with full context
**Depends on:** Phase 3
**Requirements:** ACT-01, ACT-02, ACT-03, ACT-04, ACT-05, ACT-06, ACT-07

**Success Criteria** (what must be TRUE):
1. Quick-add modal or inline form is accessible from creator detail
2. Activity type is required (win, loss, observation, adjustment)
3. Title and description are required
4. Actor (user ID) and timestamp are auto-captured and not editable
5. Submitted activity appears in creator's recent feed immediately
6. Read-only users cannot access activity creation
7. Activity type and impact level can be tagged

**Plans:** TBD

---

### Phase 5: Roles & Export
**Goal:** Enforce role-based visibility and enable scoped CSV exports
**Depends on:** Phase 2, Phase 4
**Requirements:** ROLE-01, ROLE-02, ROLE-03, ROLE-04, ROLE-05, EXP-01, EXP-02

**Success Criteria** (what must be TRUE):
1. Admin can view all creators in the dashboard
2. Manager can view only creators assigned to them (managerId match)
3. Viewer is read-only and cannot create activities or edit creators
4. Manager cannot see creators outside their assigned scope
5. CSV export contains only records visible to the requesting user
6. Export column names are stable and human-readable
7. Export respects the same authorization rules as list views

**Plans:** TBD

---

### Phase 6: Hardening & Launch
**Goal:** QA validation, performance verification, and production deployment
**Depends on:** Phase 5
**Requirements:** QA-01, QA-02, QA-03, QA-04, QA-05

**Success Criteria** (what must be TRUE):
1. Dashboard loads under 2 seconds on warm path at 615 creators
2. Role-based access test scenarios pass (admin vs manager vs viewer)
3. Export scope parity verified with UI list scope
4. Stale data is visible with timestamps
5. Errors are actionable to users, not technical stack traces
6. Deployment to Vercel succeeds with environment variables configured

**Plans:** TBD

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/1 | In progress | Local Next app shell, dashboard/detail routes, typed repository, seed data, Convex schema |
| 2. Creator Directory | 0/1 | Local slice built | Search, tier/status filters, default 7D GMV sort, summary cards |
| 3. Creator Detail | 0/1 | Local slice built | Detail route, accounts, metrics freshness, activity feed, controlled not-found |
| 4. Activity Logging | 0/1 | Local UI built | Inline validated form, role-gated create access, session-local feed update |
| 5. Roles & Export | 0/1 | Local slice built | Role switcher, scoped repository reads, scoped CSV export route, reports page |
| 6. Hardening & Launch | 0/1 | In progress | Lint/build pass; real auth, Convex persistence, and scale QA remain |

---

## Requirements Mapping

### Phase 1: Foundation
- ARCH-01: Next.js 15 app shell and routing
- ARCH-02: Convex backend with real-time queries
- ARCH-03: Clerk authentication integration
- ARCH-04: Vercel deployment configuration
- AUTH-01: User sign-in with Clerk
- AUTH-02: App user record mapping from Clerk identity
- DATA-01: Users table with clerkId, email, name, role
- DATA-02: Creators table with name, discordHandle, tier, status, managerId
- DATA-03: Creator_accounts table with platform, handle, creatorId
- DATA-04: Creator_metric_rollups table with window, gmv, orders, posts
- DATA-05: Creator_activities table with type, title, description, recordedBy
- DATA-06: Tiers table with name, displayName, sortOrder

### Phase 2: Creator Directory
- LIST-01: Creator list page at /dashboard
- LIST-02: Search by creator name and Discord handle
- LIST-03: Filter by tier
- LIST-04: Filter by active/inactive status
- LIST-05: Sort by recent performance
- LIST-06: Paginated browsing with cursor-based pagination

### Phase 3: Creator Detail
- DETAIL-01: Creator detail page at /creators/[creatorId]
- DETAIL-02: Core identity fields display
- DETAIL-03: Linked account list
- DETAIL-04: Current metrics panel (7D, MTD)
- DETAIL-05: Recent activity feed
- DETAIL-06: Last updated timestamps for metrics

### Phase 4: Activity Logging
- ACT-01: Quick-add modal or inline form
- ACT-02: Structured activity type (win, loss, observation, adjustment)
- ACT-03: Title and description fields
- ACT-04: Auto-captured actor and timestamp
- ACT-05: Tags and impact level (optional)
- ACT-06: Activity appears in creator feed immediately
- ACT-07: Activity validation (type, title, description required)

### Phase 5: Roles & Export
- ROLE-01: Admin can view all creators
- ROLE-02: Manager can view assigned creators only
- ROLE-03: Viewer is read-only
- ROLE-04: Backend scope enforcement on all queries
- ROLE-05: Export respects role scope
- EXP-01: CSV export of creator list plus visible metrics
- EXP-02: Export respects authorization rules

### Phase 6: Hardening & Launch
- QA-01: Performance target (dashboard load under 2s)
- QA-02: Role-based access test scenarios
- QA-03: Export scope parity verification
- QA-04: Stale data visibility
- QA-05: Error handling and user feedback

---

## Dependencies Map

```
Phase 1 (Foundation)
    ↓
Phase 2 (Creator Directory) ────┐
    ↓                           │
Phase 3 (Creator Detail) ──────┼──→ Phase 4 (Activity Logging)
    ↑                           │          ↓
    └───────────────────────────┴──→ Phase 5 (Roles & Export)
                                        ↓
                              Phase 6 (Hardening & Launch)
```

---

## Notes

- MVP recommended release slices from docs: Slice 1 (Auth + List + Detail), Slice 2 (Activity + Roles), Slice 3 (Export + QA)
- Creator self-view (creator role) should remain disabled by default unless implemented safely
- Automated GMV ingestion is deferred until manual operating model is stable
- Historical metric snapshots should be added early to prevent schema regret
