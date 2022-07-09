const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, "..");

const config = getDefaultConfig(__dirname);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPath = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

for (const m of [
  "expo-modules-core",
  // "react-native/Libraries/EventEmitter/RCTDeviceEventEmitter",
  "react",
  "react-native",
]) {
  config.resolver.extraNodeModules[m] = path.resolve(
    require.resolve(m + "/package.json"),
    ".."
  );
}

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("./NativeTransformer"),
};

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter(
    (ext) => !["swift", "kt"].includes(ext)
  ),
  sourceExts: [...config.resolver.sourceExts, "swift", "kt"],
};

module.exports = config;
