# REQUIREMENTS

**Project:** UGC Creator Performance Dashboard
**Version:** v1 (MVP)

---

## Architecture Requirements

### ARCH-01: Next.js Application Shell
**Description:** Use Next.js 15 with App Router for the application shell and route structure
**Priority:** Must have
**Phase:** 1 - Foundation
**Status:** Pending

### ARCH-02: Convex Backend
**Description:** Use Convex as the primary operational backend, database, and real-time query model
**Priority:** Must have
**Phase:** 1 - Foundation
**Status:** Pending

### ARCH-03: Clerk Authentication
**Description:** Use Clerk for authentication and role-aware session identity
**Priority:** Must have
**Phase:** 1 - Foundation
**Status:** Pending

### ARCH-04: Vercel Deployment
**Description:** Deploy to Vercel for app hosting, environment management, and deployment previews
**Priority:** Must have
**Phase:** 1 - Foundation
**Status:** Pending

---

## Authentication Requirements

### AUTH-01: User Sign-in
**Description:** Users can sign in using Clerk authentication
**Priority:** Must have
**Phase:** 1 - Foundation
**Status:** Pending

### AUTH-02: App User Mapping
**Description:** Clerk identity maps to app user record with role
**Priority:** Must have
**Phase:** 1 - Foundation
**Status:** Pending

---

## Data Model Requirements

### DATA-01: Users Table
**Description:** Users table with clerkId, email, name, role, isActive, defaultScopeType
**Priority:** Must have
**Phase:** 1 - Foundation
**Status:** Pending

### DATA-02: Creators Table
**Description:** Creators table with name, displayName, discordHandle, discordId, tier, status, managerId, teamId
**Priority:** Must have
**Phase:** 1 - Foundation
**Status:** Pending

### DATA-03: Creator Accounts Table
**Description:** Creator accounts table with creatorId, platform, handle, profileUrl, isPrimary, isActive
**Priority:** Must have
**Phase:** 1 - Foundation
**Status:** Pending

### DATA-04: Creator Metric Rollups Table
**Description:** Creator metric rollups with creatorId, window (7d/30d/mtd), gmv, orders, itemsSold, postCount, lastUpdatedAt
**Priority:** Must have
**Phase:** 1 - Foundation
**Status:** Pending

### DATA-05: Creator Activities Table
**Description:** Creator activities with creatorId, type (win/loss/observation/adjustment), title, description, recordedBy, recordedAt
**Priority:** Must have
**Phase:** 1 - Foundation
**Status:** Pending

### DATA-06: Tiers Table
**Description:** Tiers table with name, displayName, sortOrder, badgeLabel, badgeTone, commissionRate
**Priority:** Must have
**Phase:** 1 - Foundation
**Status:** Pending

---

## List View Requirements

### LIST-01: Creator List Page
**Description:** Dashboard page at /dashboard displaying paginated creator list
**Priority:** Must have
**Phase:** 2 - Creator Directory
**Status:** Pending

### LIST-02: Search by Name/Handle
**Description:** Search by creator name and Discord handle
**Priority:** Must have
**Phase:** 2 - Creator Directory
**Status:** Pending

### LIST-03: Filter by Tier
**Description:** Filter creator list by tier (bronze, silver, gold)
**Priority:** Must have
**Phase:** 2 - Creator Directory
**Status:** Pending

### LIST-04: Filter by Status
**Description:** Filter by active or inactive status
**Priority:** Must have
**Phase:** 2 - Creator Directory
**Status:** Pending

### LIST-05: Sort by Performance
**Description:** Sort by recent performance (7D GMV, MTD GMV)
**Priority:** Must have
**Phase:** 2 - Creator Directory
**Status:** Pending

### LIST-06: Paginated Browsing
**Description:** Cursor-based pagination for creator list
**Priority:** Must have
**Phase:** 2 - Creator Directory
**Status:** Pending

---

## Detail View Requirements

### DETAIL-01: Creator Detail Page
**Description:** Creator detail page at /creators/[creatorId]
**Priority:** Must have
**Phase:** 3 - Creator Detail
**Status:** Pending

### DETAIL-02: Identity Display
**Description:** Display creator core identity fields (name, displayName, Discord handle)
**Priority:** Must have
**Phase:** 3 - Creator Detail
**Status:** Pending

### DETAIL-03: Linked Accounts
**Description:** Display linked social accounts (TikTok, Instagram, YouTube, Twitch)
**Priority:** Must have
**Phase:** 3 - Creator Detail
**Status:** Pending

### DETAIL-04: Current Metrics
**Description:** Display current metrics panel (7D GMV, MTD GMV, 7D posts)
**Priority:** Must have
**Phase:** 3 - Creator Detail
**Status:** Pending

### DETAIL-05: Recent Activity Feed
**Description:** Display recent activities in descending order
**Priority:** Must have
**Phase:** 3 - Creator Detail
**Status:** Pending

### DETAIL-06: Last Update Timestamps
**Description:** Show last metric update timestamps for freshness visibility
**Priority:** Must have
**Phase:** 3 - Creator Detail
**Status:** Pending

---

## Activity Requirements

### ACT-01: Quick-Add Modal
**Description:** Quick-add modal or inline form for activity creation
**Priority:** Must have
**Phase:** 4 - Activity Logging
**Status:** Pending

### ACT-02: Activity Types
**Description:** Structured activity types: win, loss, observation, adjustment
**Priority:** Must have
**Phase:** 4 - Activity Logging
**Status:** Pending

### ACT-03: Activity Fields
**Description:** Title and description fields for activity
**Priority:** Must have
**Phase:** 4 - Activity Logging
**Status:** Pending

### ACT-04: Auto Metadata
**Description:** Auto-captured actor (user ID) and timestamp
**Priority:** Must have
**Phase:** 4 - Activity Logging
**Status:** Pending

### ACT-05: Optional Fields
**Description:** Tags and impact level (optional)
**Priority:** Nice to have
**Phase:** 4 - Activity Logging
**Status:** Pending

### ACT-06: Real-Time Update
**Description:** Activity appears in creator feed immediately after save
**Priority:** Must have
**Phase:** 4 - Activity Logging
**Status:** Pending

### ACT-07: Validation
**Description:** Activity type, title, and description are required
**Priority:** Must have
**Phase:** 4 - Activity Logging
**Status:** Pending

---

## Role & Access Requirements

### ROLE-01: Admin Global View
**Description:** Admin can view all creators
**Priority:** Must have
**Phase:** 5 - Roles & Export
**Status:** Pending

### ROLE-02: Manager Scoped View
**Description:** Manager can view only assigned creators (managerId match)
**Priority:** Must have
**Phase:** 5 - Roles & Export
**Status:** Pending

### ROLE-03: Viewer Read-Only
**Description:** Viewer has read-only access
**Priority:** Must have
**Phase:** 5 - Roles & Export
**Status:** Pending

### ROLE-04: Backend Scope Enforcement
**Description:** All queries enforce scope in backend, not client
**Priority:** Must have
**Phase:** 5 - Roles & Export
**Status:** Pending

### ROLE-05: Export Scope
**Description:** Export respects role-based visibility
**Priority:** Must have
**Phase:** 5 - Roles & Export
**Status:** Pending

---

## Export Requirements

### EXP-01: CSV Export
**Description:** CSV export of creator list plus visible metrics
**Priority:** Must have
**Phase:** 5 - Roles & Export
**Status:** Pending

### EXP-02: Authorization Parity
**Description:** Export uses same authorization rules as list views
**Priority:** Must have
**Phase:** 5 - Roles & Export
**Status:** Pending

---

## QA Requirements

### QA-01: Performance Target
**Description:** Dashboard first meaningful load under 2 seconds on warm path at 615 creators
**Priority:** Must have
**Phase:** 6 - Hardening & Launch
**Status:** Pending

### QA-02: Role Tests
**Description:** Zero unauthorized data exposure in role-based test scenarios
**Priority:** Must have
**Phase:** 6 - Hardening & Launch
**Status:** Pending

### QA-03: Export Scope Tests
**Description:** Export scope parity verified with UI list scope
**Priority:** Must have
**Phase:** 6 - Hardening & Launch
**Status:** Pending

### QA-04: Stale Data Visibility
**Description:** Stale data is visible with timestamps
**Priority:** Must have
**Phase:** 6 - Hardening & Launch
**Status:** Pending

### QA-05: Error Handling
**Description:** Errors are actionable to user, not technical stack traces
**Priority:** Must have
**Phase:** 6 - Hardening & Launch
**Status:** Pending

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ARCH-01 | Phase 1 | Pending |
| ARCH-02 | Phase 1 | Pending |
| ARCH-03 | Phase 1 | Pending |
| ARCH-04 | Phase 1 | Pending |
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| DATA-03 | Phase 1 | Pending |
| DATA-04 | Phase 1 | Pending |
| DATA-05 | Phase 1 | Pending |
| DATA-06 | Phase 1 | Pending |
| LIST-01 | Phase 2 | Pending |
| LIST-02 | Phase 2 | Pending |
| LIST-03 | Phase 2 | Pending |
| LIST-04 | Phase 2 | Pending |
| LIST-05 | Phase 2 | Pending |
| LIST-06 | Phase 2 | Pending |
| DETAIL-01 | Phase 3 | Pending |
| DETAIL-02 | Phase 3 | Pending |
| DETAIL-03 | Phase 3 | Pending |
| DETAIL-04 | Phase 3 | Pending |
| DETAIL-05 | Phase 3 | Pending |
| DETAIL-06 | Phase 3 | Pending |
| ACT-01 | Phase 4 | Pending |
| ACT-02 | Phase 4 | Pending |
| ACT-03 | Phase 4 | Pending |
| ACT-04 | Phase 4 | Pending |
| ACT-05 | Phase 4 | Pending |
| ACT-06 | Phase 4 | Pending |
| ACT-07 | Phase 4 | Pending |
| ROLE-01 | Phase 5 | Pending |
| ROLE-02 | Phase 5 | Pending |
| ROLE-03 | Phase 5 | Pending |
| ROLE-04 | Phase 5 | Pending |
| ROLE-05 | Phase 5 | Pending |
| EXP-01 | Phase 5 | Pending |
| EXP-02 | Phase 5 | Pending |
| QA-01 | Phase 6 | Pending |
| QA-02 | Phase 6 | Pending |
| QA-03 | Phase 6 | Pending |
| QA-04 | Phase 6 | Pending |
| QA-05 | Phase 6 | Pending |

**Total Requirements:** 42
**Mapped:** 42/42 ✓