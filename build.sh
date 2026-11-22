#!/bin/sh
# src/ dagi qismlardan bitta index.html yig'adi
cd "$(dirname "$0")"
{ cat src/head.html
  echo '<script type="module">'
  echo "import * as THREE from 'three';"
  echo "import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';"
  echo "import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';"
  echo "import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';"
  echo "import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';"
  echo "import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';"
  echo "import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';"
  cat src/sim.js src/game.js
  echo '</script>'
  echo '</body>'
  echo '</html>'
} > index.html
echo "index.html tayyor"
