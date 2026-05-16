# MVP Scope and Release Contract

## Summary

This document defines the minimum acceptable release for the first production version of the UGC Creator Performance Dashboard. It should be treated as a contract. Features not described here are not part of MVP unless explicitly approved in the roadmap or decision log.

## MVP Objective

Ship a stable internal dashboard that lets managers:

- see a ranked list of creators,
- inspect a creator in detail,
- log wins, losses, observations, and adjustments,
- filter the roster by operational signals,
- export basic creator and performance data,
- enforce role-based visibility.

## User Outcomes Required For MVP

### Outcome 1: Roster review

An operator can open the dashboard and identify:

- top recent performers,
- inactive creators,
- creators with declining recent activity,
- creators with recent logged issues,
- creators eligible for follow-up.

### Outcome 2: Creator investigation

An operator can open a creator record and answer:

- who this creator is,
- what accounts are linked,
- what their recent numbers are,
- what has happened recently,
- what changes have been made to their strategy or status.

### Outcome 3: Durable intervention logging

An operator can record and later review:

- wins,
- losses,
- observations,
- adjustments,
- who recorded them,
- when they were recorded.

### Outcome 4: Basic reporting

A lead can export a snapshot of creator data and performance for external review or weekly operations.

## Must-Have Features

### Creator directory

- Creator list page
- Search by creator name and Discord handle
- Filter by tier
- Filter by active or inactive status
- Sort by recent performance
- Paginated browsing

### Creator profile

- Single creator detail page
- Core identity fields
- Linked account list
- Current metrics panel
- Recent activity feed
- Last updated timestamps for metrics

### Activity logging

- Quick-add modal or inline form
- Structured activity type
- Title and description
- Automatic actor and timestamp capture
- Tags optional
- Impact level optional

### Role-based access

- Admin can view all creators
- Manager can view assigned creators or team scope
- Viewer is read-only
- Creator self-view is optional and should remain off by default unless implemented safely

### Status and tier visibility

- Active or inactive indicator
- Tier badge
- Clear creator state in list and detail views

### Export

- CSV export of creator list plus visible metrics
- Export respects role scope

## Nice-To-Have But Not MVP

These can exist in design docs but must not block launch:

- Timeline view across all creators
- Bulk tier assignment
- Discord syncing
- Mobile-optimized management workflows beyond responsive viewing
- Notifications
- AI recommendations
- Automatic GMV ingestion
- Advanced custom filter builder

## Explicitly Out Of Scope

- Payments
- Contracting
- Brand safety workflows
- Content approvals
- Ad spend tracking
- Cross-brand tenant support
- Marketplace discovery
- Advanced forecasting or simulation
- Full creator self-service

## MVP Data Requirements

The MVP must support these core entities:

- Creators
- Accounts
- Current performance rollups
- Historical activities
- Users
- Tiers

Recommended addition:

- Historical metric snapshots, even if limited, so the system can support later trend logic without schema regret.

## MVP Functional Requirements

### Dashboard list

Required columns:

- creator name
- Discord handle
- tier
- active status
- 7D GMV
- MTD GMV
- 7D posts
- last metric update

Optional columns if cheap:

- manager
- recent activity count
- trend label

### Creator detail

Required sections:

- header with identity and tier
- linked accounts
- metric summary
- recent activity feed
- add activity action

### Activity submission

Required validation:

- activity type required
- title required
- description required
- creator association required

Required metadata:

- recorded by user id
- recorded at timestamp
- source defaults to manual user entry

## Acceptance Criteria

### Dashboard acceptance

- A signed-in admin can view all creators.
- A signed-in manager can view only their authorized scope.
- The list updates without manual page refresh when a creator record or current metric changes.
- Search returns matching creators by name or Discord handle.
- Filters can be combined without breaking pagination.

### Creator detail acceptance

- The page loads the creator record, linked accounts, current metrics, and recent activities in one coherent view.
- Opening a nonexistent or unauthorized creator id returns a controlled error state.
- Recent activities are shown in descending order of event time.

### Activity logging acceptance

- Logging a new activity makes it visible on the creator profile immediately after save.
- Actor and timestamp are system-generated and not user-editable.
- Read-only users cannot create activities.

### Export acceptance

- Exported CSV contains only records visible to the requesting user.
- Column names are stable and human-readable.
- Empty fields export predictably.

## Non-Functional Requirements

### Performance

- Dashboard load should remain usable at 615 creators without client-side full dataset processing.
- Activity feeds should paginate.
- The app must avoid N+1 query behavior for list-level performance data.

### Security

- Every list and detail query is scoped by authenticated identity and role.
- Mutation endpoints re-check permission server-side.
- Export endpoints use the same authorization rules as list views.

### Operability

- Metric freshness is visible.
- Errors are actionable to the user.
- Admin users can identify missing or stale data without engineering involvement.

## Recommended Release Slices

### Slice 1

- Auth
- creator list
- creator detail
- tier and status display

### Slice 2

- activity logging
- recent activities feed
- role scoping

### Slice 3

- export
- QA hardening
- launch checks

## Scope Guard Questions

Use these questions before adding anything during MVP:

1. Does this help managers review the roster faster?
2. Does this improve creator investigation quality?
3. Does this improve intervention logging or reporting?
4. Can the release succeed without it?

If the answer to the first three is no and the fourth is yes, it is not MVP.

## Dependencies For MVP Completion

- Clerk authentication configured
- Convex schema deployed
- A seed dataset or imported initial creator dataset
- Agreement on GMV field definitions
- Clear manager-to-creator ownership model
- CSV export format approved

## Sources

- [UGC_CREATOR_DASHBOARD_PRD.md](</C:/Users/Lenovo/Downloads/MM Database/docs/UGC_CREATOR_DASHBOARD_PRD.md>)
- TikTok Affiliate Center analytics: https://seller-us.tiktok.com/university/essay?knowledge_id=6115786490283790&lang=en
- Convex realtime: https://docs.convex.dev/realtime
- Convex pagination: https://docs.convex.dev/database/pagination
- Convex with Clerk: https://docs.convex.dev/auth/clerk
