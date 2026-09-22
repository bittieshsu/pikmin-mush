# Libra visual recovery acceptance (2026-09-23)

Scope: Libra only, physical 1440x3120 display, game/module 153.0. Other Agents
retain their existing configuration and safety thresholds. No site source changed.

## Changes

- Opt-in VISUAL_RECOVERY_ENABLED suppresses unsolicited ENTER/DPAD events.
- Healthy object capture does not trigger screen manipulation. Two failed
  refresh points permit visual recovery; three permit a bounded cold restart.
- Static control-color profiles recognize the two tested warning layouts,
  activity close button, and dashboard. Two fresh identical classifications and
  foreground checks precede each action. At most three transitions per attempt;
  unknown, changed, obscured, wrong-size or malformed captures receive no input.
- Root Agent captures directly, avoiding an extra Magisk notification obscuring
  its own samples. Temporary images are deleted after classification.
- ui-probe is ARM64/API26; build from ui-probe.c and ui-templates.h using the
  documented NDK command. Static samples contain only UI controls, not accounts,
  map coordinates or screenshots. Other resolutions remain unsupported.

## Evidence

- Site npm test: 63/63 passed after merging current main.
- Agent control, upload chunk, map entry, visual recovery, power guard and
  power guard integration tests passed. New probe synthetic fixtures passed
  on the Android binary (known states, blank, truncated, extra bytes, wrong size).
- Fourteen private screenshot fixtures distinguished warning/activity/dashboard
  from live map screens. These diagnostic fixtures are not in Git.
- Controlled game force-stop exercised cold startup without manual UI help.
  Around 00:23 Taipei Agent logged verified recovery state=warning followed by
  state=dashboard, then a new source=object target and a successful 104-byte upload.
- Earlier observation proved activity UI can coexist with fresh capture/upload;
  screen alone is not used to declare failure. This is a recovery smoke test,
  not a long-term soak or a guarantee that future UI changes will match.

No token rotation, task-allocation change or website deployment is part of this
release. Libra retains its existing identity, credentials and scan progress.
