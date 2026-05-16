# Deployment and Operations

## Summary

This document defines how the system should be deployed, monitored, and operated once implementation begins. The dashboard is an internal tool, but it still needs production discipline because it will inform revenue-impacting decisions.

## Environment Model

Use at least three environments:

- local development
- staging
- production

Optional later:

- preview deployments per branch for UI review

## Platform Responsibilities

### Vercel

Use for:

- Next.js deployment
- preview environments
- environment variable management
- analytics and speed insights

### Convex

Use for:

- backend functions
- data storage
- realtime subscriptions
- environment-specific deployments

### Clerk

Use for:

- authentication
- user session management
- environment-specific keys

## Environment Variables

Minimum expected configuration:

- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_JWT_ISSUER_DOMAIN`

Later, if integrations are added:

- Discord credentials
- webhook secrets
- analytics keys

## Deployment Flow

### Staging

Purpose:

- internal QA
- seed-data validation
- role testing
- pre-release export checks

Requirements:

- realistic sample data
- non-production auth users
- same schema structure as production

### Production

Purpose:

- live internal operations

Requirements before release:

- schema deployed
- auth users provisioned
- roles verified
- seed or imported data loaded
- launch QA complete

## Launch Sequence

### Soft launch

- deploy staging
- test with small internal group
- validate dashboard, detail, and activity logging flows

### Beta launch

- deploy production
- onboard limited managers and creators if creator access exists
- monitor query performance and usage

### Full launch

- enable broader internal team usage
- monitor dashboard behavior under real load

## Operational Monitoring

Track at minimum:

- application response health
- dashboard load performance
- Convex query and mutation behavior
- stale metric incidence
- export failures
- auth provisioning issues

## Error Monitoring

The source PRD mentions Sentry as optional. That is a reasonable addition once implementation begins.

Recommended priorities for error monitoring:

- auth failures
- query failures
- mutation failures
- export failures
- integration failures later

## Data Operations

### Seed data

Required for development and staging:

- representative creators
- tier mix
- active and inactive records
- activity history
- missing metric scenarios

### Backups

The original PRD calls for weekly backups. The exact backup mechanism depends on Convex capabilities and export strategy, but the operational requirement is sound:

- the business should be able to recover core creator and activity data.

### Import hygiene

If manual imports or webhook ingestion are added later:

- log source
- log import time
- preserve failure visibility

## Support Model

The initial support path should be lightweight but explicit:

- one owner for deployment and environment health
- one contact path for manager issues
- one place to log recurring bugs or product gaps

Given the PRD, this likely starts with Thabiso as primary operator and owner.

## Change Management

Avoid making these changes directly in production without staging validation:

- role model changes
- schema changes
- export shape changes
- metric definition changes

These are high-impact because they can quietly change what users believe the dashboard means.

## Production Readiness Checklist

- environments configured
- schema deployed
- auth working
- seed or live data loaded
- role checks passed
- dashboard load acceptable
- activity logging verified
- export verified
- stale metric behavior acceptable

## Ongoing Cadence

Daily:

- check production health
- review obvious failures

Weekly:

- review usage and adoption
- review data quality issues
- back up or export core data if required

Monthly:

- review roadmap priorities
- revisit stale integrations or source issues

## Sources

- [UGC_CREATOR_DASHBOARD_PRD.md](</C:/Users/Lenovo/Downloads/MM Database/docs/UGC_CREATOR_DASHBOARD_PRD.md>)
- Vercel Next.js docs: https://vercel.com/docs/frameworks/nextjs
- Vercel Speed Insights: https://vercel.com/docs/speed-insights
- Convex with Clerk: https://docs.convex.dev/auth/clerk

