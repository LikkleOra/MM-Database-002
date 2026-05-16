# Core Workflows

## Summary

This document specifies the end-to-end workflows that define the product. If these flows are awkward, slow, or incomplete, the product will not be operationally useful even if the schema and architecture are technically correct.

## Workflow Design Principles

- The dashboard is for repeated daily use.
- Most user actions begin from the creator list.
- The creator detail view is the main intervention surface.
- Logging must be faster than writing a Discord message or spreadsheet note.
- Every flow must preserve role scope.

## Workflow 1: Review Creator Roster

### User

Manager or admin

### Trigger

User opens `/dashboard`

### Goal

Identify top performers, inactive creators, and creators needing follow-up.

### Required system behavior

1. Authenticate the user.
2. Resolve role and allowed scope.
3. Load the dashboard list with current filters or defaults.
4. Display creators ranked by default operational sort.
5. Show enough summary data to support triage without opening each creator.

### Required visible data

- creator name
- Discord handle
- tier
- status
- 7D GMV
- MTD GMV
- 7D post count
- last update timestamp

### Expected user decisions

- who to inspect,
- who is underperforming,
- who is inactive,
- who might need a tier review.

### Failure states

- no creators in scope
- stale metrics
- unauthorized
- partial metric availability

### Acceptance criteria

- list loads within acceptable performance target
- filters and search update results predictably
- role scope is respected
- stale data is visible as stale

## Workflow 2: Search and Filter

### User

Manager, admin, or viewer

### Trigger

User searches or applies filters in dashboard

### Goal

Narrow the roster to an operational segment.

### Core filters

- search text
- tier
- status
- manager scope where relevant
- recent performance brackets later

### Real-world parallels

TikTok Affiliate Center and mature creator platforms expose time and segment filtering as a default behavior. The operator expectation is that "show me only this slice" is a primary action, not an advanced one.

### Acceptance criteria

- combined filters produce stable results
- pagination works after filters
- export can reuse the same filtered scope

## Workflow 3: Open Creator Detail

### User

Manager or admin

### Trigger

User selects a creator row

### Goal

Understand the creator's current state and recent history.

### Required sections

- creator header
- status and tier
- linked accounts
- current metrics
- recent activities
- add activity action

### Questions this screen must answer

- who owns this creator
- where are they active
- how are they performing recently
- what has happened lately
- has anyone already intervened

### Acceptance criteria

- all sections load from one coherent detail flow
- unauthorized creator ids are blocked
- recent activities are sorted descending by event time

## Workflow 4: Log A Win

### User

Manager or admin

### Trigger

User observes a meaningful positive performance event

### Goal

Record a durable note with enough context to inform later decisions.

### Minimum fields

- type = win
- title
- description

### Auto-captured metadata

- creator id
- recorded by
- recorded at

### Typical examples

- creator is trending on TikTok
- recent creative direction is working
- GMV spike after recent change

### Acceptance criteria

- submission is fast and low-friction
- note appears immediately in recent activity
- actor and timestamp are system-set

## Workflow 5: Log A Loss Or Risk Signal

### User

Manager or admin

### Trigger

User identifies poor performance, inactivity, or a negative trend

### Goal

Record operational concern before it is forgotten or buried in chat.

### Typical examples

- no post in 7 days
- GMV drop week over week
- handle dormant
- poor livestream conversion

### Special requirement

Loss and risk logs should be easy to filter later because they are often the input to team review.

## Workflow 6: Log An Adjustment

### User

Manager or admin

### Trigger

User changes creator strategy, payout, creative direction, or classification

### Goal

Preserve intervention history so later metric changes can be interpreted.

### Typical examples

- increased commission
- changed creative brief
- moved creator to a new tier
- asked creator to increase posting frequency

### Why this matters

This workflow is what differentiates an operator dashboard from a passive analytics tool. Without this, the business cannot correlate actions with outcomes.

## Workflow 7: Review Recent Activity

### User

Manager, admin, possibly viewer

### Trigger

User opens creator detail or later timeline views

### Goal

Understand the creator's recent narrative, not just their numbers.

### Required characteristics

- most recent first
- type clearly labeled
- actor visible
- timestamp visible
- summary readable without opening a second screen

### Future enhancement

Cross-creator global timeline can come later, but creator-local activity is part of MVP value.

## Workflow 8: Export Filtered Report

### User

Lead, manager, admin

### Trigger

User wants an external report or meeting artifact

### Goal

Export a filtered view of the roster and current metrics.

### Required behavior

- export current visible or requested scope
- preserve column stability
- respect permissions

### Acceptance criteria

- exported data matches the same query semantics as the UI
- scoped users cannot export outside their own visibility

## Workflow 9: Team Rollup Review

### User

Lead or admin

### Trigger

User opens reports or summary dashboard area

### Goal

See the team-level state of the book of business.

### Suggested metrics

- total creators
- active creators
- total MTD GMV
- total 7D GMV
- total posts
- tier breakdown
- at-risk creator count

### MVP note

This can be lightweight in the first release, but the calculation logic should already be designed.

## Workflow 10: Handle Missing Or Stale Data

### User

Manager or admin

### Trigger

A creator has missing metrics or very old metrics

### Goal

Avoid making decisions off silently incomplete data.

### Required behavior

- show freshness timestamp
- show empty-state language for missing metrics
- avoid implying zero when the data is actually unknown

## Operational Hand-Off Expectations

These workflows should support the real weekly cadence:

- daily roster review by managers
- ad hoc creator deep dives
- weekly team review using exports and activity history
- periodic tier review

## Sources

- [UGC_CREATOR_DASHBOARD_PRD.md](</C:/Users/Lenovo/Downloads/MM Database/docs/UGC_CREATOR_DASHBOARD_PRD.md>)
- TikTok Affiliate Center analytics: https://seller-us.tiktok.com/university/essay?knowledge_id=6115786490283790&lang=en
- GRIN reporting: https://grin.co/product/influencer-marketing-reporting-platform/
- Aspire manage: https://www.aspire.io/platform/manage
