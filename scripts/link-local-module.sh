#!/usr/bin/env bash
# Overlays the locally-built `expo-quick-actions` onto the copy installed in the
# example app's node_modules. Metro only honors a package's "exports" map for a
# real directory in node_modules (not symlinks), so the example installs the
# published package and we replace it with the local build + native code here.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="$ROOT/example/node_modules/expo-quick-actions"

if [ ! -d "$DEST" ]; then
  echo "skip link-local-module: $DEST not installed yet"
  exit 0
fi

cp -a "$ROOT/build" "$ROOT/plugin" "$ROOT/ios" "$ROOT/android" \
  "$ROOT/expo-module.config.json" "$ROOT/package.json" "$DEST/"

# The registry tarball may nest its own deps (SDK 55 image-utils under 6.0.2).
# The files above are the local package, so drop that copy and resolve deps from
# the example app, which installs the SDK 57 ranges declared in package.json.
rm -rf "$DEST/node_modules"

echo "linked local expo-quick-actions (JS + native) into example"
