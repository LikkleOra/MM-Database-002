# Integrations Strategy

## Summary

This document defines the external systems that may interact with the dashboard, how they should be phased, and what each integration is expected to solve.

## Integration Principles

- MVP should not depend on unstable third-party automation.
- Every integration should solve a real operating problem, not just reduce manual work in theory.
- Ingestion should preserve source metadata and failure visibility.
- Outbound integrations should never become the only source of truth.

## Integration Inventory

### Discord

Purpose:

- identity convenience
- handle lookup
- possible future alerts or summaries

### TikTok Shop or affiliate data sources

Purpose:

- GMV and commerce metric ingestion
- creator performance enrichment

### CSV export

Purpose:

- external reporting
- standups
- manual downstream workflows

### Product analytics

Purpose:

- measure system adoption and workflow quality

## Discord Integration

### Real-world rationale

The source PRD already assumes Discord is part of the current operating environment. That is credible. In many creator operations, Discord remains the coordination and issue-response layer even when reporting moves elsewhere.

### MVP recommendation

Do not make live Discord sync a launch dependency.

MVP support should be limited to:

- storing Discord handle
- optionally storing Discord id
- allowing quick navigation or lookup later

### Phase 2 recommendation

Add one or both of:

- profile lookup or verification
- outbound summary notifications

### Technical considerations

Discord official OAuth2 docs emphasize:

- application registration
- proper OAuth2 flow selection
- scope selection
- state validation for security

If Discord user-level authentication or richer account linking is added later, use authorization code flow and implement state handling correctly.

### Risks

- Discord handles can change
- profile lookup may require more identity certainty than a plain text handle
- sending operational summaries to Discord can create duplicate-source confusion if not carefully scoped

## TikTok Shop Or Affiliate Metric Ingestion

### Real-world rationale

TikTok public documentation shows that Affiliate Center and Seller Center expose performance summaries by creators, products, content, and date ranges. That validates the need for a structured metric ingestion path.

### MVP recommendation

Start with manual metric entry or curated imports if necessary.

Reason:

- faster to validate the operating model,
- lower API and mapping risk,
- easier to correct semantics early.

### Phase 2 recommendation

Add a webhook or import pipeline once:

- the business agrees on canonical metric definitions,
- source systems are stable enough,
- dashboard adoption justifies automation.

### Required ingestion fields

- creator identifier mapping
- metric window or snapshot date
- GMV
- orders if available
- posts if available
- lives if available
- source
- captured time

### Required safeguards

- reject ambiguous creator mappings
- prevent silent overwrite without timestamp
- log import failures
- preserve source label

## CSV Export

### Why it matters

Even mature platforms still support export because operations teams often need:

- meeting artifacts,
- offline analysis,
- cross-tool handoff,
- executive summaries.

### MVP recommendation

Support a basic scoped CSV export from the dashboard list.

### Export requirements

- export only what the user is allowed to see
- use stable column names
- reflect active filters or clearly state export scope
- avoid nested unreadable structures in v1

### Future enhancements

- saved exports
- scheduled exports
- export job history

## Product Analytics Integration

### Recommendation

Treat product analytics as important but not launch-blocking.

If added, track:

- page views
- filter usage
- activity logging completion
- export usage
- permission-denied events

### Candidate tooling

- PostHog or a similar analytics platform

## Integration Sequencing

### Phase 1

- Clerk
- Convex
- Vercel
- CSV export

### Phase 2

- Discord lookup or outbound summaries
- webhook-based metric ingestion
- product analytics instrumentation

### Phase 3

- AI insights
- richer notificationing
- wider external system sync

## Integration Decision Rules

Ask these questions before adding one:

1. Does the integration reduce a real manual bottleneck?
2. Does it improve trust in the system's data?
3. Can the team support its failure modes?
4. Does it complicate authorization or source semantics?

If the answers are weak, defer it.

## Sources

- [UGC_CREATOR_DASHBOARD_PRD.md](</C:/Users/Lenovo/Downloads/MM Database/docs/UGC_CREATOR_DASHBOARD_PRD.md>)
- Discord OAuth2 docs: https://docs.discord.com/developers/topics/oauth2
- TikTok Affiliate Center analytics: https://seller-us.tiktok.com/university/essay?knowledge_id=6115786490283790&lang=en
- TikTok Seller Center analytics: https://seller-us.tiktok.com/university/essay?default_language=en&knowledge_id=813364865828654

