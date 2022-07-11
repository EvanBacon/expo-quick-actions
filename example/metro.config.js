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

const { sync } = require("glob");

config.server = {
  ...config.server,
  rewriteRequestUrl: (url) => {
    try {
      const parsed = new URL(url);
      if (parsed.pathname.endsWith(".bundle")) {
        // Try resolving up
        const resolveName =
          parsed.pathname.substring(1).split(".").slice(0, -1).join(".") + ".*";
        const found = sync(resolveName, { cwd: path.join(__dirname, "..") });
        if (found.length) {
          parsed.pathname = "/.." + parsed.pathname;
          const nextUrl =
            parsed.origin + "/.." + parsed.pathname + parsed.search;
          console.log("redirected ->", nextUrl);
          return nextUrl;
        }
      }
    } catch {}
    return url;
  },
};
module.exports = config;
