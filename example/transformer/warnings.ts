// TODO: Would be cool to print out all available native modules
export function warnExpoSupport(language: string, filename: string): void {
  console.warn(
    `Attempted to import a ${language} file that is not using ExpoModulesCore in your JavaScript. This is not supported because the native globals cannot be identified automatically. (file: ${filename})`
  );
}

export function warnNativeModuleNameNotFound(
  language: string,
  example: string,
  filename: string
): void {
  console.warn(
    `Failed to locate the ${language} native module name. (ex: ${example}, file: ${filename})`
  );
}
