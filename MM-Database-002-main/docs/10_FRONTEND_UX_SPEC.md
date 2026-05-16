# Frontend UX Specification

## Summary

This document defines how the first version of the dashboard should behave at the interface layer. The product is an operator tool, so the UI should favor scanability, density, and low-friction actions over decorative presentation.

## UX Principles

- The first screen should be useful immediately.
- The roster is the main operational surface.
- High-frequency actions should take one or two interactions, not five.
- Metric context should be visible without overwhelming the user.
- Empty, stale, and error states should be explicit.

## Information Architecture

### Primary screens

- dashboard
- creator detail
- reports
- settings

### Navigation requirements

- persistent top-level navigation
- clear active page state
- visible signed-in user identity
- clear way back from creator detail to dashboard

## Dashboard Screen

### Purpose

Support fast roster review and segmentation.

### Required layout zones

- page header
- summary strip or compact metrics cards
- filter and search controls
- creator table
- export action

### Table requirements

The table should be optimized for scanning. Keep row height tight but readable.

Recommended columns:

- creator
- Discord
- tier
- status
- 7D GMV
- MTD GMV
- posts
- last updated
- action

### Default sort

Recommend default sort by 7D GMV descending for manager triage.

### Interaction requirements

- search updates results predictably
- filters are combinable
- row click or explicit action opens detail
- loading state does not collapse layout

## Creator Detail Screen

### Purpose

Serve as the main investigation and intervention surface.

### Required sections

- creator identity header
- linked accounts section
- metrics summary
- recent activity feed
- activity logging entry point

### Header requirements

Include:

- creator name
- Discord handle
- status
- tier
- manager or team context if useful

### Metrics section

Show:

- 7D GMV
- MTD GMV
- posts
- lives
- last updated
- source if data provenance may matter

### Activity section

Show:

- type
- title
- description preview
- actor
- timestamp
- impact or tags if present

## Activity Logging UX

### Entry pattern

Use a modal, drawer, or inline panel that can be opened from creator detail without leaving context.

### Required form fields

- type
- title
- description

### Optional fields

- tags
- impact

### UX requirements

- fast submit
- obvious success state
- validation errors shown inline
- no user entry for actor or timestamp

## Filters UX

### MVP filters

- search
- tier
- status

### Layout guidance

Filters should sit above the table and remain visible without pushing the table too far down the page.

## Empty States

Required empty states:

- no creators in scope
- no results for current filters
- creator has no linked accounts
- creator has no recent activities
- metrics missing

Each state should explain whether the issue is:

- no data,
- no access,
- or no matching results.

## Error States

Show clear states for:

- unauthorized
- not provisioned
- failed query load
- failed activity save
- export failure

Do not expose internal stack traces in UI.

## Mobile And Responsive Behavior

The source PRD lists mobile responsiveness as phase 2, but the dashboard should still remain usable on narrower screens in MVP.

Minimum expectation:

- no broken layout,
- table can scroll horizontally,
- key actions remain accessible.

The system does not need a mobile-first field-ops experience in v1.

## Visual Direction

This is an internal operations app. It should feel:

- clear
- compact
- work-focused
- stable

Avoid:

- marketing hero layouts
- oversized decorative cards
- ornamental dashboards with low data density

## Component Guidance

Based on the planned stack, likely reusable components include:

- table
- badge
- status indicator
- metric card
- modal or dialog
- filter select
- search input
- activity list item

Use shadcn/ui patterns where they improve consistency, but do not let component availability dictate the product layout.

## Accessibility And Legibility

- status should not rely on color alone
- table headings must be clear
- focus states visible
- modal forms keyboard accessible
- timestamps human-readable

## UX Risks To Avoid

- table too sparse to scan quickly
- creator detail too shallow to support real decisions
- logging workflow slower than current manual process
- stale metrics presented without warning

## Sources

- [UGC_CREATOR_DASHBOARD_PRD.md](</C:/Users/Lenovo/Downloads/MM Database/docs/UGC_CREATOR_DASHBOARD_PRD.md>)
- GRIN reporting: https://grin.co/product/influencer-marketing-reporting-platform/
- Aspire manage: https://www.aspire.io/platform/manage
- shadcn/ui Next.js docs: https://ui.shadcn.com/docs/installation/next

