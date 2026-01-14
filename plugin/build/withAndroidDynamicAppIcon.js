"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withAndroidDynamicAppIcons = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const { getMainApplicationOrThrow, getMainActivityOrThrow } = config_plugins_1.AndroidConfig.Manifest;
// Import AdaptiveIcon type and withAndroidAppIcon from withAndroidAppIcon
const withAndroidAppIcon_1 = require("./withAndroidAppIcon");
const withAndroidDynamicAppIcons = (config, { icons }) => {
    // Use withAndroidAppIcon for each icon - it handles colors.xml and image generation
    Object.entries(icons).forEach(([iconName, iconSrc]) => {
        if (!iconSrc)
            return;
        config = (0, withAndroidAppIcon_1.withAndroidAppIcon)(config, {
            name: iconName,
            src: iconSrc,
        });
    });
    // Handle manifest changes (activity-alias creation) - unique to dynamic app icons
    withIconAndroidManifest(config, { icons });
    return config;
};
exports.withAndroidDynamicAppIcons = withAndroidDynamicAppIcons;
const withIconAndroidManifest = (config, { icons }) => {
    return (0, config_plugins_1.withAndroidManifest)(config, (config) => {
        const mainApplication = getMainApplicationOrThrow(config.modResults);
        const mainActivity = getMainActivityOrThrow(config.modResults);
        const iconNamePrefix = `${config.android.package}.MainActivity`;
        const iconNames = Object.keys(icons);
        function addIconActivityAlias(config) {
            return [
                ...config,
                ...iconNames.map((iconName) => {
                    const iconSrc = icons[iconName];
                    const isAdaptiveIcon = typeof iconSrc === "object" && iconSrc !== null;
                    const activityAliasAttributes = {
                        "android:name": `${iconNamePrefix}${iconName}`,
                        "android:enabled": "false",
                        "android:exported": "true",
                        "android:icon": `@mipmap/${iconName}`,
                        "android:targetActivity": ".MainActivity",
                    };
                    // Only add roundIcon if it's an AdaptiveIcon
                    if (isAdaptiveIcon) {
                        activityAliasAttributes["android:roundIcon"] =
                            `@mipmap/${iconName}_round`;
                    }
                    return {
                        $: activityAliasAttributes,
                        "intent-filter": [
                            ...(mainActivity["intent-filter"] || [
                                {
                                    action: [
                                        { $: { "android:name": "android.intent.action.MAIN" } },
                                    ],
                                    category: [
                                        {
                                            $: { "android:name": "android.intent.category.LAUNCHER" },
                                        },
                                    ],
                                },
                            ]),
                        ],
                    };
                }),
            ];
        }
        function removeIconActivityAlias(config) {
            return config.filter((activityAlias) => !activityAlias.$["android:name"].startsWith(iconNamePrefix));
        }
        mainApplication["activity-alias"] = removeIconActivityAlias(mainApplication["activity-alias"] || []);
        mainApplication["activity-alias"] = addIconActivityAlias(mainApplication["activity-alias"] || []);
        return config;
    });
};
