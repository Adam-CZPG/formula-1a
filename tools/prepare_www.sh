#!/bin/sh
# APK uchun www/ papkasini tayyorlaydi: index.html + mahalliy three.js (internetsiz ishlaydi)
set -e
cd "$(dirname "$0")/.."
rm -rf www && mkdir -p www/lib/three/build www/lib/three/examples/jsm
cp node_modules/three/build/three.module.js www/lib/three/build/
for d in environments postprocessing shaders utils; do cp -r node_modules/three/examples/jsm/$d www/lib/three/examples/jsm/; done
sed -e 's#https://unpkg.com/three@0.160.0/build/three.module.js#./lib/three/build/three.module.js#' \
    -e 's#https://unpkg.com/three@0.160.0/examples/jsm/#./lib/three/examples/jsm/#' index.html > www/index.html
grep -q 'unpkg' www/index.html && { echo "XATO: CDN havolasi qoldi"; exit 1; } || true
echo "www tayyor"
