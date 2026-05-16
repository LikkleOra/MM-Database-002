# Testing and QA Plan

## Summary

This document defines what must be tested before the project should be considered ready for launch. The system has three main risk areas:

- authorization mistakes
- incorrect or stale metrics
- broken operational workflows

## Test Strategy

Use a layered strategy:

- backend function tests where practical
- manual end-to-end workflow QA
- role-based scenario coverage
- scale and performance checks

## Highest-Risk Areas

### Authorization

Wrong user visibility is the most serious product defect.

### Metric trust

If numbers are wrong, stale, or ambiguously labeled, users will stop trusting the dashboard.

### Workflow friction

If it is slower to log an adjustment than to type it in Discord, adoption will fail.

## Functional Test Scenarios

### Dashboard list

Test:

- admin sees all creators
- manager sees only assigned creators
- viewer sees only permitted records
- search by creator name works
- search by Discord handle works
- tier filter works
- status filter works
- combined filters work
- pagination behaves consistently

### Creator detail

Test:

- valid creator loads all required sections
- missing creator id returns controlled state
- unauthorized creator id is blocked
- linked accounts display correctly
- recent activities are ordered correctly

### Activity logging

Test:

- admin can log win
- manager can log loss for scoped creator
- viewer cannot log activity
- creator cannot log activity if role exists
- required validation errors appear
- new activity shows after save

### Export

Test:

- admin export includes all visible records
- manager export excludes out-of-scope creators
- filters are reflected in export when requested
- CSV shape is stable

## Metric Accuracy Tests

Test:

- 7D values map to correct source fields
- MTD values map to correct source fields
- zero versus missing is distinguished
- stale timestamps appear when expected
- source labels are correct

## Authorization Matrix Tests

Minimum cases:

- admin on admin path
- manager on own creator
- manager on other manager creator
- viewer on read-only path
- viewer attempting mutation
- unprovisioned Clerk user

## Real-Time Tests

Convex's realtime model is one of the project's foundations, so verify:

- new activity appears without refresh
- updated rollup appears without refresh
- two sessions see consistent updates
- list does not flicker or reorder unexpectedly unless intended

## Performance And Scale Tests

### Launch scale target

615 creators minimum

### Recommended synthetic checks

- dashboard load with 615 creators
- activity feed with many records
- multiple concurrent users refreshing live views
- export with full visible scope

### Performance acceptance

- acceptable dashboard load time
- acceptable filter responsiveness
- no obvious N+1 behavior

## Manual QA Checklist

- sign in
- open dashboard
- search creator
- open creator detail
- log win
- log adjustment
- verify activity appears
- export current filtered list
- test with manager account
- test with viewer account

## Pre-Launch Gates

Do not launch unless:

- authorization tests pass
- creator detail and activity flows pass
- export path passes
- stale metric handling is acceptable
- scale test with representative dataset passes

## Recommended Test Data

Seed a dataset that includes:

- active creators
- inactive creators
- creators in all tiers
- creators with no linked accounts
- creators with no activities
- creators with rich activity history
- creators with missing metrics

## Bug Severity Guidance

### Blocker

- unauthorized data access
- mutation allowed for read-only role
- dashboard or detail fails for normal users

### High

- incorrect GMV display
- missing current metrics for common cases
- export wrong scope

### Medium

- stale data label missing
- non-critical layout or pagination bugs

## Sources

- [UGC_CREATOR_DASHBOARD_PRD.md](</C:/Users/Lenovo/Downloads/MM Database/docs/UGC_CREATOR_DASHBOARD_PRD.md>)
- Convex realtime: https://docs.convex.dev/realtime
- Convex pagination: https://docs.convex.dev/database/pagination
- Convex with Clerk: https://docs.convex.dev/auth/clerk
