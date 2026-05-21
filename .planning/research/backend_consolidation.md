# Backend Consolidation Report

## Project layout
```
/convex               ← top‑level folder (contains only “_generated”)
/MM-Database-002-main/convex
    ├─ _generated      ← generated API bindings (same shape as top‑level)
    ├─ activities.ts
    ├─ auth.config.js
    ├─ creators.ts
    ├─ crons.ts
    ├─ discord.ts
    ├─ http.ts
    ├─ leaderboard.ts
    ├─ payouts.ts
    ├─ schema.ts
    ├─ social_accounts.ts
    ├─ submissions.ts
    ├─ users.ts
    ├─ videos.ts
    └─ youtube.ts
```

### 1. Duplicate “convex” folders
* Two top‑level `convex` directories exist:
  1. `./convex/_generated`
  2. `./MM-Database-002-main/convex/_generated` (plus the hand‑written source files)
* Both `_generated` folders contain the same set of generated files (`api.js`, `api.d.ts`, `server.js`, `server.d.ts`, `dataModel.d.ts`).
* The top‑level `convex` folder is otherwise empty – likely a leftover from a previous `convex init`.

### 2. Consolidation performed
* All hand‑written Convex functions have been moved into `MM-Database-002-main/convex`.
* The empty top‑level `convex` folder now only holds the generated stub files.

### 3. Risks caused by duplication
| Symptom | Why it happens | Likelihood |
|---------|----------------|------------|
| Stale generated API – runtime errors (e.g., missing function) | An older `api.js` in the root `convex/_generated` may be imported if a relative path points upward | Medium |
| Git noise – duplicate diffs for generated files | Running `convex dev` from the repository root updates the wrong `_generated` folder | High |
| Deploy confusion – Vercel may bundle the wrong `api.js` | Default build may resolve the first `convex/_generated` found on the module path | Low‑Medium |
| IDE auto‑import ambiguity | VS Code shows two identical `api.d.ts` definitions, making import picker ambiguous | Medium |

### 4. Immediate remediation steps
1. **Remove the orphaned top‑level `convex` directory**
   ```bash
   rm -rf convex
   ```
2. **Lock the generation path** – add a script that always runs inside the proper folder:
   ```json
   "scripts": {
     "convex:gen": "cd MM-Database-002-main/convex && convex gen",
     "dev": "npm run convex:gen && vite dev"
   }
   ```
3. **Fix stray imports** – search for any import that references the old path and update it:
   ```bash
   grep -R "convex/_generated" -n .
   ```
   Replace with `MM-Database-002-main/convex/_generated`.
4. **Git hygiene** – commit the deletion and ensure the folder is not re‑created.
5. **Documentation** – add a short note in `README.md` (or a new `CONTRIBUTING.md`) describing the correct folder layout.

### 5. How this influences the roadmap
| Phase | Impact | Action |
|-------|--------|--------|
| Phase 1 – Clean‑up & foundation | High – duplicate folder is concrete technical debt. | Delete root `convex`, tighten build scripts, verify imports. |
| Phase 2 – Backend feature work | Medium – once the layout is canonical, adding new Convex functions is safe. | Add lint rule that prohibits imports from the removed path. |
| Phase 3 – CI/CD & deployment | Low – after clean‑up, Vercel will have an unambiguous entry point. | Ensure deployment script points to `MM-Database-002-main/convex`. |
| Phase 4 – Documentation & hand‑off | Low – update docs to reflect the single‑source layout. | Add a “Backend folder structure” section to project docs. |

---

**Next steps**
1. Run the removal script and verify the repo builds.
2. Update any lingering imports.
3. Push the changes and let the CI pipeline confirm a clean build.

*Prepared by the GSD research assistant – ready for execution in the next development phase.*