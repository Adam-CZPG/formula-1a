#!/bin/sh
# Capacitor android loyihasini sozlaydi: to'liq ekran, gorizontal, vibratsiya, ikonka,
# joystik (gamepad) va Android TV (Leanback launcher, banner, sensorli ekran shart emas)
set -e
cd "$(dirname "$0")/.."
M=android/app/src/main/AndroidManifest.xml
D=android/app/src/main/java/com/adamczpg/formula1a
cp android-overrides/MainActivity.java "$D/MainActivity.java"
cp android-overrides/F1aNativePlugin.java "$D/F1aNativePlugin.java"
grep -q screenOrientation "$M" || sed -i 's#<activity#<activity android:screenOrientation="sensorLandscape"#' "$M"
grep -q VIBRATE "$M" || sed -i 's#<uses-permission android:name="android.permission.INTERNET" />#<uses-permission android:name="android.permission.INTERNET" />\n    <uses-permission android:name="android.permission.VIBRATE" />#' "$M"
grep -q leanback "$M" || sed -i 's#<uses-permission android:name="android.permission.INTERNET" />#<uses-permission android:name="android.permission.INTERNET" />\n    <uses-feature android:name="android.software.leanback" android:required="false" />\n    <uses-feature android:name="android.hardware.touchscreen" android:required="false" />\n    <uses-feature android:name="android.hardware.gamepad" android:required="false" />\n    <uses-feature android:name="android.hardware.sensor.accelerometer" android:required="false" />#' "$M"
grep -q LEANBACK_LAUNCHER "$M" || sed -i 's#<category android:name="android.intent.category.LAUNCHER" />#<category android:name="android.intent.category.LAUNCHER" />\n                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />#' "$M"
grep -q 'android:banner' "$M" || sed -i 's#<application#<application android:banner="@drawable/banner"#' "$M"
rm -rf android/app/src/main/res/mipmap-anydpi-v26
cp -r android-overrides/res/* android/app/src/main/res/
grep -q LEANBACK_LAUNCHER "$M" && grep -q 'android:banner' "$M" || { echo "XATO: TV manifest sozlanmadi"; exit 1; }
echo "android sozlandi"
