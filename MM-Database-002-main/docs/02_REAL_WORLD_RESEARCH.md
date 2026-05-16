# Real-World Research and Reference Patterns

## Summary

This document maps the public shape of existing creator, affiliate, and performance tools to the problem in this project. It is not a marketecture summary. It is a design input for what patterns are normal, what patterns are missing, and what should be adopted or rejected.

## Research Method

The research in this document is based on public product pages and official documentation available on May 13, 2026. That means:

- It is strong for surface capabilities, workflow emphasis, and product vocabulary.
- It is weak for hidden internal implementation details.
- Where this document recommends a design choice, treat it as an engineering inference from public patterns plus the needs of the source PRD.

## Market Categories Relevant To This Project

The project overlaps several adjacent categories:

1. Influencer or creator program management
2. Creator performance analytics
3. Affiliate commerce analytics
4. Internal operations dashboards
5. Team-based workflow systems

No single public tool exactly matches the required internal operating model. That is normal. The system being designed is closer to a custom operator console than a pure off-the-shelf SaaS clone.

## Reference System 1: CreatorIQ

### What public materials indicate

CreatorIQ positions itself as an all-in-one creator marketing platform centered on:

- unified creator data,
- centralized program management,
- campaign workflows,
- reporting and benchmarking,
- enterprise integrations,
- role-based collaboration.

The campaign management page specifically calls out centralized content review, creator collaboration, and performance reporting. One public page also mentions reporting that refreshes every eight hours, which is a useful reminder that "real-time" in creator platforms often means "fresh enough for operations" rather than literal sub-second streaming for every metric.

### What matters for this project

- Centralized creator profile: yes
- Multi-user operational context: yes
- Reporting as a first-class feature: yes
- Workflow and governance emphasis: yes
- Heavy enterprise scope: more than MVP needs

### Pattern to adopt

Adopt the idea that creator data, workflow state, and reporting must live in one operational surface.

### Pattern to reject for MVP

Do not attempt CreatorIQ-level breadth:

- brand safety infrastructure,
- payment systems,
- global campaign governance,
- competitive benchmarking,
- heavy enterprise setup.

## Reference System 2: GRIN

### What public materials indicate

GRIN emphasizes reporting and analytics for influencer programs with:

- real-time or near-real-time access to program data,
- centralized creator and campaign reporting,
- benchmarking,
- progress visualization,
- single-dashboard visibility.

### What matters for this project

GRIN validates that operators expect:

- current program-level numbers,
- creator-level drilldowns,
- simple reporting surfaces,
- one place to assess status quickly.

### Pattern to adopt

The MVP should expose both a ranked creator list and summary metrics on the same system, even if the first version keeps the summary relatively simple.

### Pattern to reject for MVP

Benchmarking against other brands or the broader market is not required for the first release.

## Reference System 3: Aspire

### What public materials indicate

Aspire leans heavily into process management:

- define deliverables,
- automate repetitive steps,
- standardize workflows,
- scale creator management without losing control.

### What matters for this project

This reinforces that high-scale creator operations require explicit process capture, not just performance data. In this project, the closest equivalent is the structured activity log and adjustment history.

### Pattern to adopt

Treat the activity log as operational infrastructure, not a notes field.

That means:

- typed activities,
- actor attribution,
- timestamps,
- tags,
- optional impact level,
- future auditability.

## Reference System 4: PostScout

### What public materials indicate

PostScout markets itself directly to TikTok Shop operators with:

- creator tracking,
- video tracking,
- GMV-focused analytics,
- trending signals,
- large monitored datasets,
- "live time" analytics language.

### What matters for this project

This is the closest public signal that the intended user here wants commerce-linked creator operations rather than generic social performance.

### Pattern to adopt

The dashboard should privilege:

- GMV and commerce-linked views,
- recent time windows,
- trend detection,
- creator ranking,
- operational filtering.

### Pattern to reject for MVP

Do not attempt market-wide creator discovery or large external monitoring in the first version.

## Reference System 5: TikTok Shop Analytics

### What public documentation indicates

TikTok Shop public documentation shows several important patterns:

- Affiliate Center analytics consolidate creators, products, videos, livestreams, and performance.
- Operators can analyze GMV, orders, items sold, and traffic with preset or custom date filters up to six months.
- Performance can be broken down by collaboration type, content type, and product category.
- Seller Center analytics separate some views and move certain affiliate metrics into the Affiliate Center rather than mixing everything together.

### What matters for this project

This validates four design decisions:

1. Time windows matter.
   7D, MTD, and rolling views are normal and expected.
2. Breakdown dimensions matter.
   Content type, creator, product, and collaboration type are normal analytic pivots.
3. Metric semantics matter.
   GMV definitions can differ by surface and inclusion rules.
4. Operators need both top-level summaries and drilldowns.

### Pattern to adopt

Make metric semantics explicit:

- what counts as GMV,
- what time it is based on,
- whether it includes refunds or cancellations,
- whether it is manual, API-fed, or webhook-fed,
- when it was last refreshed.

### Pattern to reject for MVP

Do not recreate the full TikTok analytics hierarchy. Keep the first version centered on creator operations, not marketplace-wide commerce exploration.

## Reference System 6: Clerk Organizations

### What official docs indicate

Clerk Organizations support grouped users, roles, permissions, and active organization context. The docs explicitly describe a model where users can switch contexts and where authorization should rely on the correct organization token rather than assuming a single global session context.

### What matters for this project

The project is not necessarily multi-tenant in v1, but the Clerk model is useful because it formalizes:

- role-aware access,
- contextual scope,
- team membership,
- future multi-tenant expansion.

### Pattern to adopt

Use a role matrix now, even if true organization switching is deferred.

### Pattern to reject for MVP

Do not force a full multi-tenant abstraction if the business is still one operation with internal users only.

## Reference System 7: Convex

### What official docs indicate

Convex provides:

- automatically reactive queries,
- automatic caching,
- consistent data snapshots across clients,
- cursor-based paginated queries,
- schema-defined indexes,
- direct Clerk integration.

### What matters for this project

This stack is a good fit for a manager dashboard because it reduces infrastructure work for:

- live table updates,
- query subscriptions,
- indexed filtered lists,
- paginated activity feeds,
- auth-aware data access.

### Pattern to adopt

Use Convex for operator-facing live state, but design queries and indexes intentionally. Public docs make clear that indexes determine query speed and ordering, and paginated queries should use cursor pagination rather than loading large collections into memory.

### Pattern to reject for MVP

Do not use "Convex is real-time" as an excuse to overfetch or skip pagination design.

## Synthesis: How Real Systems In This Space Are Built

Based on the sources above, the mature pattern looks like this:

### Layer 1: Canonical entity model

A central creator record anchors identity, ownership, social accounts, and classification.

### Layer 2: Performance fact model

Metrics arrive from one or more inputs, get normalized, and are rolled into operational views such as current 7D, MTD, creator trend, and team rollups.

### Layer 3: Workflow and intervention model

Operational notes, tasks, approvals, changes, and interventions are attached to the creator record or campaign context.

### Layer 4: Reporting and filtering surface

Users can rank, search, segment, and export the relevant population.

### Layer 5: Role and context model

Teams, managers, and specialized users see only the scope relevant to them.

### Layer 6: Integration layer

External systems provide source data, identity lookups, or outbound notifications.

## Implications For This Project

### Strong recommendations

- Separate current rollups from historical snapshots in the data model.
- Preserve source and freshness metadata on all imported metrics.
- Treat activities as structured records, not free text alone.
- Build list views around filters, sorting, and pagination from day one.
- Design permissions before creator self-view is enabled.

### Moderate recommendations

- Add team ownership as a first-class concept if more than one manager cohort exists.
- Add audit logging for sensitive mutations.
- Add export job tracking if exports can become large or asynchronous.

### Deferred recommendations

- Workflow automation
- Brand benchmarking
- AI recommendations
- Automated creator discovery
- Global organization switching

## Research Caveats

- Competitor pages emphasize strengths and often compress implementation details.
- Public marketing language may use "real-time" loosely.
- TikTok metrics can change semantics across surfaces and product updates.
- Public docs do not reveal internal data pipelines or reconciliation logic.

## Sources

- CreatorIQ overview: https://www.creatoriq.com/
- CreatorIQ campaign management: https://www.creatoriq.com/influencer-marketing-solution/influencer-campaign-management
- GRIN reporting: https://grin.co/product/influencer-marketing-reporting-platform/
- Aspire manage: https://www.aspire.io/platform/manage
- PostScout homepage: https://www.postscout.io/
- TikTok Shop Affiliate Center analytics: https://seller-us.tiktok.com/university/essay?knowledge_id=6115786490283790&lang=en
- TikTok Shop Seller Center analytics: https://seller-us.tiktok.com/university/essay?default_language=en&knowledge_id=813364865828654
- Convex realtime: https://docs.convex.dev/realtime
- Convex pagination: https://docs.convex.dev/database/pagination
- Convex indexes: https://docs.convex.dev/database/reading-data/indexes/
- Convex with Clerk: https://docs.convex.dev/auth/clerk
- Clerk Organizations overview: https://clerk.com/docs/guides/organizations/overview

