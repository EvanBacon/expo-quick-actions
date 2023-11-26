"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withIosStaticQuickActions = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const remapping = {
    title: "UIApplicationShortcutItemTitle",
    subtitle: "UIApplicationShortcutItemSubtitle",
    id: "UIApplicationShortcutItemType",
    params: "UIApplicationShortcutItemUserInfo",
};
// Keep in sync with the Swift code.
const builtInIcons = {
    compose: "UIApplicationShortcutIconTypeCompose",
    play: "UIApplicationShortcutIconTypePlay",
    pause: "UIApplicationShortcutIconTypePause",
    add: "UIApplicationShortcutIconTypeAdd",
    location: "UIApplicationShortcutIconTypeLocation",
    search: "UIApplicationShortcutIconTypeSearch",
    share: "UIApplicationShortcutIconTypeShare",
    prohibit: "UIApplicationShortcutIconTypeProhibit",
    contact: "UIApplicationShortcutIconTypeContact",
    home: "UIApplicationShortcutIconTypeHome",
    markLocation: "UIApplicationShortcutIconTypeMarkLocation",
    favorite: "UIApplicationShortcutIconTypeFavorite",
    love: "UIApplicationShortcutIconTypeLove",
    cloud: "UIApplicationShortcutIconTypeCloud",
    invitation: "UIApplicationShortcutIconTypeInvitation",
    confirmation: "UIApplicationShortcutIconTypeConfirmation",
    mail: "UIApplicationShortcutIconTypeMail",
    message: "UIApplicationShortcutIconTypeMessage",
    date: "UIApplicationShortcutIconTypeDate",
    time: "UIApplicationShortcutIconTypeTime",
    capturePhoto: "UIApplicationShortcutIconTypeCapturePhoto",
    captureVideo: "UIApplicationShortcutIconTypeCaptureVideo",
    task: "UIApplicationShortcutIconTypeTask",
    taskCompleted: "UIApplicationShortcutIconTypeTaskCompleted",
    alarm: "UIApplicationShortcutIconTypeAlarm",
    bookmark: "UIApplicationShortcutIconTypeBookmark",
    shuffle: "UIApplicationShortcutIconTypeShuffle",
    audio: "UIApplicationShortcutIconTypeAudio",
    update: "UIApplicationShortcutIconTypeUpdate",
};
function resolveImage(image) {
    if (!image) {
        return;
    }
    if (image.startsWith("symbol:")) {
        return [
            "UIApplicationShortcutItemIconSymbolName",
            image.replace(/^symbol:/, ""),
        ];
    }
    const builtIn = builtInIcons[image];
    if (builtIn) {
        return ["UIApplicationShortcutItemIconType", builtIn];
    }
    return ["UIApplicationShortcutItemIconFile", image.replace(/^asset:/, "")];
}
// https://developer.apple.com/documentation/uikit/menus_and_shortcuts/add_home_screen_quick_actions
const withIosStaticQuickActions = (config, _items) => {
    const items = _items || [];
    if (!Array.isArray(items) || !items.length) {
        return config;
    }
    return (0, config_plugins_1.withInfoPlist)(config, (config) => {
        config.modResults.UIApplicationShortcutItems = items.map(({ icon, ...item }) => {
            const result = {};
            for (const [key, value] of Object.entries(remapping)) {
                // @ts-expect-error
                const itemValue = item[key];
                if (itemValue) {
                    result[value] = itemValue;
                }
            }
            const imgProps = resolveImage(icon);
            if (imgProps) {
                const [key, value] = imgProps;
                result[key] = value;
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
exports.withIosStaticQuickActions = withIosStaticQuickActions;
