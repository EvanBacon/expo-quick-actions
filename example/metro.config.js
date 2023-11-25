const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const fs = require("fs");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, "..");

const config = getDefaultConfig(__dirname);

// config.resolver.unstable_enableSymlinks = false;
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
]) {
  config.resolver.extraNodeModules[m] = path.resolve(
    require.resolve(m + "/package.json"),
    ".."
  );
}

// config.transformer = {
//   ...config.transformer,
//   babelTransformerPath: require.resolve("./NativeTransformer"),
// };

// config.resolver = {
//   ...config.resolver,
//   assetExts: config.resolver.assetExts.filter(
//     (ext) => !["swift", "kt"].includes(ext)
//   ),
//   sourceExts: [...config.resolver.sourceExts, "swift", "kt"],
// };

// const { sync } = require("glob");

// const currentCustomize = config.symbolicator.customizeFrame.bind(
//   config.symbolicator.customizeFrame
// );

// function lineNumberByIndex(index, string) {
//   const re = /^[\S\s]/gm;
//   let line = 0,
//     match;
//   let lastRowIndex = 0;
//   while ((match = re.exec(string))) {
//     if (match.index > index) break;
//     lastRowIndex = match.index;
//     line++;
//   }
//   return [Math.max(line, 0), lastRowIndex];
// }

// const findOccurrences = (needle, haystack) => {
//   let match;
//   const result = [];
//   while ((match = needle.exec(haystack))) {
//     const pos = lineNumberByIndex(needle.lastIndex, haystack);

//     result.push({
//       match,
//       lineNumber: pos[0],
//       column: needle.lastIndex - pos[1] - match[1].length,
//     });
//   }
//   return result;
// };

// config.symbolicator = {
//   ...config.symbolicator,
//   customizeFrame: (frame) => {
//     frame = currentCustomize(frame);

//     if (frame.file && !frame.collapse) {
//       if (
//         (frame.file.endsWith(".swift") || frame.file.endsWith(".kt")) &&
//         // very fragile
//         frame.methodName === "Proxy$argument_1.get"
//       ) {
//         const src = fs.readFileSync(frame.file, "utf8");
//         const trigger = frame.file.endsWith(".swift") ? "Name" : "name";
//         const matches = findOccurrences(
//           new RegExp(`^\\s+${trigger}\\("([a-zA-Z0-9_-]+)"\\)$`, "gm"),
//           src
//         );

//         if (matches.length) {
//           frame.methodName = trigger;
//           frame.arguments = [matches[0].match[1]];
//           frame.lineNumber = matches[0].lineNumber;
//           frame.column = matches[0].column;
//         } else {
//           frame.lineNumber = 0;
//           frame.column = 0;
//           frame.collapse = true;
//         }
//       }
//     }

//     return frame;
//   },
// };

// config.server = {
//   ...config.server,
//   rewriteRequestUrl: (url) => {
//     try {
//       const parsed = new URL(url);
//       if (parsed.pathname.endsWith(".bundle")) {
//         // Try resolving up
//         const resolveName =
//           parsed.pathname.substring(1).split(".").slice(0, -1).join(".") + ".*";
//         const found = sync(resolveName, { cwd: path.join(__dirname, "..") });
//         if (found.length) {
//           parsed.pathname = "/.." + parsed.pathname;
//           const nextUrl =
//             parsed.origin + "/.." + parsed.pathname + parsed.search;
//           console.log("redirected ->", nextUrl);
//           return nextUrl;
//         }
//       }
//     } catch {}
//     return url;
//   },
// };
module.exports = config;
