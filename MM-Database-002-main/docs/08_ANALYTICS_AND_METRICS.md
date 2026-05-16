# Analytics, Metrics, and Measurement Semantics

## Summary

This document defines what the product measures, what the business cares about, and how to avoid metric ambiguity. A creator operations system fails quickly if users do not trust the numbers or cannot tell what a number means.

## Metric Principles

- Every displayed metric needs a definition.
- Every metric should carry a freshness signal.
- Current-state metrics and historical metrics are not the same thing.
- Unknown is not the same as zero.
- The app should label source when the data can come from multiple inputs.

## Core Business Metrics

### GMV

Definition for this system:

Gross Merchandise Value attributed to a creator's content or related affiliate activity, using the business's approved source definition for the chosen time window.

Important warning:

TikTok Shop public documentation shows that GMV definitions can shift depending on surface, content type, and whether affiliate metrics are separated into the Affiliate Center. This means the business must decide and document which GMV definition is canonical for this dashboard.

Required fields alongside GMV:

- time window
- source
- last updated

### Orders

Definition:

Count of orders attributed to the creator in the selected time window.

Use:

- secondary commerce health signal
- useful when GMV is volatile because of price mix

### Items Sold

Definition:

Count of items sold attributed to the creator in the selected time window.

Use:

- product velocity interpretation
- helps separate low-price high-volume creators from high-price low-volume creators

### Post Count

Definition:

Number of content posts from the tracked creator accounts in the selected time window.

Use:

- activity signal
- inactivity risk detection
- context for GMV changes

### Live Count

Definition:

Number of livestream sessions in the selected time window.

Use:

- commerce context for creators who use live selling

### Engagement Rate

Definition:

Derived content interaction metric if available from source data.

Use:

- supplemental health signal
- not a core commerce metric for MVP

## Core Time Windows

### 7D

Use:

- short-term operator monitoring
- rapid trend detection
- inactivity identification

### MTD

Use:

- management reporting
- tier review
- month progress tracking

### 30D

Use:

- smoothing volatility
- broader trend context

## Current State Versus Historical State

### Current rollups

These are the values shown on dashboard cards and creator list rows. They answer:

- what is true right now for this window

### Historical snapshots

These are stored over time and answer:

- how did this creator change over days or weeks

Do not confuse the two. Rollups are optimized for operations. Snapshots are optimized for history.

## Metric Freshness

Every metric surface should show:

- last updated timestamp
- source label

Recommended freshness states:

- fresh
- aging
- stale
- missing

Suggested default thresholds:

- fresh: updated within expected source interval
- aging: updated later than expected but still within one operating cycle
- stale: materially older than expected and risky for decision making

Exact thresholds should align to source cadence.

## Activity Metrics

These are product adoption and workflow completion metrics, not creator performance metrics.

Track:

- activities logged per week
- wins logged per week
- losses logged per week
- adjustments logged per week
- percentage of creators with at least one activity in last 30 days

Why:

If activity logging is low, the system is becoming a reporting surface rather than an operating system.

## Product Analytics Metrics

If product analytics is added later, measure:

- dashboard view
- creator detail opened
- search used
- filter applied
- export requested
- activity created
- role denied event

These should help answer:

- which workflows are actually used,
- where users drop out,
- whether logging behavior is improving.

## Team Rollup Metrics

For leads and managers, define:

- total creators in scope
- active creators in scope
- at-risk creators
- total 7D GMV
- total MTD GMV
- average GMV per creator
- total posts in 7D or MTD
- tier distribution

## Derived Operational Signals

### At-risk creator

Recommended initial heuristic:

- no posts in 7D, or
- declining short-term GMV, or
- recent loss activity with no follow-up

This should be documented as a heuristic, not presented as objective truth.

### Trend label

Recommended labels:

- rising
- stable
- declining
- insufficient_data

### Tier eligibility

Recommended logic source:

- tier rule definitions plus windowed GMV thresholds

Do not hardcode this across multiple surfaces.

## Metric Display Rules

- Show units consistently.
- Show zero only when confirmed zero.
- Show blank or not available when unknown.
- Show date context with time-window metrics if user confusion is possible.
- Avoid mixing windows in one unlabeled column set.

## Data Source Labels

Supported source labels:

- manual
- webhook
- API
- imported

Use these both for debugging and for user trust.

## Product Success Metrics

Refine the PRD targets into a launch scorecard:

- dashboard first load under 2 seconds on normal routes
- real-time list updates under 500 ms for small mutations under nominal load
- 80 percent of active managers log at least one activity weekly
- 90 percent of creators have current 7D and MTD metrics available
- zero known unauthorized export incidents

## Example Event Taxonomy

Suggested analytics events:

- `dashboard_viewed`
- `creator_opened`
- `creator_searched`
- `filter_applied`
- `activity_logged`
- `export_started`
- `export_completed`
- `permission_denied`

## Sources

- [UGC_CREATOR_DASHBOARD_PRD.md](</C:/Users/Lenovo/Downloads/MM Database/docs/UGC_CREATOR_DASHBOARD_PRD.md>)
- TikTok Affiliate Center analytics: https://seller-us.tiktok.com/university/essay?knowledge_id=6115786490283790&lang=en
- TikTok Seller Center analytics: https://seller-us.tiktok.com/university/essay?default_language=en&knowledge_id=813364865828654
- GRIN reporting: https://grin.co/product/influencer-marketing-reporting-platform/
- Vercel Next.js docs: https://vercel.com/docs/frameworks/nextjs

