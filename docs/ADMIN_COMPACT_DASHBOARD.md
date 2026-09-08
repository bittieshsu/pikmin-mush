# Compact admin dashboard

The protected `/admin` console now has four surfaces. Mobile navigation is fixed
at the bottom with safe-area spacing; desktop uses a left sidebar.

- Overview: actual online/attention counts, six-hour distinct challenges per
  agent, current leased city and last data receipt. Cross-agent counts may overlap.
- Fleet: existing job, agent, enrollment and credential controls; agent details,
  country packs, advanced parameters and logs are collapsed. Destructive actions
  require confirmation. New manual jobs require explicit country selection.
- Reports: whole-batch candidate/verification/selection/delivery summaries,
  exclusion reasons and paginated message-ID evidence. Recent batches have a
  selector; older retained batches can be queried by their full identifier.
- More: on-demand job efficiency, 24-hour soak and privacy-preserving usage data.

The six-hour chart is not an hourly trend and does not count upload rows as new
mushrooms. Unknown data stays unknown; failed requests retain successful data.
Delivery is measured in message chunks, not mushrooms. A verification record is
not proof of a successful check. Giant verification is explicitly not applicable.

## Data and performance

Only the active surface polls. Background browser tabs skip polling; requests are
scheduled after completion to avoid accumulating overlapping work. Dashboard
refresh is 10 seconds; metrics/report summaries are 60 seconds; expanded job
efficiency is 30 seconds. Logs are excluded until expanded; legacy API clients
continue receiving them by default.

City labels come only from the agent's live, owned target lease in its current
job. Report counts aggregate all latest chunks before UI pagination. No schema,
phone configuration, allocation policy, notification schedule or authentication
changes are included.

## Validation

- `npm test`: production build and 35 tests, including actual API handlers
  executed against SQLite and actual admin JSX server rendering.
- `npm run lint`; `npm audit --omit=dev`.
- Regression cases: empty/unknown/paused states, visibility and disposal,
  whole-batch counts beyond 50 event rows, missing message IDs, stale selection
  snapshots, access rejection, expired/wrong-owner/wrong-job city leases, and
  opt-in omission of logs without leaking agent secrets.
- Standalone `tsc --noEmit` has 108 pre-existing diagnostics (baseline comparison
  found no additions); this is not represented as a clean standalone type check.
- Browser interaction and real-phone layout acceptance remain separate from
  server-render tests. No local authentication bypass was introduced for preview.

Deployment evidence is recorded separately after Sites reports success.
