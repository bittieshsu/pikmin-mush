# Fleet 154 compatibility — 2026-10-05 (Asia/Taipei)

All four active phones were manually upgraded to game 154.0 / 1789606828
after the version-update dialog blocked 153 scanning. Do not infer capture
from target completion or heartbeat. Libra remains disabled.

## Verified native contract

- Unity 6000.0.58f2, IL2CPP metadata 31.1. Consumed MapObjectProto,
  ProtoBasedMapObject, PointProto, PoiMushroomProto and PoiChallengeInfoProto
  fields retain their 153 offsets and method argument counts.
- ARM64 mapped RVAs: MapObjectManager.RegisterMapObject 0x5A77300;
  LocationController.Update 0x71DADB8; SetDeviceLocationOverrideForDebug
  0x71DB918. Cpp2IL's reported addresses for this ELF are file offsets;
  executable PT_LOAD contributes +0x4000. The binary signature regression
  checks this distinction explicitly.
- libil2cpp SHA256: 791095556486512206a2f8e3f8f69e66e3982e47dbe794cb70dec7ee6b9dff84.
- metadata SHA256: 32c28291a8a7e5d4734b3876f81765d3541bfcfa9f6e869b89dfbb7504e71020.
- Preserve fail-closed 152/153 profiles; 154 uses the same two-argument UI
  hook and deferred, metadata-resolved MapManager callback. No query hook.
- Native dual-ABI build passed (154 behavior validated on ARM64 only).
  Run `python module/tests/profile154-test.py <154 ARM64 libil2cpp.so>`.
- Site `npm test`: 82 passed; `npm audit --omit=dev`: zero vulnerabilities.
  Unsupported 155 and mixed game/module versions remain rejected.

## Leo canary

Backed up Hunter and Agent in private root storage, preserving token/config,
offset, leases and protection settings; paused, installed Hunter, rebooted.
At 23:43 runtime signatures verified 154; deferred MapManager resolved to
0xCEDA140 and installed. After the startup warning was acknowledged and map
opened, synchronizing the system GPS with the existing target restored POIs.
At 23:47:37 five fresh mushroom rows were captured, cumulative TSV
444951 -> 444956, and the existing target produced a fresh `object` marker.
Manual pause suppresses the usual system GPS provider setup; terrain alone
is not evidence of successful or unsuccessful capture.

The site compatibility release and each phone's task ACK/upload/server
acceptance must be separately recorded below; canary capture is not a soak.
