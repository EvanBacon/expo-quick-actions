const upstreamTransformer = require("metro-react-native-babel-transformer");

// TODO: Would be cool to print out all available native modules
const template = (moduleName) => `
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

module.exports.transform = async ({ src, filename, options }) => {
  if (filename.endsWith(".swift")) {
    const matches = src.match(/^\s+Name\("([a-zA-Z0-9_-]+)"\)$/m);
    if (matches && matches.length > 1) {
      const moduleName = matches[1];
      // import { requireNativeViewManager } from 'expo-modules-core';
      src = [
        template(moduleName),
        `module.exports = { `,
        `  Module,`,
        /ViewManager\s{/.test(src) &&
          `  View: require('expo-modules-core').requireNativeViewManager("${moduleName}"),`,
        `}`,
      ]
        .filter(Boolean)
        .join("\n");
    } else {
      console.warn(
        'Failed to locate module name (ex: `Name("FooBar")`) in swift file: ' +
          filename
      );
      src = `
      console.warn('Failed to locate module name (ex: \`Name("FooBar")\`) in swift file: ${filename}');
      module.exports = { Module: null, View: null };`;
    }
  } else if (filename.endsWith(".kt")) {
    const matches = src.match(/^\s+name\("([a-zA-Z0-9_-]+)"\)$/m);
    if (matches && matches.length > 1) {
      const moduleName = matches[1];
      // import { requireNativeViewManager } from 'expo-modules-core';
      src = [
        template(moduleName),
        `module.exports = { `,
        `  Module,`,
        /viewManager\s{/.test(src) &&
          `  View: require('expo-modules-core').requireNativeViewManager("${moduleName}"),`,
        `}`,
      ]
        .filter(Boolean)
        .join("\n");
    } else {
      console.warn(
        'Failed to locate module name (ex: `name("FooBar")`) in Kotlin file: ' +
          filename
      );
      src = `
      console.warn('Failed to locate module name (ex: \`name("FooBar")\`) in Kotlin file: ${filename}');
      module.exports = { Module: null, View: null };`;
    }
  }
  return upstreamTransformer.transform({ src, filename, options });
};
