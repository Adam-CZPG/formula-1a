package com.adamczpg.formula1a;

import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.InputDevice;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** JS dan: Capacitor.Plugins.F1aNative.rumble({ms, strong}) — joystik vibratsiyasi. */
@CapacitorPlugin(name = "F1aNative")
public class F1aNativePlugin extends Plugin {
    @PluginMethod
    public void rumble(PluginCall call) {
        int ms = Math.max(10, Math.min(400, call.getInt("ms", 60)));
        double strong = call.getDouble("strong", 0.7);
        int amp = (int) Math.max(1, Math.min(255, strong * 255));
        try {
            for (int id : InputDevice.getDeviceIds()) {
                InputDevice d = InputDevice.getDevice(id);
                if (d == null) continue;
                int s = d.getSources();
                if ((s & InputDevice.SOURCE_GAMEPAD) != InputDevice.SOURCE_GAMEPAD
                        && (s & InputDevice.SOURCE_JOYSTICK) != InputDevice.SOURCE_JOYSTICK) continue;
                Vibrator v;
                if (Build.VERSION.SDK_INT >= 31) v = d.getVibratorManager().getDefaultVibrator();
                else v = d.getVibrator();
                if (v == null || !v.hasVibrator()) continue;
                if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createOneShot(ms, amp));
                else v.vibrate(ms);
            }
        } catch (Exception ignored) {}
        call.resolve();
    }
}
