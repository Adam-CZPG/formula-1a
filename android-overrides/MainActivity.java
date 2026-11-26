package com.adamczpg.formula1a;

import android.os.Bundle;
import android.os.SystemClock;
import android.view.InputDevice;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebView;
import android.widget.Toast;
import com.getcapacitor.BridgeActivity;
import java.util.Locale;

/**
 * Formula 1a: to'liq ekran + joystik (gamepad) va Android TV pulti.
 * Joystik holati JS ga window.F1aPad.native({...}) orqali yuboriladi,
 * TV pultining "Orqaga" tugmasi esa F1aPad.back() ga (pauza / menyuda orqaga).
 */
public class MainActivity extends BridgeActivity {
    private float lx, ly, lt, rt, hx, hy;
    private long lastBack = 0;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(F1aNativePlugin.class);
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        try {
            WebView wv = getBridge().getWebView();
            wv.getSettings().setMediaPlaybackRequiresUserGesture(false);
            wv.setFocusable(true);
            wv.setFocusableInTouchMode(true);
            wv.requestFocus();
        } catch (Exception ignored) {}
        hideBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideBars();
        else js("window.F1aPad&&F1aPad.native({t:'reset'})");
    }

    @SuppressWarnings("deprecation")
    private void hideBars() {
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            | View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
    }

    private void js(String code) {
        try {
            WebView wv = getBridge().getWebView();
            if (wv != null) wv.evaluateJavascript(code, null);
        } catch (Exception ignored) {}
    }

    private static boolean isPad(int src) {
        return (src & InputDevice.SOURCE_GAMEPAD) == InputDevice.SOURCE_GAMEPAD
            || (src & InputDevice.SOURCE_JOYSTICK) == InputDevice.SOURCE_JOYSTICK;
    }

    private static String padName(int kc) {
        switch (kc) {
            case KeyEvent.KEYCODE_BUTTON_A: return "A";
            case KeyEvent.KEYCODE_BUTTON_B: return "B";
            case KeyEvent.KEYCODE_BACK: return "B"; // ba'zi joystiklar B o'rniga BACK yuboradi
            case KeyEvent.KEYCODE_BUTTON_X: return "X";
            case KeyEvent.KEYCODE_BUTTON_Y: return "Y";
            case KeyEvent.KEYCODE_BUTTON_L1: return "LB";
            case KeyEvent.KEYCODE_BUTTON_R1: return "RB";
            case KeyEvent.KEYCODE_BUTTON_L2: return "LT";
            case KeyEvent.KEYCODE_BUTTON_R2: return "RT";
            case KeyEvent.KEYCODE_BUTTON_SELECT: return "BACK";
            case KeyEvent.KEYCODE_BUTTON_START: return "START";
            case KeyEvent.KEYCODE_MENU: return "START";
            case KeyEvent.KEYCODE_BUTTON_THUMBL: return "LS";
            case KeyEvent.KEYCODE_BUTTON_THUMBR: return "RS";
            case KeyEvent.KEYCODE_BUTTON_MODE: return "HOME";
            case KeyEvent.KEYCODE_DPAD_UP: return "UP";
            case KeyEvent.KEYCODE_DPAD_DOWN: return "DOWN";
            case KeyEvent.KEYCODE_DPAD_LEFT: return "LEFT";
            case KeyEvent.KEYCODE_DPAD_RIGHT: return "RIGHT";
            case KeyEvent.KEYCODE_DPAD_CENTER: return "A";
            default: return null;
        }
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent e) {
        int kc = e.getKeyCode();
        if (isPad(e.getSource())) {
            String n = padName(kc);
            if (n != null) {
                if (e.getRepeatCount() == 0) {
                    boolean down = e.getAction() == KeyEvent.ACTION_DOWN;
                    js("window.F1aPad&&F1aPad.native({t:'key',b:'" + n + "',down:" + down + "})");
                }
                return true; // tizimning "B = orqaga" kabi zaxira harakatlarini to'xtatamiz
            }
        }
        if (kc == KeyEvent.KEYCODE_BACK || kc == KeyEvent.KEYCODE_ESCAPE) {
            if (e.getAction() == KeyEvent.ACTION_UP) handleBack();
            return true;
        }
        return super.dispatchKeyEvent(e);
    }

    private void handleBack() {
        try {
            getBridge().getWebView().evaluateJavascript(
                "(window.F1aPad&&F1aPad.back())?'1':'0'",
                v -> { if (v == null || !v.contains("1")) exitPrompt(); });
        } catch (Exception ex) { exitPrompt(); }
    }

    private void exitPrompt() {
        long now = SystemClock.uptimeMillis();
        if (now - lastBack < 2000) { finish(); return; }
        lastBack = now;
        Toast.makeText(this, "Chiqish uchun yana bir marta bosing", Toast.LENGTH_SHORT).show();
    }

    private static float axis(MotionEvent e, InputDevice dev, int a) {
        float v = e.getAxisValue(a);
        if (dev != null) {
            InputDevice.MotionRange r = dev.getMotionRange(a, e.getSource());
            if (r != null && Math.abs(v) <= r.getFlat()) return 0f;
        }
        return v;
    }

    @Override
    public boolean dispatchGenericMotionEvent(MotionEvent e) {
        if ((e.getSource() & InputDevice.SOURCE_JOYSTICK) == InputDevice.SOURCE_JOYSTICK
                && e.getAction() == MotionEvent.ACTION_MOVE) {
            InputDevice dev = e.getDevice();
            float nlx = axis(e, dev, MotionEvent.AXIS_X);
            float nly = axis(e, dev, MotionEvent.AXIS_Y);
            float nrt = Math.max(e.getAxisValue(MotionEvent.AXIS_RTRIGGER), e.getAxisValue(MotionEvent.AXIS_GAS));
            float nlt = Math.max(e.getAxisValue(MotionEvent.AXIS_LTRIGGER), e.getAxisValue(MotionEvent.AXIS_BRAKE));
            float nhx = e.getAxisValue(MotionEvent.AXIS_HAT_X);
            float nhy = e.getAxisValue(MotionEvent.AXIS_HAT_Y);
            if (Math.abs(nlx - lx) > 0.004f || Math.abs(nly - ly) > 0.004f || Math.abs(nrt - rt) > 0.004f
                    || Math.abs(nlt - lt) > 0.004f || nhx != hx || nhy != hy) {
                lx = nlx; ly = nly; rt = nrt; lt = nlt; hx = nhx; hy = nhy;
                js(String.format(Locale.US,
                    "window.F1aPad&&F1aPad.native({t:'axes',lx:%.3f,ly:%.3f,lt:%.3f,rt:%.3f,hx:%.0f,hy:%.0f})",
                    lx, ly, lt, rt, hx, hy));
            }
            super.dispatchGenericMotionEvent(e);
            return true;
        }
        return super.dispatchGenericMotionEvent(e);
    }
}
