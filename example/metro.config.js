const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, "..");

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enableSymlinks = true;
config.resolver.blockList = [/node_modules\/expo-quick-actions\/example\//];
config.watchFolders = [projectRoot, workspaceRoot];
config.resolver.nodeModulesPath = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

for (const m of [
  "expo-modules-core",
  // "react-native/Libraries/EventEmitter/RCTDeviceEventEmitter",
  "react",
  "react-native",
  "expo-quick-actions",
]) {
  config.resolver.extraNodeModules[m] = path.resolve(
    require.resolve(m + "/package.json"),
    ".."
  );
}

module.exports = config;
