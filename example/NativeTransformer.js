const upstreamTransformer = require("metro-react-native-babel-transformer");

// TODO: Would be cool to print out all available native modules
const template = (moduleName, { dev }) => {
  if (!dev) {
    // Drop all hints in production
    return `const Module = require('expo-modules-core').NativeModulesProxy["${moduleName}"]`;
  }

  return `
const LINKING_ERROR =
  \`The native module "${moduleName}" is not available in this app. Make sure: \\n\\n\` +
  Platform.select({ 
    ios: "- You have run 'npx expo run:ios'\\n", 
    android: "- You have run 'npx expo run:android'\\n", 
    default: '' 
  }) +
  '- You are not using Expo Go with a package that isn\\'t supported\\n';

const Module = require('expo-modules-core').NativeModulesProxy["${moduleName}"]
  ? require('expo-modules-core').NativeModulesProxy["${moduleName}"]
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );`;
};

const EMPTY_TEMPLATE = `module.exports = { Module: null, View: null };`;

const warnExpoSupport = (language, filename) => {
  console.warn(
    `Attempted to import a ${language} file that is not using ExpoModulesCore in your JavaScript. This is not supported because the native globals cannot be identified automatically. (file: ${filename})`
  );
};

const warnNativeModuleNameNotFound = (language, example, filename) => {
  console.warn(
    `Failed to locate the ${language} native module name. (ex: ${example}, file: ${filename})`
  );
};

function createTemplate(moduleName, hasViewManager, options) {
  return [
    template(moduleName, options),
    `export { Module }`,
    // Optionally append the view manager to the exports
    hasViewManager &&
      `export const View = require('expo-modules-core').requireNativeViewManager("${moduleName}")`,
  ]
    .filter(Boolean)
    .join("\n");
}

const fs = require("fs");
const path = require("path");

function collectModuleExports({ src }) {
  return [
    "initial: any;",
    "getInitial(): Promise<any>;",
    "isSupported(): Promise<boolean>;",
    "setItems(items?: any[]): Promise<void>;",
  ];
}

function generateTypes(moduleName, { src, filename, options }) {
  const { projectRoot } = options;

  const expoGenerated = path.join(projectRoot, ".expo/native-types");

  fs.mkdirSync(expoGenerated, { recursive: true });

  const contents = `
  export const Module: {
    ${collectModuleExports({ src }).join("\n  ")}
  };

  export const View = null;`;

  // TODO: Put this in the generated folder.
  const output = path.join(projectRoot, filename + ".d.ts");
  fs.writeFileSync(output, contents, "utf8");
}

function getProcessedSource({ src, filename, options }) {
  console.log("opts:", options);

  if (filename.endsWith(".swift")) {
    // Shim on Android and web
    if (options.platform !== "ios") {
      return EMPTY_TEMPLATE;
    }

    if (!/^import ExpoModulesCore/m.test(src)) {
      warnExpoSupport("Swift", filename);
      return EMPTY_TEMPLATE;
    }
    const matches = src.match(/^\s+Name\("([a-zA-Z0-9_-]+)"\)$/m);
    if (matches && matches.length > 1) {
      const moduleName = matches[1];
      // generateTypes(moduleName, {src, filename, options})

      return createTemplate(moduleName, !!/ViewManager\s{/.test(src), options);
    } else {
      warnNativeModuleNameNotFound("Swift", `Name("FooBar")`, filename);
      return EMPTY_TEMPLATE;
    }
  } else if (filename.endsWith(".kt")) {
    // Shim on iOS and web
    if (options.platform !== "android") {
      return EMPTY_TEMPLATE;
    }

    if (!/^import expo\.modules\.kotlin\.modules\.Module/m.test(src)) {
      warnExpoSupport("Kotlin", filename);
      return EMPTY_TEMPLATE;
    }

    const matches = src.match(/^\s+name\("([a-zA-Z0-9_-]+)"\)$/m);
    if (matches && matches.length > 1) {
      const moduleName = matches[1];
      return createTemplate(moduleName, !!/viewManager\s{/.test(src), options);
    } else {
      warnNativeModuleNameNotFound("Kotlin", `name("FooBar")`, filename);
      return EMPTY_TEMPLATE;
    }
  }
  return src;
}

module.exports.transform = async ({ src, filename, options }) => {
  src = getProcessedSource({ src, filename, options });
  return upstreamTransformer.transform({ src, filename, options });
};
