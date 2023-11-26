"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withAndroidStaticActions = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const withShortcutsXML_1 = require("./withShortcutsXML");
// This should never change and must match the Kotlin version.
const UNIQUE_ID = "expo.modules.quickactions.SHORTCUT";
// https://developer.android.com/guide/app-actions/action-schema#overview
const withAndroidStaticActions = (config, _items) => {
    const items = _items || [];
    if (!Array.isArray(items) || !items.length) {
        return config;
    }
    (0, withShortcutsXML_1.withShortcutsXml)(config, (config) => {
        // if (!config.modResults.shortcuts.shortcut) {
        // }
        config.modResults.shortcuts.shortcut = [];
        for (const item of items) {
            const shortcut = {
                $: {
                    "android:shortcutId": item.id,
                    "android:enabled": "true",
                    "android:icon": item.icon,
                    "android:shortcutShortLabel": item.title,
                    "android:shortcutLongLabel": item.title,
                },
                intent: [
                    {
                        $: {
                            "android:action": UNIQUE_ID,
                            "android:targetPackage": "${applicationId}",
                            "android:targetClass": "${applicationId}.MainActivity",
                        },
                        extra: [
                            // <extra android:name="EXTRA_KEY_2" android:value="ExtraValue2" />
                            {
                                $: {
                                    "android:key": "requiredForegroundActivity",
                                    "android:value": "${applicationId}/${applicationId}.MainActivity",
                                },
                            },
                            // TODO: We probably need to restructure the runtime format to support string-only values.
                            // Maybe convert params to `params.href`, etc. and recreate later.
                            {
                                $: {
                                    "android:name": "shortcut_data",
                                    "android:value": JSON.stringify(item.params),
                                },
                            },
                        ],
                    },
                ],
            };
            config.modResults.shortcuts.shortcut.push(shortcut);
        }
        return config;
    });
    // Link shortcuts.xml
    (0, config_plugins_1.withAndroidManifest)(config, (config) => {
        const activity = config_plugins_1.AndroidConfig.Manifest.getMainActivityOrThrow(config.modResults);
        config_plugins_1.AndroidConfig.Manifest.addMetaDataItemToMainApplication(activity, "android.app.shortcuts", "@xml/shortcuts", "resource");
        return config;
    });
    return config;
};
exports.withAndroidStaticActions = withAndroidStaticActions;
