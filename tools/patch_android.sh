#!/bin/sh
# Capacitor android loyihasini sozlaydi: to'liq ekran, gorizontal, vibratsiya, ikonka
set -e
cd "$(dirname "$0")/.."
M=android/app/src/main/AndroidManifest.xml
J=android/app/src/main/java/com/adamczpg/formula1a/MainActivity.java
cp android-overrides/MainActivity.java "$J"
grep -q screenOrientation "$M" || sed -i 's#<activity#<activity android:screenOrientation="sensorLandscape"#' "$M"
grep -q VIBRATE "$M" || sed -i 's#<uses-permission android:name="android.permission.INTERNET" />#<uses-permission android:name="android.permission.INTERNET" />\n    <uses-permission android:name="android.permission.VIBRATE" />#' "$M"
rm -rf android/app/src/main/res/mipmap-anydpi-v26
cp -r android-overrides/res/* android/app/src/main/res/
echo "android sozlandi"
