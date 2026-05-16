# UGC Creator Dashboard Documentation Index

## Purpose

This documentation set turns the source PRD in [UGC_CREATOR_DASHBOARD_PRD.md](</C:/Users/Lenovo/Downloads/MM Database/docs/UGC_CREATOR_DASHBOARD_PRD.md>) into an implementation-ready foundation for the UGC Creator Performance Dashboard project.

The goal is not to restate the PRD. The goal is to harden it into a real delivery package that a senior engineer, product lead, or technical operator can use to build the system with fewer hidden decisions.

## What This Set Covers

- Product definition
- Real-world product and market research
- MVP boundaries
- Architecture and data model
- Authorization and role model
- Core workflows
- Metrics and analytics
- Integration strategy
- Frontend UX specification
- Testing and QA
- Deployment and operations
- Roadmap and decision log
- Shared glossary

## Reading Order

Read these in order if you are new to the project:

1. [01_PRODUCT_REQUIREMENTS.md](</C:/Users/Lenovo/Downloads/MM Database/docs/01_PRODUCT_REQUIREMENTS.md>)
2. [02_REAL_WORLD_RESEARCH.md](</C:/Users/Lenovo/Downloads/MM Database/docs/02_REAL_WORLD_RESEARCH.md>)
3. [03_MVP_SCOPE.md](</C:/Users/Lenovo/Downloads/MM Database/docs/03_MVP_SCOPE.md>)
4. [04_SYSTEM_ARCHITECTURE.md](</C:/Users/Lenovo/Downloads/MM Database/docs/04_SYSTEM_ARCHITECTURE.md>)
5. [05_DATA_MODEL.md](</C:/Users/Lenovo/Downloads/MM Database/docs/05_DATA_MODEL.md>)
6. [06_AUTHORIZATION_AND_ROLES.md](</C:/Users/Lenovo/Downloads/MM Database/docs/06_AUTHORIZATION_AND_ROLES.md>)
7. [07_CORE_WORKFLOWS.md](</C:/Users/Lenovo/Downloads/MM Database/docs/07_CORE_WORKFLOWS.md>)
8. [08_ANALYTICS_AND_METRICS.md](</C:/Users/Lenovo/Downloads/MM Database/docs/08_ANALYTICS_AND_METRICS.md>)
9. [09_INTEGRATIONS.md](</C:/Users/Lenovo/Downloads/MM Database/docs/09_INTEGRATIONS.md>)
10. [10_FRONTEND_UX_SPEC.md](</C:/Users/Lenovo/Downloads/MM Database/docs/10_FRONTEND_UX_SPEC.md>)
11. [11_TESTING_AND_QA.md](</C:/Users/Lenovo/Downloads/MM Database/docs/11_TESTING_AND_QA.md>)
12. [12_DEPLOYMENT_AND_OPERATIONS.md](</C:/Users/Lenovo/Downloads/MM Database/docs/12_DEPLOYMENT_AND_OPERATIONS.md>)
13. [13_ROADMAP_AND_DECISION_LOG.md](</C:/Users/Lenovo/Downloads/MM Database/docs/13_ROADMAP_AND_DECISION_LOG.md>)
14. [14_GLOSSARY.md](</C:/Users/Lenovo/Downloads/MM Database/docs/14_GLOSSARY.md>)

## How To Use These Docs

Use each document for a specific decision domain:

- `01_PRODUCT_REQUIREMENTS.md`: what the product is and why it exists.
- `02_REAL_WORLD_RESEARCH.md`: how adjacent products and platforms actually structure this problem.
- `03_MVP_SCOPE.md`: what ships first and what does not.
- `04_SYSTEM_ARCHITECTURE.md`: how the system is composed.
- `05_DATA_MODEL.md`: how the data is stored, queried, derived, and governed.
- `06_AUTHORIZATION_AND_ROLES.md`: who can see and do what.
- `07_CORE_WORKFLOWS.md`: what core user flows must work end to end.
- `08_ANALYTICS_AND_METRICS.md`: what the business and product need measured.
- `09_INTEGRATIONS.md`: what external systems exist and how they connect.
- `10_FRONTEND_UX_SPEC.md`: how the app should behave and feel at the interface layer.
- `11_TESTING_AND_QA.md`: what must be verified before launch.
- `12_DEPLOYMENT_AND_OPERATIONS.md`: how the system runs in production.
- `13_ROADMAP_AND_DECISION_LOG.md`: what is delayed, risky, or intentionally sequenced.
- `14_GLOSSARY.md`: common language for product, engineering, and operations.

## Documentation Principles

- This set assumes no existing application code is present in the workspace yet.
- The original PRD remains the source vision document.
- These docs are the delivery and implementation foundation.
- Where public research is incomplete, recommendations are called out as engineering judgment.
- Where competitor claims come from marketing pages, treat them as pattern signals, not proof of exact internal implementation.

## Key Defaults Chosen

- The first release is an internal operations dashboard, not a creator self-serve platform.
- Real-time visibility is important, but correctness and permission safety are more important than over-broadcasting live updates.
- The system should support 615+ managed creators at launch and avoid data structures that become fragile at 2,000+ creators.
- Automated GMV ingestion is deferred until the manual operating model is stable.
- Clerk Organizations are a useful reference model, but the initial role model should remain simple unless true multi-tenant behavior is required.

## Source Baseline

Primary internal source:

- [UGC_CREATOR_DASHBOARD_PRD.md](</C:/Users/Lenovo/Downloads/MM Database/docs/UGC_CREATOR_DASHBOARD_PRD.md>)

Primary external sources used across the documentation set:

- TikTok Shop Affiliate Center analytics: https://seller-us.tiktok.com/university/essay?knowledge_id=6115786490283790&lang=en
- TikTok Shop Seller Center analytics: https://seller-us.tiktok.com/university/essay?default_language=en&knowledge_id=813364865828654
- CreatorIQ platform pages: https://www.creatoriq.com/
- CreatorIQ campaign management: https://www.creatoriq.com/influencer-marketing-solution/influencer-campaign-management
- GRIN reporting: https://grin.co/product/influencer-marketing-reporting-platform/
- Aspire management: https://www.aspire.io/platform/manage
- PostScout analytics: https://www.postscout.io/
- Convex realtime: https://docs.convex.dev/realtime
- Convex pagination: https://docs.convex.dev/database/pagination
- Convex indexes: https://docs.convex.dev/database/reading-data/indexes/
- Convex with Clerk: https://docs.convex.dev/auth/clerk
- Clerk Organizations overview: https://clerk.com/docs/guides/organizations/overview
- Discord OAuth2 docs: https://docs.discord.com/developers/topics/oauth2
- Vercel Next.js docs: https://vercel.com/docs/frameworks/nextjs
- Vercel Speed Insights: https://vercel.com/docs/speed-insights
- shadcn/ui Next.js docs: https://ui.shadcn.com/docs/installation/next

