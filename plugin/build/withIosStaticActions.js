"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withReactNativeQuickActions = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const remapping = {
    iconType: "UIApplicationShortcutItemIconType",
    iconFile: "UIApplicationShortcutItemIconFile",
    iconSymbolName: "UIApplicationShortcutItemIconSymbolName",
    title: "UIApplicationShortcutItemTitle",
    subtitle: "UIApplicationShortcutItemSubtitle",
    type: "UIApplicationShortcutItemType",
    params: "UIApplicationShortcutItemUserInfo",
};
// https://developer.apple.com/documentation/uikit/menus_and_shortcuts/add_home_screen_quick_actions
// TODO: Auto generate images in asset catalogues
// TODO: Use the magic prefix for icon names
const withReactNativeQuickActions = (config, _items) => {
    const items = _items || [];
    if (!Array.isArray(items) || !items.length) {
        return config;
    }
    return (0, config_plugins_1.withInfoPlist)(config, (config) => {
        config.modResults.UIApplicationShortcutItems = items.map((item) => {
            const result = {};
            for (const [key, value] of Object.entries(remapping)) {
                // @ts-expect-error
                const itemValue = item[key];
                if (itemValue) {
                    result[value] = itemValue;
                }
            }
            return result;
        });
        for (const index in config.modResults.UIApplicationShortcutItems) {
            const item = config.modResults.UIApplicationShortcutItems[index];
            for (const key of Object.keys(item)) {
                if (!item[key]) {
                    // @ts-expect-error
                    delete config.modResults.UIApplicationShortcutItems[index][key];
                }
            }
        }
        return config;
    });
};
exports.withReactNativeQuickActions = withReactNativeQuickActions;
