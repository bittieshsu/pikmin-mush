# Fleet 153 map recovery — 2026-09-22

## Confirmed causes and changes

- Libra's prior maintenance left two independent Agent processes. They were
  stopped and replaced by one verified owner. Never delete agent.pid and start
  another process without verifying/stopping its owner.
- Libra can capture normal game screenshots via on-device screencap then adb
  pull. Current game windows did not show FLAG_SECURE. Earlier claims of a
  secure-surface restriction were unsupported; original capture failure remains
  unproven. Libra is Android 14 at 1440x3120; Aries is Android 13 at 1080x2400.
- Physical dashboard map navigation is finger right-to-left on Libra. New
  opt-in swipe configuration avoids Life Log collapse/Explore taps. Warning
  acknowledgement precedes the swipe; do not acknowledge by key and then tap
  a dashboard quest at the old warning location.
- Cancer's system curl rejects --dns-servers before making a request. System
  DNS returned HTTP 200. Cancer now uses system DNS; startup capability probing
  in source prevents this unsupported option from silently stopping requests.
- Cancer's observed compass and warning coordinates were calibrated separately;
  it retains tap entry. Battery recovery threshold 80% and factory protections
  were not changed.

## Verification (Taipei, approximately 23:40–23:57)

- Android shell syntax, map-entry regression, upload chunk regression passed.
- Aries: consecutive object readiness, completed points and uploads; sampled
  server response accepted=5.
- Leo: consecutive object readiness, completed points and uploads; sampled
  server response accepted=3.
- Cancer: after DNS repair, consecutive object readiness and uploads including
  three-row points; sampled server response accepted=3.
- Libra: multiple Chicago points produced object readiness and accepted uploads.
  After the final gesture correction, cold restart returned to the live map
  without manual dismissal. The initial water-edge point still timed out; the
  following Milwaukee point produced five new rows/566 bytes and the next point
  produced another upload. Empty-point cold restarts remain an efficiency issue,
  not proof that every point lacks mushrooms.

This is a live recovery check, not a two-hour or overnight soak. No website
deployment or task-allocation change was made in this repair. Private coordinates,
tokens and diagnostic captures are excluded from this document.
