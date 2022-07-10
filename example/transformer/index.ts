// TODO: Would be cool to print out all available native modules
import { createTemplate, EMPTY_TEMPLATE } from "./templates";
import { Options } from "./transformer.types";
import { warnExpoSupport, warnNativeModuleNameNotFound } from "./warnings";

function getProcessedSource({ src, filename, options }: Options) {
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

/** Process input and transform to support native code. */
export function transform(props: Options): Options {
  props.src = getProcessedSource(props);
  return props;
}
