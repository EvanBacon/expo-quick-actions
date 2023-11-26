"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withAndroidAppIcon = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const image_utils_1 = require("@expo/image-utils");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const { Colors } = config_plugins_1.AndroidConfig;
const dpiValues = {
    mdpi: { folderName: "mipmap-mdpi", scale: 1 },
    hdpi: { folderName: "mipmap-hdpi", scale: 1.5 },
    xhdpi: { folderName: "mipmap-xhdpi", scale: 2 },
    xxhdpi: { folderName: "mipmap-xxhdpi", scale: 3 },
    xxxhdpi: { folderName: "mipmap-xxxhdpi", scale: 4 },
};
const BASELINE_PIXEL_SIZE = 108;
const ANDROID_RES_PATH = "android/app/src/main/res/";
const MIPMAP_ANYDPI_V26 = "mipmap-anydpi-v26";
const withAndroidAppIcon = (config, props) => {
    const icon = typeof props.src === "string" ? props.src : props.src.foregroundImage;
    if (!icon) {
        return config;
    }
    const name = props.name; // ?? "ic_launcher";
    // NOTE: This is normally `iconBackground`
    const backgroundColorName = `${name}_background_color`;
    const backgroundColor = typeof props.src === "string" ? null : props.src.backgroundColor ?? null;
    const backgroundImage = typeof props.src === "string" ? null : props.src.backgroundImage ?? null;
    const monochromeImage = typeof props.src === "string" ? null : props.src.monochromeImage ?? null;
    const isAdaptive = typeof props.src !== "string";
    // Apply colors.xml changes
    (0, config_plugins_1.withAndroidColors)(config, (config) => {
        if (isAdaptive) {
            config.modResults = Colors.assignColorValue(config.modResults, {
                value: backgroundColor ?? "#FFFFFF",
                name: backgroundColorName,
            });
        }
        else {
            config.modResults = Colors.removeColorItem(backgroundColorName, config.modResults);
        }
        return config;
    });
    return (0, config_plugins_1.withDangerousMod)(config, [
        "android",
        async (config) => {
            await setIconAsync(config.modRequest.projectRoot, {
                icon,
                backgroundColor,
                backgroundImage,
                monochromeImage,
                isAdaptive,
                name,
                colorName: backgroundColorName,
                baselineSize: BASELINE_PIXEL_SIZE,
            });
            return config;
        },
    ]);
};
exports.withAndroidAppIcon = withAndroidAppIcon;
/**
 * Resizes the user-provided icon to create a set of legacy icon files in
 * their respective "mipmap" directories for <= Android 7, and creates a set of adaptive
 * icon files for > Android 7 from the adaptive icon files (if provided).
 */
async function setIconAsync(projectRoot, { icon, backgroundColor, backgroundImage, monochromeImage, isAdaptive, name, colorName, baselineSize, }) {
    if (!icon) {
        return null;
    }
    await configureLegacyIconAsync(projectRoot, icon, backgroundImage, backgroundColor, name, baselineSize);
    const roundName = `${name}_round.png`;
    if (isAdaptive) {
        await generateMultiLayerImageAsync(projectRoot, {
            icon,
            baselineSize,
            borderRadiusRatio: 0.5,
            outputImageFileName: roundName,
            backgroundImage,
            backgroundColor,
            imageCacheFolder: name + "-android-standard-circle",
            backgroundImageCacheFolder: name + "-android-standard-round-background",
        });
    }
    else {
        await deleteIconNamedAsync(projectRoot, roundName);
    }
    await configureAdaptiveIconAsync(projectRoot, icon, backgroundImage, monochromeImage, isAdaptive, {
        name,
        colorName: colorName,
        baselineSize,
    });
    return true;
}
/**
 * Configures legacy icon files to be used on Android 7 and earlier. If adaptive icon configuration
 * was provided, we create a pseudo-adaptive icon by layering the provided files (or background
 * color if no backgroundImage is provided. If no backgroundImage and no backgroundColor are provided,
 * the background is set to transparent.)
 */
async function configureLegacyIconAsync(projectRoot, icon, backgroundImage, backgroundColor, name, baselineSize) {
    return generateMultiLayerImageAsync(projectRoot, {
        icon,
        backgroundImage,
        backgroundColor,
        outputImageFileName: `${name}.png`,
        imageCacheFolder: name + "-android-standard-square",
        backgroundImageCacheFolder: name + "-android-standard-square-background",
        baselineSize,
    });
}
/**
 * Configures adaptive icon files to be used on Android 8 and up. A foreground image must be provided,
 * and will have a transparent background unless:
 * - A backgroundImage is provided, or
 * - A backgroundColor was specified
 */
async function configureAdaptiveIconAsync(projectRoot, foregroundImage, backgroundImage, monochromeImage, isAdaptive, { name, colorName, baselineSize, }) {
    if (monochromeImage) {
        await generateMonochromeImageAsync(projectRoot, {
            icon: monochromeImage,
            imageCacheFolder: name + "-android-adaptive-monochrome",
            outputImageFileName: `${name}_monochrome.png`,
            baselineSize,
        });
    }
    await generateMultiLayerImageAsync(projectRoot, {
        baselineSize,
        backgroundColor: "transparent",
        backgroundImage,
        backgroundImageCacheFolder: name + "-android-adaptive-background",
        outputImageFileName: `${name}_foreground.png`,
        icon: foregroundImage,
        imageCacheFolder: name + "-android-adaptive-foreground",
        backgroundImageFileName: `${name}_background.png`,
    });
    // create ic_launcher.xml and ic_launcher_round.xml
    const icLauncherXmlString = createAdaptiveIconXmlString(backgroundImage, monochromeImage, {
        name,
        colorName: colorName,
    });
    await createAdaptiveIconXmlFiles(projectRoot, icLauncherXmlString, name, 
    // If the user only defined icon and not android.adaptiveIcon, then skip enabling the layering system
    // this will scale the image down and present it uncropped.
    isAdaptive);
}
const createAdaptiveIconXmlString = (backgroundImage, monochromeImage, { name, colorName, }) => {
    const background = backgroundImage
        ? `@mipmap/${name}_background`
        : `@color/${colorName}`;
    const iconElements = [
        `<background android:drawable="${background}"/>`,
        `<foreground android:drawable="@mipmap/${name}_foreground"/>`,
    ];
    if (monochromeImage) {
        iconElements.push(`<monochrome android:drawable="@mipmap/${name}_monochrome"/>`);
    }
    return `<?xml version="1.0" encoding="utf-8"?>
  <adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
      ${iconElements.join("\n    ")}
  </adaptive-icon>`;
};
async function createAdaptiveIconXmlFiles(projectRoot, icLauncherXmlString, name, add) {
    const anyDpiV26Directory = path_1.default.resolve(projectRoot, ANDROID_RES_PATH, MIPMAP_ANYDPI_V26);
    await fs_1.default.promises.mkdir(anyDpiV26Directory, { recursive: true });
    const launcherPath = path_1.default.resolve(anyDpiV26Directory, `${name}.xml`);
    const launcherRoundPath = path_1.default.resolve(anyDpiV26Directory, `${name}_round.xml`
    // IC_LAUNCHER_ROUND_XML
    );
    if (add) {
        await Promise.all([
            fs_1.default.promises.writeFile(launcherPath, icLauncherXmlString),
            fs_1.default.promises.writeFile(launcherRoundPath, icLauncherXmlString),
        ]);
    }
    else {
        // Remove the xml if the icon switches from adaptive to standard.
        await Promise.all([launcherPath, launcherRoundPath].map((path) => remove(path)));
    }
}
async function generateMultiLayerImageAsync(projectRoot, { icon, backgroundColor, backgroundImage, imageCacheFolder, backgroundImageCacheFolder, borderRadiusRatio, outputImageFileName, backgroundImageFileName, baselineSize, }) {
    await iterateDpiValues(projectRoot, async ({ dpiFolder, scale }) => {
        let iconLayer = await generateIconAsync(projectRoot, {
            baseSize: baselineSize,
            cacheType: imageCacheFolder,
            src: icon,
            scale,
            // backgroundImage overrides backgroundColor
            backgroundColor: backgroundImage
                ? "transparent"
                : backgroundColor ?? "transparent",
            borderRadiusRatio,
        });
        if (backgroundImage) {
            const backgroundLayer = await generateIconAsync(projectRoot, {
                baseSize: baselineSize,
                cacheType: backgroundImageCacheFolder,
                src: backgroundImage,
                scale,
                backgroundColor: "transparent",
                borderRadiusRatio,
            });
            if (backgroundImageFileName) {
                await fs_1.default.promises.writeFile(path_1.default.resolve(dpiFolder, backgroundImageFileName), backgroundLayer);
            }
            else {
                iconLayer = await (0, image_utils_1.compositeImagesAsync)({
                    foreground: iconLayer,
                    background: backgroundLayer,
                });
            }
        }
        else if (backgroundImageFileName) {
            // Remove any instances of ic_launcher_background.png that are there from previous icons
            await deleteIconNamedAsync(projectRoot, backgroundImageFileName);
        }
        await fs_1.default.promises.mkdir(dpiFolder, { recursive: true });
        await fs_1.default.promises.writeFile(path_1.default.resolve(dpiFolder, outputImageFileName), iconLayer);
    });
}
async function generateMonochromeImageAsync(projectRoot, { icon, imageCacheFolder, outputImageFileName, baselineSize, }) {
    await iterateDpiValues(projectRoot, async ({ dpiFolder, scale }) => {
        const monochromeIcon = await generateIconAsync(projectRoot, {
            baseSize: baselineSize,
            cacheType: imageCacheFolder,
            src: icon,
            scale,
            backgroundColor: "transparent",
        });
        await fs_1.default.promises.mkdir(dpiFolder, { recursive: true });
        await fs_1.default.promises.writeFile(path_1.default.resolve(dpiFolder, outputImageFileName), monochromeIcon);
    });
}
function iterateDpiValues(projectRoot, callback) {
    return Promise.all(Object.values(dpiValues).map((value) => callback({
        dpiFolder: path_1.default.resolve(projectRoot, ANDROID_RES_PATH, value.folderName),
        ...value,
    })));
}
async function deleteIconNamedAsync(projectRoot, name) {
    return iterateDpiValues(projectRoot, ({ dpiFolder }) => {
        return remove(path_1.default.resolve(dpiFolder, name));
    });
}
async function remove(p) {
    if (fs_1.default.existsSync(p)) {
        return fs_1.default.promises.unlink(p);
    }
}
async function generateIconAsync(projectRoot, { cacheType, src, scale, backgroundColor, borderRadiusRatio, baseSize, }) {
    const iconSizePx = baseSize * scale;
    return (await (0, image_utils_1.generateImageAsync)({ projectRoot, cacheType }, {
        src,
        width: iconSizePx,
        height: iconSizePx,
        resizeMode: "cover",
        backgroundColor,
        borderRadius: borderRadiusRatio
            ? iconSizePx * borderRadiusRatio
            : undefined,
    })).source;
}
