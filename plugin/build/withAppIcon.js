"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const withAndroidDynamicAppIcon_1 = require("./withAndroidDynamicAppIcon");
const withIosImageAssets_1 = require("./withIosImageAssets");
const withDynamicIcon = (config, props = {}) => {
    const icons = resolveIcons(props);
    // TODO: More sensible android options and some way to add platform specific icons.
    (0, withAndroidDynamicAppIcon_1.withAndroidDynamicAppIcons)(config, {
        icons: Object.fromEntries(Object.entries(icons).map(([key, value]) => {
            // Must start with letter on Android.
            const iconName = `expo_ic_${key}`;
            // Pass through AdaptiveIcon if provided, otherwise extract string or IOSIcons
            if (typeof value.image === "string") {
                return [iconName, value.image];
            }
            else if ("light" in value.image) {
                // This is IOSIcons, extract light for Android
                return [iconName, value.image.light];
            }
            else {
                // This is AdaptiveIcon, pass through
                return [iconName, value.image];
            }
        })),
    });
    for (const [key, value] of Object.entries(icons)) {
        // Handle AdaptiveIcon by extracting foregroundImage for iOS
        let iosIcon;
        if (typeof value.image === "string") {
            iosIcon = value.image;
        }
        else if ("light" in value.image) {
            // This is IOSIcons, pass through
            iosIcon = value.image;
        }
        else {
            // This is AdaptiveIcon, extract foregroundImage
            iosIcon = value.image.foregroundImage;
        }
        config = (0, withIosImageAssets_1.withIosIconImageAsset)(config, {
            name: `expo_ic_${key}`,
            icon: iosIcon,
        });
    }
    config = withIconXcodeProject(config, Object.keys(icons).map((key) => `expo_ic_${key}`));
    return config;
};
const withIconXcodeProject = (config, icons) => {
    return (0, config_plugins_1.withXcodeProject)(config, async (config) => {
        // 1. Set the build settings for the main target
        const targets = config_plugins_1.IOSConfig.Target.findSignableTargets(config.modResults);
        const iconNames = JSON.stringify(icons.join(" "));
        for (const [, nativeTarget] of targets) {
            config_plugins_1.IOSConfig.XcodeUtils.getBuildConfigurationsForListId(config.modResults, nativeTarget.buildConfigurationList)
                .filter(([, item]) => item.buildSettings?.ASSETCATALOG_COMPILER_APPICON_NAME)
                .forEach(([, item]) => {
                item.buildSettings.ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS =
                    "YES";
                item.buildSettings.ASSETCATALOG_COMPILER_ALTERNATE_APPICON_NAMES =
                    iconNames;
            });
        }
        return config;
    });
};
/** Resolve and sanitize the icon set from config plugin props. */
function resolveIcons(props) {
    let icons = {};
    if (Array.isArray(props)) {
        icons = props.reduce((prev, curr, i) => ({ ...prev, [i]: { image: curr } }), {});
    }
    else if (props) {
        icons = props;
    }
    return icons;
}
exports.default = withDynamicIcon;
