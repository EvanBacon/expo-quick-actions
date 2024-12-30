"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withAndroidDynamicAppIcons = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const image_utils_1 = require("@expo/image-utils");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const { getMainApplicationOrThrow, getMainActivityOrThrow } = config_plugins_1.AndroidConfig.Manifest;
const ANDROID_FOLDER_PATH = ["app", "src", "main", "res"];
const ANDROID_MIPMAP_NAMES = [
    "mipmap-hdpi",
    "mipmap-mdpi",
    "mipmap-xhdpi",
    "mipmap-xxhdpi",
    "mipmap-xxxhdpi",
];
const ANDROID_DRAWABLE_NAMES = ["drawable-anydpi-v24"];
const ANDROID_SIZES = [162, 108, 216, 324, 432];
const withAndroidDynamicAppIcons = (config, { icons }) => {
    withIconAndroidManifest(config, { icons });
    withIconAndroidImages(config, { icons });
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
                ...iconNames.map((iconName) => ({
                    $: {
                        "android:name": `${iconNamePrefix}${iconName}`,
                        "android:enabled": "false",
                        "android:exported": "true",
                        "android:icon": `@mipmap/${iconName}`,
                        "android:targetActivity": ".MainActivity",
                        "android:roundIcon": `@mipmap/${iconName}_round`,
                    },
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
                })),
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
const withIconAndroidImages = (config, { icons }) => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        "android",
        async (config) => {
            const androidResPath = path_1.default.join(config.modRequest.platformProjectRoot, ...ANDROID_FOLDER_PATH);
            const addIconRes = async (folders, round) => {
                for (let i = 0; i < folders.length; i++) {
                    const size = ANDROID_SIZES[i];
                    const outputPath = path_1.default.join(androidResPath, folders[i]);
                    await fs_1.default.promises.mkdir(outputPath, { recursive: true });
                    // square ones
                    for (const [name, image] of Object.entries(icons)) {
                        if (!image)
                            continue;
                        const fileName = `${name}.png`;
                        const { source } = await (0, image_utils_1.generateImageAsync)({
                            projectRoot: config.modRequest.projectRoot,
                            cacheType: `expo-dynamic-app-icon-${size}`,
                        }, {
                            name: fileName,
                            src: image,
                            removeTransparency: true,
                            backgroundColor: "#ffffff",
                            resizeMode: "cover",
                            width: size,
                            height: size,
                        });
                        await fs_1.default.promises.writeFile(path_1.default.join(outputPath, fileName), source);
                    }
                    if (round) {
                        // round ones
                        for (const [name, image] of Object.entries(icons)) {
                            if (!image)
                                continue;
                            const fileName = `${name}_round.png`;
                            const { source } = await (0, image_utils_1.generateImageAsync)({
                                projectRoot: config.modRequest.projectRoot,
                                cacheType: `expo-dynamic-app-icon-round-${size}`,
                            }, {
                                name: fileName,
                                src: image,
                                removeTransparency: true,
                                backgroundColor: "#ffffff",
                                resizeMode: "cover",
                                width: size,
                                height: size,
                                borderRadius: size / 2,
                            });
                            await fs_1.default.promises.writeFile(path_1.default.join(outputPath, fileName), source);
                        }
                    }
                }
            };
            // Remove and add icons for mipmap folders
            await addIconRes(ANDROID_MIPMAP_NAMES, true);
            // Also remove and add icons for drawable folders
            await addIconRes(ANDROID_DRAWABLE_NAMES, false);
            return config;
        },
    ]);
};
