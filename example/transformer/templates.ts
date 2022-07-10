// TODO: Would be cool to print out all available native modules
import { Options } from "./transformer.types";

export const EMPTY_TEMPLATE = `module.exports = { Module: null, View: null };`;

const createModuleTemplate = (
  moduleName: string,
  { dev }: Options["options"]
): string => {
  if (dev !== true) {
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

export function createTemplate(
  moduleName: string,
  hasViewManager: boolean,
  options
) {
  return [
    createModuleTemplate(moduleName, options),
    `export { Module }`,
    // Optionally append the view manager to the exports
    hasViewManager &&
      `export const View = require('expo-modules-core').requireNativeViewManager("${moduleName}")`,
  ]
    .filter(Boolean)
    .join("\n");
}
