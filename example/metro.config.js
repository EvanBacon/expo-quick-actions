const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, "..");

const config = getDefaultConfig(__dirname);

// Tell metro to include files outside of this directory, to include the parent project.
config.watchFolders = [projectRoot, workspaceRoot];

config.resolver.blockList = [
  // Prevent the resolver from creating recursive loops.
  /node_modules\/expo-quick-actions\/example\//,
];
// When a node module is resolved, Metro should check both the parent project and the current node_modules directory.
config.resolver.nodeModulesPath = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

for (const m of [
  "expo-modules-core",
  "react",
  "react-native",
  "expo-quick-actions",
]) {
  // When a module fails to resolve, Metro should look for it here. This helps reduce the change of duplicate modules being included and creating scoped memory issues.
  config.resolver.extraNodeModules[m] = path.resolve(
    require.resolve(m + "/package.json"),
    ".."
  );
}

module.exports = config;
