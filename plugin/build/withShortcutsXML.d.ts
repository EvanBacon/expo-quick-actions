import { ConfigPlugin, Mod } from "@expo/config-plugins";
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
export declare const withShortcutsXml: ConfigPlugin<Mod<ShortcutsXML>>;
export declare const withShortcutsXMLBaseMod: ConfigPlugin<void>;
