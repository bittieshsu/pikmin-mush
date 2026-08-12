# Pikmin GPS Bridge (Android 9)

`agent_gps_bridge` is a deliberately small local helper for scanner phones on
Android 9. It accepts an explicit broadcast from the on-device Magisk Agent
and uses `LocationManager`'s GPS test provider to publish the same coordinate
to Android system location services.

It has no network permission, no activity, and no persistent location loop.
The Agent remains the only component that chooses scan coordinates.

## Build

Install Android SDK platform 35 and a JDK, then run:

```powershell
gradle --no-daemon :app:assembleDebug
```

The resulting APK is `app/build/outputs/apk/debug/app-debug.apk`.

## One-time device setup

```powershell
adb -s <serial> install -r .\app\build\outputs\apk\debug\app-debug.apk
adb -s <serial> shell pm grant cc.odyliao.pikmingpsbridge android.permission.ACCESS_FINE_LOCATION
adb -s <serial> shell su -c "appops set cc.odyliao.pikmingpsbridge android:mock_location allow"
```

Set `GPS_BRIDGE_PACKAGE=cc.odyliao.pikmingpsbridge` in the Agent's local
`config`, while retaining `SYSTEM_GPS_OVERRIDE=0` on Android 9.

## Verification

Use a harmless nearby coordinate first. A successful broadcast returns
`result=-1` and `dumpsys location` must show the same coordinate under the
`gps` provider before resuming production scans.

```powershell
adb -s <serial> shell am broadcast --user 0 `
  -n cc.odyliao.pikmingpsbridge/.GpsCommandReceiver `
  -a cc.odyliao.pikmingpsbridge.SET_LOCATION `
  --es lat 24.824 --es lng 121.014
adb -s <serial> shell dumpsys location
```

The bridge is only for owned, rooted scanner devices. Revoke its mock-location
AppOp or uninstall it to disable system-GPS publication immediately.
