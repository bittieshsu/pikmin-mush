# Pikmin Mushroom Radar — Claude Code deployment handoff

Updated: 2026-08-20 (Asia/Taipei)
Repository: `https://github.com/odyliao-lab/pikmin-mush`
Production: `https://mush.odyliao.cc`
Codex Sites project: `appgprj_6a5a56aaa2e08191b31a17cdc443aa93`

## 1. Current verified baseline

- GitHub `main` is at `f662a76` (`Merge pull request #45`). This includes PR #44 and the follow-up fleet cooldown fix from PR #45.
- The production deployment was completed from that baseline as Sites version 39, and its status reached `succeeded`.
- Verified endpoint: `GET https://mush.odyliao.cc/api/mushrooms?limit=1` returned HTTP 200 with normal pagination and scan-status payload.
- No Sites source credential, Android agent token, webhook URL, or generated deployment archive is committed in this repository.

## 2. Read these files first

Read in this order before changing scanner or deployment behavior:

1. `CLAUDE_HANDOFF.md`, especially §11.3–§11.5 (deployment runbook and validation).
2. `WORKLOG.md`, entries dated 2026-08-20 (recent fleet diagnosis and recovery evidence).
3. `phone_agent/agent.sh` (device-side scan lifecycle and map-refresh fallback).
4. `site/lib/scan-plans.ts` and `site/app/admin/admin-client.tsx` (scan-plan density and admin controls).
5. `site/lib/targets.ts` (target materialization and D1 batching).
6. `site/lib/fleet.ts` (lease/dispatch cooldown behavior).
7. `.openai/hosting.json` (Sites project configuration; do not put secrets here).

## 3. Recent scanner changes that must be preserved

### Map-refresh recovery (PR #44)

The fleet previously appeared to scan successfully while producing almost no fresh mushroom observations.

- `MAP_REFRESH_TIMEOUT_SECONDS=0` skipped the immediate refresh wait.
- More importantly, the `RegisterMapObject` capture hook only fires while Pikmin is actually on the map. A cold restart can land on the dashboard, where GPS override and query calls can still look successful but no mushroom object is captured.
- `phone_agent/agent.sh` now uses `wait_for_map_refresh()` fallback at three bounded times, each with a distinct recovery action. Do **not** replace this with `KEYCODE_BACK`: from the dashboard it backgrounds the game.
- End-to-end device testing observed the intended recovery sequence: timeout → fallback → cold restart → `source=object` recovery.

### Throughput settings (PR #44)

- Grid step: 600 m → 350 m.
- City radius: 2 km → 8 km, including suburbs.
- Per-task target limit: 10,000 → 30,000.
- Admin UI includes an all-world selection control and Taiwan/Canada city packs.

### Dispatch cooldown correction (PR #45)

`site/lib/fleet.ts` must use the scan plan's configured `base_cooldown_s` directly. The previous lease code added a distance-based minimum of up to 120 seconds, silently overriding the configured cross-city behavior and negating the throughput work.

Do not reintroduce distance-based dispatch delay unless it is an explicit product decision with corresponding plan/UI changes and tests.

### Agent 5

The test device serial `f40b1e06` was enrolled through `/admin` and is operating as `agent5`. Its local agent token is device-only; never place it in Git, a handoff document, or a CI secret.

## 4. D1 target-materialization capacity risk

The new 8 km / 350 m plan can create roughly 2,116 points for one city. `materializeTargets()` currently limits a task to 30,000 points.

`site/lib/targets.ts` uses 7 rows per INSERT and 50 SQL statements per D1 `db.batch()`. A 30,000-point task therefore requires approximately:

- 4,286 INSERT statements; and
- 86 sequential D1 batch calls.

The code compiles and production deploys, but a near-30,000-point materialization has **not** been pressure-tested against the Worker execution-time limit. Do not assume it fails; treat it as an operational risk to measure.

Before increasing the limit further or making whole-world jobs the normal workflow, implement resumable/asynchronous materialization: persist job progress, create targets in bounded chunks, report duration/failure metrics, and make retries idempotent.

## 5. Division of responsibility: Claude Code vs. Codex Sites

### Claude Code

1. Make code changes on a feature branch.
2. Run repository tests and create/review/merge a GitHub PR.
3. Document any deployment-required change in the PR body or worklog.
4. Hand the merged commit SHA to the Codex operator for production publication.

### Codex authenticated to this Sites project

1. Check out the merged `main`.
2. Run `npm test` from `site/`.
3. Split `site/` with `git subtree split --prefix site`.
4. Obtain a new short-lived Sites source credential through the authenticated Codex Sites connector.
5. Push the subtree source to the Sites remote, package it, save a version, deploy it, and poll until `succeeded`.
6. Verify the production API and any changed user flow.

## 6. Why Claude Code cannot independently deploy to this Sites project

The source credential used by the current Sites integration is short-lived and minted by the authenticated Codex Sites connector for the authorized project/session. It is not a reusable GitHub credential or a supported external CLI/API credential.

Never request, paste, persist, or share this credential through chat, Git, `.git-credentials`, Git config, environment variables, CI secrets, issue/PR text, or a handoff file. No long-lived credential for non-Codex deployment has been configured.

The preferred operating model is therefore: Claude Code owns code/PR work; an authenticated Codex workspace owns final Sites publication.

If independent non-Codex deployment becomes a hard requirement, plan a separate migration to infrastructure controlled by the project owner (for example Cloudflare Workers/D1 with an owner-managed CI token). Do not treat that as a small credential change to the current Codex Sites setup.

## 7. Packaging reference (Codex environment only)

The helper currently exists in the Codex plugin cache, not this repository. Its installed version/path may change. To discover it on Windows:

```powershell
rg --files "$env:USERPROFILE\.codex\plugins\cache\openai-bundled\sites" | rg 'package-site\.sh$'
```

Example invocation from a Codex-equipped Windows machine (adjust the discovered version/path and repository path):

```powershell
& 'C:\Program Files\Git\bin\bash.exe' `
  'C:/Users/Ody/.codex/plugins/cache/openai-bundled/sites/<version>/scripts/package-site.sh' `
  '/f/Codex/Pikmin_Dev-retention/site' `
  '/f/Codex/Pikmin_Dev-retention/site-deploy.tar.gz'
```

The archive is a temporary deployment artifact; keep it ignored and never commit it.

## 8. Minimum deployment validation

After every production release:

```powershell
Set-Location <repo>\site
npm test

Invoke-WebRequest 'https://mush.odyliao.cc/api/mushrooms?limit=1' |
  Select-Object -ExpandProperty StatusCode
```

The API must return `200`; the Sites deployment must separately be polled to `succeeded`. For scanner changes, also confirm a fresh on-device observation is uploaded, rather than treating a map-query callback as proof of a fresh observation.

## 9. Safe next work

1. Observe and record actual D1 materialization duration for a large multi-city job before changing the 30,000-point limit.
2. Add resumable materialization if Worker timing becomes variable or slow.
3. Keep testing the map-refresh fallback using a fresh TSV/uploaded observation and `source=object`, not only successful GPS/query logs.
4. Keep all credentials device-local or connector-local, and redact them from worklogs and PRs.
