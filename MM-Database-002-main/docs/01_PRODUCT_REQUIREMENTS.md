# Product Requirements and Operating Intent

## Summary

The UGC Creator Performance Dashboard is an internal operating system for a creator-led affiliate business. It exists to replace fragmented spreadsheet and chat based management with a single system for creator visibility, performance review, intervention logging, and team execution.

This is not a generic influencer marketing platform. It is a focused operator dashboard for a team managing a high volume of creators whose output directly influences GMV, posting cadence, and operational decisions.

## Product Problem

The source PRD identifies the central failure mode correctly: the team cannot make fast, reliable decisions when creator performance data is fragmented across spreadsheets, Discord, manual notes, and platform-native analytics surfaces.

That fragmentation causes four operational problems:

1. No trusted current state.
   A manager cannot answer "who is winning right now?" without reconciling multiple sources.
2. No durable intervention history.
   Win, loss, and adjustment notes live in chat or memory, so cause and effect cannot be reviewed.
3. No scalable triage.
   Once the creator roster grows beyond a few dozen people, it becomes difficult to spot inactivity, trend breakage, and tier drift early.
4. No manager-grade reporting surface.
   Team leads need rollups, exports, filters, and at-risk views that consumer creator tools do not provide.

## Product Thesis

The system should behave like a creator operations control room:

- The creator record is the unit of management.
- Performance metrics give the current state.
- Activities and adjustments explain why the state changed.
- Roles and filters determine who can see which subset of the system.
- Rollups make it possible to run the business at the team level.

The dashboard is successful if it shortens the cycle from "performance changed" to "operator noticed" to "action logged" to "team can review impact later."

## Primary Users

### Operations Manager

This is the primary user for MVP.

Needs:

- One ranked creator list
- Search and filters
- Fast access to creator detail
- Quick activity logging
- Recent change visibility
- Confidence that data is current enough to act on

Success condition:

The manager can review the book of business in one sitting and identify who needs intervention.

### Team Lead or Growth Operator

Needs:

- Team-level rollups
- Trend analysis
- Tier movement candidates
- Exports for planning and meetings
- Confidence in reporting semantics

Success condition:

The lead can answer "what changed this week?" and "where should we focus next?" without custom manual reporting.

### Creator

This is not the primary MVP user even though the source PRD allows for creator self-view access.

For MVP, creator access should be treated as optional or heavily constrained because:

- it increases permission complexity,
- it changes UX expectations,
- it raises the standard for data clarity and reconciliation,
- it creates support obligations around disputed metrics.

## Jobs To Be Done

### Core Job 1: Review the roster quickly

When a manager opens the dashboard, they need an immediately scannable ranking of creators by recent performance with enough context to detect outliers without opening every profile.

### Core Job 2: Investigate a creator deeply

When a creator needs attention, the manager needs one page that combines identity, accounts, recent metrics, recent activity, and prior adjustments.

### Core Job 3: Record operational decisions in context

When a manager makes a decision such as raising commission, changing creative direction, or marking a poor week, they need a fast logging path that preserves timestamps, author, and intent.

### Core Job 4: Report status upward

When the team lead prepares a review or standup, they need exports and summary metrics that reflect the same system of record managers used during the week.

## Product Principles

### One source of truth, even if inputs are imperfect

Manual entry is acceptable for MVP. Ambiguous source sprawl is not.

### Speed of operation beats breadth of features

This system should make the top five daily actions extremely efficient before adding more automation.

### History matters as much as current state

A creator dashboard without intervention history becomes another passive reporting tool. The activity trail is part of the product core.

### Derived metrics must be explainable

If the system calculates status, trend, tier eligibility, or risk flags, the logic must be documented and reviewable.

### Permission safety is non-negotiable

The wrong user seeing the wrong creator or notes is a trust-breaking defect.

## Success Metrics

These metrics refine the PRD targets into measurable outcomes.

### Product usage metrics

- Weekly active managers
- Percentage of managers who log at least one activity per week
- Percentage of creator detail views followed by an activity log within the same session
- Search and filter usage rate
- Export usage rate

### Operational metrics

- Time to identify inactive creators
- Time from performance anomaly to logged intervention
- Percentage of creators with at least one activity entry in the last 30 days
- Percentage of creators with current 7D and MTD metrics available

### Technical metrics

- Dashboard first meaningful load under 2 seconds on a warm path
- Real-time update visibility under 500 ms for small mutations in normal load
- Query latency within acceptable ranges at 615 creators and at 2,000 creators
- Zero unauthorized data exposure in role-based test scenarios

## Anti-Goals

The system should explicitly avoid becoming these in MVP:

- A full influencer marketing platform
- A campaign payment and contracting suite
- A general CRM for all business workflows
- A public creator portal with advanced self-service
- A full marketing attribution platform

## Real-World Pattern Alignment

Public product materials suggest a common pattern in mature creator systems:

- CreatorIQ emphasizes unified creator data, program management, and reporting from one place.
- GRIN emphasizes centralized reporting and real-time program visibility.
- Aspire emphasizes systemized creator and workflow management at scale.
- PostScout emphasizes live or near-live performance signals for TikTok Shop operators.
- TikTok Shop's own analytics surfaces split performance views by content, product, collaboration, and date filters.

The implication for this project is clear: the winning pattern is not just storage. It is a combined operating surface where identity, activity, and performance can be reviewed together.

## Product Boundaries for This Project

### In scope for the foundation

- Creator records
- Linked social accounts
- Performance metrics and recent state
- Activity logging for wins, losses, observations, and adjustments
- Role-aware list and detail views
- Exportable operational reporting

### Out of scope for the foundation

- Creator contracting
- Creator payments
- Brand safety compliance workflows
- Content approval workflow
- Automated marketplace discovery
- Ad spend and commerce reconciliation

## Open Product Risks

### Metric trust risk

If the source of GMV is manual or partially automated, the product may be operationally useful but analytically disputed. The system should label source and last update time everywhere metrics are shown.

### Workflow adoption risk

If managers view the dashboard but do not log wins, losses, and adjustments, the system loses its explanatory power. Logging must be fast, contextual, and expected in weekly operations.

### Scope creep risk

Creator tools naturally expand toward CRM, BI, and campaign operations. MVP discipline is required or the foundation will stall.

## Recommended Product Framing

Use this one-line product framing internally:

"An internal creator operations dashboard for ranking, reviewing, and intervening on UGC affiliate performance."

Use this one-line scope guard during implementation:

"If a feature does not improve creator visibility, intervention logging, or manager reporting, it is probably not MVP."

## Source Notes

Internal basis:

- [UGC_CREATOR_DASHBOARD_PRD.md](</C:/Users/Lenovo/Downloads/MM Database/docs/UGC_CREATOR_DASHBOARD_PRD.md>)

External references:

- CreatorIQ overview: https://www.creatoriq.com/
- CreatorIQ campaign management: https://www.creatoriq.com/influencer-marketing-solution/influencer-campaign-management
- GRIN reporting: https://grin.co/product/influencer-marketing-reporting-platform/
- Aspire manage and scale: https://www.aspire.io/platform/manage
- PostScout TikTok Shop analytics: https://www.postscout.io/
- TikTok Affiliate Center analytics: https://seller-us.tiktok.com/university/essay?knowledge_id=6115786490283790&lang=en

