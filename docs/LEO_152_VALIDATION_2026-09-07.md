# Leo 152 compatibility validation — production scanning restored

Device: agent5-9431de09, marble / 23049PCD8G, Wi-Fi 192.168.50.90:5555.
Confirmed root uid 0 and game 152.0 / versionCode 1787540739.
The phone's libil2cpp SHA256 exactly matches the static analysis input:
`cca53174dd87ce88326d70f2349c8d495ecb8b1a2234bdd6cc8a4861729257fa`.
Input: `C:\Users\Ody\AppData\Local\Temp\pikmin-v152-static`.

Verified dump-derived ARM64 RVAs (ELF file offset = RVA - 0x4000):
- MapManager.RegisterMapObject(MapObjectBase): 0xCE60E20.
- LocationController.Update: 0x71B5C34; first 16-byte signature changed.
- LocationController.SetDeviceLocationOverrideForDebug: 0x71B6794.
- MapQueryManager.OnMapQueryResponse: 0xCBF17E8.
Checked ProtoBasedMapObject initialMapObjectProto at 0x68 and challenge
level/type/start/finish/count/capacity/power field offsets against 152 dump.
Do not treat this static verification as an end-to-end capture result.

Built native artifacts with existing dual-ABI script, NDK r27d. Only Leo ARM64
deployment is in scope; emulator compatibility is not claimed.
Package: `C:\Users\Ody\.codex\tmp\hunter-152-build\hunter152.zip`.
Explicit package flags: GameVersion 152.0 / GameVersionCode 1787540739.
Original Hunter backed up on phone at `/data/local/tmp/leo152-backup/`.
Magisk install completed successfully, then reboot requested.

Leo was paused with control.sh pause-manual before installation because it was
repeatedly timing out and cold restarting. Keep paused until validation succeeds.
GPS Copy v151-r11 and Nectar v150 1.0.0 were ALREADY disabled; preserve that state.
Nectar mode file is auto, so do not enable or upgrade it into active claiming as
a side effect of scanner testing. No changes made to Aries/Cancer.

After reboot the fixed 5555 endpoint responded unauthorized. On 2026-09-07
20:36 Taipei, re-paired using the mDNS pairing service and connected successfully
to 192.168.50.90:41271 (marble). Do not kill/reset the shared ADB server.
Confirmed root, installed Hunter v152.0-r1, and game 152.0 / 1787540739.
Fresh Perfare logs at 20:36:30 confirm matching signatures and installation of
RegisterMapObject, LocationController.Update, and experimental refresh hooks.
SetOverride applied the existing Houston target and MapManager was captured.
No fresh mushroom rows yet: screenshot at 20:37 shows the home dashboard, not
the full map. The agent remains manually paused. Crash buffer contains init
crashes from boot, not a confirmed game crash in this launch.
Need enter the map and exercise whistle/expedition before claiming stability.

User subsequently confirmed whistle and expedition both work without crashing.
At 20:44 Taipei, entered the full 3D map; screenshot showed terrain but no POIs.
The game process remained pid 19306. Same-location refresh at 20:45:06 and a
nearby Houston test at 29.7604,-95.3698 at 20:45:44 both logged SetOverride applied
and post-location viewport refresh requested, but GmoManager unavailable.
The TSV still ended at epoch 1788782976 (pre-upgrade capture); no fresh capture
or upload has been demonstrated. This warning is an observed symptom, not yet
a proven root cause. Do not release fleet-wide or call scanning compatible yet.
Leo remains manually paused, now at the Houston test coordinate. Server and
the other two devices have not been modified in this verification pass.

Pending: confirm installed module after reboot, hooks and fresh TSV evidence,
map/whistle/expedition stability with user, GPS jumps and uploads. Update Leo's
MODULE_VERSION only after actual module proof; don't misreport the game version.
Server currently supports only 149/150/151 and rejects incompatible leases.
152 support needs a separately tested Sites compatibility update after native
proof, preserving matching game/module checks and existing 151 agents.
Do not claim fleet operation, recheck, notification or 2h soak validation yet.

## Controlled diagnosis and recovery (21:00–21:13 Taipei)

- Cold restart and native-only GPS changes still produced terrain without POIs.
- Android GPS provider was enabled but `last location=null`. The agent was
  manually paused, so it was not supplying system GPS fixes during these tests.
- Temporarily disabled Hunter and rebooted. Without a system GPS fix the game
  showed "searching for GPS". Supplying the Houston system GPS fix restored
  mushrooms and flowers. Re-enabled Hunter and rebooted; supplied the same fix
  before launching the game, then dismissed the startup warning and opened map.
- Fresh TSV rows appeared at epoch 1788786571–72 with Hunter enabled. At
  21:12:19 moved about 1 km to 29.7694,-95.3698 with BOTH system GPS and native
  teleport; query arrived at 21:12:19.792, object-ready at 21:12:20.260 and four
  new level-2 records followed, without restarting game pid 13287.
- `GmoManager unavailable` still occurred but did NOT prevent query/object
  refresh. It must not be treated as proof that the capture hook is broken.
- Removed Leo's stale GAME_VERSION=151.0 override so actual package version is
  detected on startup; changed MODULE_VERSION to 152.0. Preserved local pause
  while preparing server compatibility. Config backup stays only on the phone.
- Wi-Fi ADB 192.168.50.90:5555 is authorized again after reboot; verified serial
  f40b1e06 before commands. GPS Copy and Nectar remain disabled as originally.
- Sites compatibility adds 152 while retaining matching 149/150/151 support and
  rejecting mismatched game/module versions. Build, 24 tests and lint pass.

Pending: production deployment, agent-process restart to load new version
metadata, resume and verify fresh uploads and multiple completed leases.

## Production result (2026-09-07 21:22–21:24 Taipei)

The pending items above are completed for Leo's scanning path:

- PR #81 merged, GitHub main 35b1342e2d067dc77b5ab94bb9347302e5658e64.
- Sites version 76 succeeded; source 10975457bded3bf4ddbeb80bafb21a15a09c18f6.
  Deployment appgdep_6a9eba65bc4c8191a7087a87d7af59de. Public mushrooms API 200.
- Restarted only Leo's agent process, preserving pause until publication;
  startup logs now report game=152.0 module=152.0. Resumed its existing Houston
  task, not a new regional allocation. Fixed ADB 5555 remained reachable.
- First four automatic points: 292 (+3, 14s), 289 (+6, 12s), 282 (+6, 12s),
  279 (+3, 13s), all mode=direct and source=object with successful uploads.
- Production metrics after the first three completed targets: healthy,
  no_data_streak=0, captured_rows=15, failed_targets=0 for the observed window;
  matching 152 compatibility accepted. Captured rows are not a claim of globally
  unique mushrooms. The earlier expired lease is retained as historical evidence.
- Game pid 13287 remained unchanged during these automatic points. The crash
  buffer only showed boot-time init failures, not a game crash in this run.
- Aries/Cancer and their versions/regions/schedules remain unchanged. GPS Copy
  and Nectar remain disabled on Leo as before this repair.

This is a successful end-to-end recovery smoke test, not a 2h/24h soak result.
Manual paused testing must seed Android system GPS before launching the game:
the scanner creates a mock provider on startup but does not populate positions
while manually paused; native coordinates alone are insufficient in that state.
