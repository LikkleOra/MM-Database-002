# Data Model and Storage Strategy

## Summary

This document defines the recommended logical data model for the project. It expands the source PRD schema into a more durable structure that supports current operational views, historical analysis, and safer scaling.

## Design Goals

- Preserve a simple MVP model for engineering speed
- Avoid schema choices that block history or scale
- Support real-time operator views without overloading queries
- Make metric lineage and freshness explicit
- Keep permission checks straightforward

## Core Modeling Recommendation

Do not rely on a single `performance` table for both current values and history. Split the model into:

- canonical entities
- current operational rollups
- historical metric snapshots
- human-entered activities

This matches how real-world systems tend to evolve: one record type holds the identity, another holds historical facts, and a derived or current-state layer powers the dashboard.

## Recommended Tables

### `users`

Purpose:

- map Clerk identity to application identity and role

Fields:

- `clerkId`
- `email`
- `name`
- `role`
- `isActive`
- `defaultScopeType`
- `createdAt`
- `updatedAt`

Optional:

- `teamId`
- `creatorId` for future self-view users

Notes:

- `clerkId` must be unique and indexed.
- Do not trust email alone as the identity key.

### `teams`

Purpose:

- optional grouping of managers or creator portfolios

Fields:

- `name`
- `description`
- `isActive`
- `createdAt`

Notes:

- This is recommended if more than one operating group exists.
- If the business is still one tight team, this table can exist early without heavy usage.

### `creators`

Purpose:

- canonical creator record

Fields:

- `name`
- `displayName`
- `discordHandle`
- `discordId`
- `tier`
- `status`
- `managerId`
- `teamId`
- `joinedAt`
- `notes`
- `tags`
- `isArchived`
- `createdAt`
- `updatedAt`

Recommended enumerations:

- `tier`: bronze, silver, gold
- `status`: active, inactive, paused, at_risk

Notes:

- Use `status` rather than only `isActive` if you expect richer operational states.
- If UI simplicity requires a dot indicator, derive it from the broader status enum.

### `creator_accounts`

Purpose:

- linked social accounts per creator

Fields:

- `creatorId`
- `platform`
- `handle`
- `profileUrl`
- `platformUserId`
- `isPrimary`
- `isActive`
- `linkedAt`
- `createdAt`
- `updatedAt`

Recommended platforms:

- tiktok
- instagram
- youtube
- twitch

Notes:

- One creator can have multiple accounts on the same platform.
- One account should be markable as primary for display ordering.

### `creator_metric_rollups`

Purpose:

- current operational metrics used by dashboard and detail views

Fields:

- `creatorId`
- `window`
- `gmv`
- `orders`
- `itemsSold`
- `postCount`
- `liveCount`
- `engagementRate`
- `trendLabel`
- `lastEventAt`
- `lastUpdatedAt`
- `source`
- `sourceVersion`

Recommended windows:

- `7d`
- `30d`
- `mtd`

Notes:

- This table is the live operational layer.
- One record per creator per window is acceptable.
- It should be cheap to query and cheap to sort.

### `creator_metric_snapshots`

Purpose:

- historical fact storage for metrics over time

Fields:

- `creatorId`
- `snapshotDate`
- `platform`
- `gmv`
- `orders`
- `itemsSold`
- `postCount`
- `liveCount`
- `engagementRate`
- `source`
- `capturedAt`

Notes:

- Snapshot cadence can be daily for MVP once automation exists.
- If MVP starts with manual data only, snapshots can still exist as occasional fact rows.
- This table enables future charts, trend analysis, and audit trails.

### `creator_activities`

Purpose:

- structured human-entered operational history

Fields:

- `creatorId`
- `type`
- `title`
- `description`
- `tags`
- `impact`
- `recordedBy`
- `recordedAt`
- `effectiveDate`
- `visibility`

Recommended types:

- win
- loss
- observation
- adjustment

Recommended impact:

- low
- medium
- high

Notes:

- `effectiveDate` is useful if a user records something after the fact.
- `visibility` can future-proof manager-only versus all-internal visibility.

### `tiers`

Purpose:

- central definition of tier metadata

Fields:

- `name`
- `displayName`
- `sortOrder`
- `badgeLabel`
- `badgeTone`
- `commissionRate`
- `minGmvEligible`
- `description`
- `isActive`

Notes:

- Keep tier logic data-driven instead of hardcoding labels everywhere.

### `creator_assignments`

Purpose:

- optional support for many-to-many ownership if needed later

Fields:

- `creatorId`
- `userId`
- `assignmentType`
- `assignedAt`
- `isActive`

Use only if:

- a creator can belong to multiple managers,
- coverage rotations matter,
- team-based ownership becomes ambiguous.

For MVP, a single `managerId` on `creators` is simpler.

### `export_jobs`

Purpose:

- track export generation if exports become asynchronous or audited

Fields:

- `requestedBy`
- `filterHash`
- `format`
- `status`
- `rowCount`
- `createdAt`
- `completedAt`
- `downloadUrl`

Notes:

- Optional for MVP.
- Recommended if exports are large or frequent.

## Relationships

- one `user` manages many `creators`
- one `creator` has many `creator_accounts`
- one `creator` has many `creator_activities`
- one `creator` has many `creator_metric_snapshots`
- one `creator` has many `creator_metric_rollups` by window
- one `tier` can apply to many `creators`

## Recommended Indexes

### `users`

- by Clerk id
- by email if needed for admin support

### `creators`

- by manager id
- by team id
- by tier
- by status
- by manager id plus status
- by manager id plus tier

### `creator_accounts`

- by creator id
- by platform plus handle if uniqueness checks matter

### `creator_metric_rollups`

- by creator id
- by window
- by window plus GMV
- by creator id plus window

### `creator_metric_snapshots`

- by creator id plus snapshot date
- by snapshot date

### `creator_activities`

- by creator id plus recordedAt
- by type plus recordedAt
- by recordedBy plus recordedAt

## Derived Fields

These should be documented even if they are not persisted initially:

- active dot status
- at-risk label
- trend label
- tier eligibility flag
- days since last post
- days since last activity log

Only persist them if recomputation becomes too expensive or too inconsistent.

## Data Freshness Rules

Every metric-facing record should carry:

- source
- lastUpdatedAt
- optional sourceVersion or import batch id

This is necessary because operators make decisions from these numbers. A stale number without a timestamp is a product defect.

## Data Retention Recommendations

### Keep indefinitely

- creators
- accounts
- activities
- tier definitions
- user records

### Keep long-term

- historical metric snapshots

### Can be pruned or rotated

- export jobs
- low-level import traces if introduced later

## CSV Export Shape

The initial export should flatten the most important fields:

- creator name
- Discord handle
- tier
- status
- manager
- 7D GMV
- MTD GMV
- 7D posts
- last metric update

Do not export nested account arrays into one unreadable cell unless explicitly required. Prefer either:

- one row per creator with summarized account fields, or
- a separate account export later.

## Data Quality Risks

### Duplicate creators

If creator import is manual, duplicate records are likely.

Mitigation:

- unique-ish review rules on name plus Discord handle,
- admin duplicate review workflow later.

### Metric ambiguity

GMV may not mean the same thing across sources.

Mitigation:

- source field,
- metric definition docs,
- import-layer normalization rules.

### Missing ownership

Creators without a valid manager or team create permission and reporting ambiguity.

Mitigation:

- creator creation requires ownership assignment,
- admin review query for unassigned creators.

## Recommended MVP Schema Decision

If engineering time is limited, implement these first:

- users
- creators
- creator_accounts
- creator_metric_rollups
- creator_activities
- tiers

Add `creator_metric_snapshots` as early as practical even if it is lightly populated, because it prevents a later migration from "current state only" to "historical analysis supported."

## Sources

- [UGC_CREATOR_DASHBOARD_PRD.md](</C:/Users/Lenovo/Downloads/MM Database/docs/UGC_CREATOR_DASHBOARD_PRD.md>)
- Convex database overview: https://docs.convex.dev/database
- Convex indexes: https://docs.convex.dev/database/reading-data/indexes/
- Convex pagination: https://docs.convex.dev/database/pagination
- TikTok Affiliate Center analytics: https://seller-us.tiktok.com/university/essay?knowledge_id=6115786490283790&lang=en

