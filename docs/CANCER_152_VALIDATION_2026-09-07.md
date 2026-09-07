# Cancer 152 rollout — scanning restored

- Device verified: agent-4-pixel-3-cd8643b9, Pixel 3 / blueline, serial
  8ADX0QS09, Wi-Fi ADB 192.168.50.44:5555. Authorization accepted by user.
- Game 152.0 / 1787540739, native SHA256
  cca53174dd87ce88326d70f2349c8d495ecb8b1a2234bdd6cc8a4861729257fa,
  identical to the validated Leo/Aries input.
- Paused locally, backed up Hunter/config on the phone, installed validated
  hunter152.zip (SHA256 B6C6E8BAF719E79129022AC19300923102C57A314C8509ACAC3E5BBD76EA8682).
  Removed pinned GAME_VERSION, set MODULE_VERSION=152.0; rebooted and confirmed
  matching startup metadata. Preserved LOCAL_DISPLAY=0, SYSTEM_GPS_OVERRIDE=1,
  fixed port 5555 and original Sacramento work. Resumed after reboot.
- Hooks loaded with verified signatures; game pid 6905 stayed unchanged during
  the observed automatic targets. Crash buffer was empty during verification.
- Startup target 894: +3 rows, 59s, query response. Target 887: +0, 25s with
  query-only recovery; subsequent uploads are recorded separately, not relabeled
  as a non-empty target. Then consecutive direct/object targets 884/877/878:
  +8/+4/+7 rows, each 20s, successful uploads; offset advanced to 21051273.
- Production metrics during validation: Cancer, Leo and Aries all healthy,
  compatible, no_data_streak=0, with recent data ages about 5–6 seconds.
- Only Cancer modified. No website release needed (Sites v76 already accepts
  matched 152); regions and notification schedules unchanged. This is an E2E
  recovery check, not a long-duration soak or unique-mushroom count claim.
