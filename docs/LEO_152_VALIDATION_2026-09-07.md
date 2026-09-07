# Leo 152 compatibility validation — in progress

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
