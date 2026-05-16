# Authorization, Roles, and Access Model

## Summary

This document defines who can view and mutate which parts of the system. The goal is to keep the first release secure, simple, and compatible with future expansion.

## Design Principle

Authorization should be enforced in backend functions, not implied by UI structure. The client may hide controls, but the backend decides access.

## Current Recommended Role Model

Use four roles for the first release:

- `admin`
- `manager`
- `viewer`
- `creator`

The first three are core MVP roles. `creator` should remain disabled by default unless its use case is actively needed and fully tested.

## Role Definitions

### Admin

Can:

- view all creators
- view all activities
- create and edit creators
- create activities
- change tiers
- manage assignments
- export all visible data

Should be able to:

- identify stale records
- review unauthorized access incidents if logged later
- manage user provisioning later

### Manager

Can:

- view assigned creators
- view related creator activities
- create activities for assigned creators
- export only their scoped data

Cannot:

- view other managers' creators
- change global settings unless explicitly permitted

### Viewer

Can:

- view allowed creators and reports
- use filters and search
- export if the business wants read-only analysts to export

Cannot:

- create or edit activities
- edit creators
- change tiers or assignments

### Creator

Potential future role.

If enabled later, the creator should only:

- view their own profile,
- view their own current metrics,
- possibly view a subset of activity and notes intended for creator visibility.

They should not automatically see:

- internal manager notes,
- compensation rationale,
- sensitive adjustment commentary,
- comparative ranking tables.

## Scope Model

Role alone is insufficient. Each user also needs a scope.

### Scope types

- global
- manager_owned
- explicit_assignment
- self

### Recommended MVP mapping

- admin -> global
- manager -> manager_owned
- viewer -> explicit_assignment or global, depending on business need
- creator -> self

## Enforcement Rules

### List queries

Every list query must apply scope before returning data.

Examples:

- admin dashboard list -> all creators
- manager dashboard list -> only creators with matching `managerId`
- viewer dashboard list -> only explicitly allowed creators or teams

### Detail queries

Every creator detail query must:

1. authenticate the user,
2. resolve the app user record,
3. check creator scope,
4. only then return creator data.

### Mutations

Every mutation must independently validate:

- the user is authenticated,
- the user exists in the app table,
- the user has permission for this action,
- the target creator is in scope.

Never allow the frontend to submit a `managerId` or creator scope that the backend accepts without validation.

## Permission Matrix

| Action | Admin | Manager | Viewer | Creator |
|---|---|---|---|---|
| View dashboard | Yes | Yes | Yes | Optional |
| View creator in scope | Yes | Yes | Yes | Self only |
| Create activity | Yes | Yes | No | No |
| Edit creator identity | Yes | Limited | No | No |
| Change tier | Yes | Optional | No | No |
| Export data in scope | Yes | Yes | Optional | No |
| Manage users | Yes | No | No | No |
| View internal-only notes | Yes | Yes | Optional | No |

## Clerk Strategy

### What Clerk should own

- user sign-in
- session identity
- auth token issuance
- optional org context later

### What the app should own

- roles used by the business
- team ownership
- creator assignments
- note visibility rules

This split matters because Clerk authenticates identity, but it does not know which creators a manager should see unless the application models it.

## Organizations Decision

Clerk official docs present Organizations as a strong model for multi-user, role-aware, team-scoped applications. They are a good future option if this system becomes:

- multi-brand,
- multi-tenant,
- client-facing,
- or heavily team-partitioned.

For MVP, avoid forcing a full Organizations abstraction unless you already know the business operates as multiple tenant contexts.

Recommended approach:

- start with app-level roles and creator ownership,
- leave room to map teams or business units into Clerk Organizations later.

## Sensitive Data Considerations

Treat these as potentially sensitive:

- manager notes
- adjustment rationale
- Discord ids
- internal performance labels such as at-risk
- future compensation fields

If creator self-view is added later, create a clear visibility model:

- internal only
- manager only
- creator visible

## Access Failure States

### Unknown user

If a valid Clerk identity has no matching app user record:

- deny access,
- show a controlled "not provisioned" state,
- do not auto-create a privileged user silently.

### Out-of-scope creator

If a manager requests a creator outside their scope:

- return not found or unauthorized,
- do not reveal that the creator exists.

### Role drift

If Clerk metadata and app role records disagree:

- the app table is the source of authorization truth unless a deliberate sync strategy exists.

## Recommended Future Enhancements

- custom permissions beyond coarse roles
- activity visibility levels
- audited role-change log
- admin impersonation or support mode only with strong controls
- time-bounded temporary assignments

## Test Requirements

Must test:

- admin list versus manager list
- manager cross-scope denial
- viewer mutation denial
- export scope parity with UI list scope
- creator self-view denial of manager notes if the role is enabled

## Sources

- [UGC_CREATOR_DASHBOARD_PRD.md](</C:/Users/Lenovo/Downloads/MM Database/docs/UGC_CREATOR_DASHBOARD_PRD.md>)
- Clerk Organizations overview: https://clerk.com/docs/guides/organizations/overview
- Convex with Clerk: https://docs.convex.dev/auth/clerk

