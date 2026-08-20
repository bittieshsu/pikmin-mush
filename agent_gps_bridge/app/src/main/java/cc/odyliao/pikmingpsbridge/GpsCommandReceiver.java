package cc.odyliao.pikmingpsbridge;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.app.Activity;
import android.location.Location;
import android.location.LocationManager;
import android.os.SystemClock;
import android.util.Log;

/**
 * Android 9 compatible, explicit-only GPS test-provider bridge.
 *
 * The receiver has no network permission and accepts coordinates only from an
 * explicit shell/root broadcast issued by the local scanner Agent.  The
 * platform's mock-location AppOp remains the authority for every write.
 */
public final class GpsCommandReceiver extends BroadcastReceiver {
    public static final String ACTION_SET =
            "cc.odyliao.pikmingpsbridge.SET_LOCATION";
    public static final String ACTION_STATUS =
            "cc.odyliao.pikmingpsbridge.STATUS";
    public static final String EXTRA_LAT = "lat";
    public static final String EXTRA_LNG = "lng";
    public static final String EXTRA_TOKEN = "token";
    private static final String PROVIDER = LocationManager.GPS_PROVIDER;
    private static final String TAG = "PikminGpsBridge";

    @Override public void onReceive(Context context, Intent intent) {
        try {
            LocationManager manager = (LocationManager) context.getSystemService(
                    Context.LOCATION_SERVICE);
            String detail;
            if (ACTION_STATUS.equals(intent.getAction())) {
                detail = "provider=" + manager.isProviderEnabled(PROVIDER);
            } else if (ACTION_SET.equals(intent.getAction())) {
                // Android 9's `am broadcast` accepts string extras reliably;
                // parse deliberately rather than treating a String extra as a
                // missing primitive double (which would otherwise be NaN).
                double lat = parseCoordinate(intent, EXTRA_LAT);
                double lng = parseCoordinate(intent, EXTRA_LNG);
                apply(manager, lat, lng);
                detail = "gps=" + lat + "," + lng;
            } else {
                throw new IllegalArgumentException("unsupported action");
            }
            Log.i(TAG, detail);
            // Shell uses `am broadcast --ordered`; the result is part of the
            // command output, allowing the Agent to fail closed on a rejected
            // mock-location write instead of merely seeing a broadcast send.
            setResultCode(Activity.RESULT_OK);
            setResultData(detail);
        } catch (Throwable error) {
            String detail = error.getClass().getSimpleName() + ": "
                    + String.valueOf(error.getMessage());
            Log.e(TAG, "GPS bridge failed", error);
            setResultCode(Activity.RESULT_CANCELED);
            setResultData(detail);
        }
    }

    @SuppressWarnings("deprecation")
    private static void apply(LocationManager manager, double lat, double lng) {
        if (!Double.isFinite(lat) || !Double.isFinite(lng) || lat < -90 || lat > 90
                || lng < -180 || lng > 180) {
            throw new IllegalArgumentException("invalid latitude/longitude");
        }
        try {
            manager.addTestProvider(PROVIDER, false, true, false, false,
                    true, true, true, 3, 1);
        } catch (IllegalArgumentException ignored) {
            // A test provider may already be installed from the preceding point.
        }
        manager.setTestProviderEnabled(PROVIDER, true);
        Location location = new Location(PROVIDER);
        location.setLatitude(lat);
        location.setLongitude(lng);
        location.setAccuracy(3f);
        location.setAltitude(0d);
        location.setSpeed(0f);
        location.setBearing(0f);
        location.setTime(System.currentTimeMillis());
        location.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());
        manager.setTestProviderLocation(PROVIDER, location);
    }

    private static double parseCoordinate(Intent intent, String key) {
        String value = intent.getStringExtra(key);
        if (value != null) {
            return Double.parseDouble(value);
        }
        return intent.getDoubleExtra(key, Double.NaN);
    }
}
