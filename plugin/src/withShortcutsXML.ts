import {
  BaseMods,
  ConfigPlugin,
  Mod,
  XML,
  withMod,
  createRunOncePlugin,
} from "@expo/config-plugins";
import path from "path";
import { getResourceFolderAsync } from "@expo/config-plugins/build/android/Paths";

export type ShortcutItemXML = {
  $: {
    /** e.g. "id1" */
    "android:shortcutId": string;
    /** e.g. "true" */
    "android:enabled": string;
    /** e.g. "@drawable/ic_shortcut" */
    "android:icon"?: string;
    /** e.g. "@string/shortcut_short_label1" */
    "android:shortcutShortLabel": string;
    /** e.g. "@string/shortcut_long_label1" */
    "android:shortcutLongLabel": string;
    /** e.g. "@string/shortcut_disabled_message1"> */
    "android:shortcutDisabledMessage"?: string;
  };
  intent?: {}[];
};

export type ShortcutsXML = {
  shortcuts: {
    $?: {
      "xmlns:tools"?: string;
    };
    shortcut?: ShortcutItemXML[];
  };
};

const customModName = "shortcuts";

export const withShortcutsXml: ConfigPlugin<Mod<ShortcutsXML>> = (
  config,
  action
) => {
  return withMod(config, {
    platform: "android",
    mod: customModName,
    action,
  });
};

const fallbackResourceString = `<?xml version="1.0" encoding="utf-8"?><shortcuts xmlns:android="http://schemas.android.com/apk/res/android"></shortcuts>`;

const withShortcutsXMLBaseModInternal: ConfigPlugin = (config) => {
  return BaseMods.withGeneratedBaseMods(config, {
    platform: "android",
    saveToInternal: true,
    skipEmptyMod: false,
    providers: {
      [customModName]: BaseMods.provider<ShortcutsXML>({
        isIntrospective: true,
        async getFilePath({ modRequest, _internal }) {
          try {
            return path.join(
              path.dirname(
                await getResourceFolderAsync(_internal!.projectRoot)
              ),
              "xml/shortcuts.xml"
            );
          } catch (error) {
            if (!modRequest.introspect) {
              throw error;
            }
          }
          return "";
        },
        async read(filePath, { modRequest }) {
          try {
            return (await XML.readXMLAsync({
              path: filePath,
              fallback: fallbackResourceString,
            })) as ShortcutsXML;
          } catch (error) {
            if (!modRequest.introspect) {
              throw error;
            }
          }
          return { shortcuts: {} };
        },
        async write(filePath, { modResults, modRequest: { introspect } }) {
          if (introspect) return;
          await XML.writeXMLAsync({ path: filePath, xml: modResults });
        },
      }),
    },
  });
};

export const withShortcutsXMLBaseMod = createRunOncePlugin(
  withShortcutsXMLBaseModInternal,
  "withShortcutsXMLBaseMod"
);
