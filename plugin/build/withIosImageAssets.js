"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeContentsJsonAsync = exports.withIosIconImageAsset = exports.withIosImageAsset = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const image_utils_1 = require("@expo/image-utils");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importStar(require("path"));
const withIosImageAsset = (config, { name, src: image }) => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        "ios",
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;
            const cwd = config.modRequest.projectName;
            const iosNamedProjectRoot = (0, path_1.join)(config.modRequest.platformProjectRoot, config.modRequest.projectName);
            const imgPath = `Images.xcassets/${name}.imageset`;
            // Ensure the Images.xcassets/AppIcon.appiconset path exists
            await fs_1.default.promises.mkdir((0, path_1.join)(iosNamedProjectRoot, imgPath), {
                recursive: true,
            });
            // Finally, write the Config.json
            await writeContentsJsonAsync((0, path_1.join)(iosNamedProjectRoot, imgPath), {
                images: await generateResizedImageAsync(image, name, projectRoot, iosNamedProjectRoot, path_1.default.join(cwd, "gen-image", name), true),
            });
            return config;
        },
    ]);
};
exports.withIosImageAsset = withIosImageAsset;
const withIosIconImageAsset = (config, { name, icon }) => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        "ios",
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;
            const iosNamedProjectRoot = (0, path_1.join)(config.modRequest.platformProjectRoot, config.modRequest.projectName);
            const imgPath = `Images.xcassets/${name}.appiconset`;
            // Ensure the Images.xcassets/AppIcon.appiconset path exists
            await fs_1.default.promises.mkdir((0, path_1.join)(iosNamedProjectRoot, imgPath), {
                recursive: true,
            });
            const imagesJson = [];
            const baseIconPath = typeof icon === "object"
                ? icon?.light || icon?.dark || icon?.tinted
                : icon;
            // Store the image JSON data for assigning via the Contents.json
            const baseIcon = await generateUniversalIconAsync(projectRoot, imgPath, {
                icon: baseIconPath,
                cacheKey: "universal-icon",
                iosNamedProjectRoot,
                platform: "ios",
            });
            imagesJson.push(baseIcon);
            if (typeof icon === "object") {
                if (icon?.dark) {
                    const darkIcon = await generateUniversalIconAsync(projectRoot, imgPath, {
                        icon: icon.dark,
                        cacheKey: "universal-icon-dark",
                        iosNamedProjectRoot,
                        platform: "ios",
                        appearance: "dark",
                    });
                    imagesJson.push(darkIcon);
                }
                if (icon?.tinted) {
                    const tintedIcon = await generateUniversalIconAsync(projectRoot, imgPath, {
                        icon: icon.tinted,
                        cacheKey: "universal-icon-tinted",
                        iosNamedProjectRoot,
                        platform: "ios",
                        appearance: "tinted",
                    });
                    imagesJson.push(tintedIcon);
                }
            }
            // Finally, write the Contents.json
            await writeContentsJsonAsync((0, path_1.join)(iosNamedProjectRoot, imgPath), {
                images: imagesJson,
            });
            return config;
        },
    ]);
};
exports.withIosIconImageAsset = withIosIconImageAsset;
function getAppleIconName(size, scale, appearance) {
    let name = "App-Icon";
    if (appearance) {
        name = `${name}-${appearance}`;
    }
    name = `${name}-${size}x${size}@${scale}x.png`;
    return name;
}
async function generateUniversalIconAsync(projectRoot, imagesetPath, { icon, cacheKey, iosNamedProjectRoot, platform, appearance, }) {
    const size = 1024;
    const filename = getAppleIconName(size, 1, appearance);
    let source;
    if (icon) {
        // Using this method will cache the images in `.expo` based on the properties used to generate them.
        // this method also supports remote URLs and using the global sharp instance.
        source = (await (0, image_utils_1.generateImageAsync)({ projectRoot, cacheType: IMAGE_CACHE_NAME + cacheKey }, {
            src: icon,
            name: filename,
            width: size,
            height: size,
            // Transparency needs to be preserved in dark variant, but can safely be removed in "light" and "tinted" variants.
            removeTransparency: appearance !== "dark",
            // The icon should be square, but if it's not then it will be cropped.
            resizeMode: "cover",
            // Force the background color to solid white to prevent any transparency. (for "any" and "tinted" variants)
            // TODO: Maybe use a more adaptive option based on the icon color?
            backgroundColor: appearance !== "dark" ? "#ffffff" : undefined,
        })).source;
    }
    else {
        // Create a white square image if no icon exists to mitigate the chance of a submission failure to the app store.
        source = await (0, image_utils_1.createSquareAsync)({ size });
    }
    // Write image buffer to the file system.
    const assetPath = (0, path_1.join)(iosNamedProjectRoot, imagesetPath, filename);
    await fs_1.default.promises.writeFile(assetPath, source);
    return {
        filename,
        idiom: "universal",
        platform,
        size: `${size}x${size}`,
        ...(appearance
            ? { appearances: [{ appearance: "luminosity", value: appearance }] }
            : {}),
    };
}
const IMAGE_CACHE_NAME = "quick-action-icons-";
async function generateResizedImageAsync(icon, name, projectRoot, iosNamedProjectRoot, cacheComponent, downscaleMissing) {
    // Store the image JSON data for assigning via the Contents.json
    const imagesJson = [];
    // If the user provided a single image, then assume it's the 3x image and generate the 1x and 2x images.
    const shouldResize = downscaleMissing && typeof icon === "string";
    const userDefinedIcon = typeof icon === "string"
        ? {
            "1x": icon,
            "2x": undefined,
            "3x": undefined,
            //   "2x": shouldResize ? icon : undefined,
            //   "3x": shouldResize ? icon : undefined,
        }
        : icon;
    for (const icon of Object.entries(userDefinedIcon)) {
        const [scale, iconPath] = icon;
        const filename = `${scale}.png`;
        const imgEntry = {
            idiom: "universal",
            // @ts-ignore: template types not supported in TS yet
            scale,
        };
        if (iconPath) {
            // Using this method will cache the images in `.expo` based on the properties used to generate them.
            // this method also supports remote URLs and using the global sharp instance.
            const { source } = await (0, image_utils_1.generateImageAsync)({ projectRoot, cacheType: IMAGE_CACHE_NAME + cacheComponent }, 
            // @ts-expect-error
            {
                src: iconPath,
                name: filename,
            });
            // Write image buffer to the file system.
            const assetPath = (0, path_1.join)(iosNamedProjectRoot, `Images.xcassets/${name}.imageset`, filename);
            await fs_1.default.promises.writeFile(assetPath, source);
            if (filename) {
                imgEntry.filename = filename;
            }
        }
        imagesJson.push(imgEntry);
    }
    if (shouldResize) {
        let largestImage = imagesJson.find((image) => image.filename);
        imagesJson.map((image) => {
            if (!image.filename) {
                image.filename = largestImage?.filename;
            }
        });
    }
    return imagesJson;
}
/**
 * Writes the Config.json which is used to assign images to their respective platform, dpi, and idiom.
 *
 * @param directory path to add the Contents.json to.
 * @param contents image json data
 */
async function writeContentsJsonAsync(directory, { images }) {
    await fs_1.default.promises.mkdir(directory, { recursive: true });
    await fs_1.default.promises.writeFile((0, path_1.join)(directory, "Contents.json"), JSON.stringify({
        images,
        info: {
            version: 1,
            // common practice is for the tool that generated the icons to be the "author"
            author: "expo",
        },
    }, null, 2));
}
exports.writeContentsJsonAsync = writeContentsJsonAsync;
