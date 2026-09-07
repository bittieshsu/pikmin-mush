# Aries 152 device rollout — automatic capture and upload verified

Scope: Aries only; Leo and Cancer remain unchanged. Sites v76 already accepts
matching 152 game/module versions, so no website redeployment is needed.

- Identity verified before mutations: primary, camellian / M2103K19G,
  serial 7lw8ibvghe6dtof6. Android game 152.0 / 1787540739.
- Native libil2cpp SHA256 matches the Leo-validated binary:
  cca53174dd87ce88326d70f2349c8d495ecb8b1a2234bdd6cc8a4861729257fa.
- Prior Hunter metadata was v150.0-r1, while agent config was pinned to 151.0.
  Paused locally and backed up module and config under private phone-local
  /data/local/tmp/aries152-backup before installation.
- Installed the same validated hunter152.zip (SHA256
  B6C6E8BAF719E79129022AC19300923102C57A314C8509ACAC3E5BBD76EA8682).
  Removed GAME_VERSION override, set MODULE_VERSION=152.0, rebooted.
- DHCP changed from 192.168.50.23 to 192.168.50.239; port 5555 survived.
  Reverified the serial before continuing. Do not confuse fixed port with a
  reserved/static IP address.
- Startup logs report agent=2.2.0 game=152.0 module=152.0. LOCAL_DISPLAY=0,
  SYSTEM_GPS_OVERRIDE=1 and original Buffalo work preserved.
- Resumed manual pause. At 21:35:26 Taipei, matching 152 signatures and all
  capture/GPS/refresh hooks were installed in game pid 10331.

## Automatic recovery verification

- Fresh capture began at 21:35:43 Taipei and uploads succeeded. First target
  622 had a query-only recovery, +0 measured rows and 55 seconds during startup;
  the startup uploads are not misrepresented as a successful non-empty target.
- Subsequent target 619 completed direct/object, +10 rows / 1055 bytes / 21s;
  target 612 completed direct/object, +6 rows / 624 bytes / 21s. Upload offsets
  advanced to 29878831. Game pid stayed 10331 through these targets.
- Production metrics report matching-version compatibility and healthy data
  flow. Old failures remain in the rolling-hour metrics; do not label the entire
  historical hour as a clean 152 test.
- Aries remains running on its original Buffalo task. No changes to Leo,
  Cancer, region allocation, notification schedule, or website release.

This verifies device recovery and consecutive capture/upload, not a 24h soak.
