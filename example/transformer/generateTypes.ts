import fs from "fs";
import path from "path";

import { Options } from "./transformer.types";

function collectModuleExports({ src }: Pick<Options, "src">) {
  return [
    "initial: any;",
    "getInitial(): Promise<any>;",
    "isSupported(): Promise<boolean>;",
    "setItems(items?: any[]): Promise<void>;",
    "addListener: (eventType: string) => void;",
    "removeListeners: (count: number) => void;",
    "startObserving(): void;",
    "stopObserving(): void;",
  ];
}

export function generateTypes(
  moduleName: string,
  { src, filename, options }: Options
) {
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
