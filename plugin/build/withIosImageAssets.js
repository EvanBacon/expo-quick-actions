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
exports.withIosImageAsset = void 0;
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
            const iosNamedProjectRoot = (0, path_1.join)(projectRoot, cwd);
            const imgPath = `Assets.xcassets/${name}.imageset`;
            // Ensure the Images.xcassets/AppIcon.appiconset path exists
            await fs_1.default.promises.mkdir((0, path_1.join)(iosNamedProjectRoot, imgPath), {
                recursive: true,
            });
            const userDefinedIcon = typeof image === "string"
                ? { "1x": image, "2x": undefined, "3x": undefined }
                : image;
            // Finally, write the Config.json
            await writeContentsJsonAsync((0, path_1.join)(iosNamedProjectRoot, imgPath), {
                images: await generateResizedImageAsync(Object.fromEntries(Object.entries(userDefinedIcon).map(([key, value]) => [
                    key,
                    value?.match(/^[./]/) ? path_1.default.join(cwd, value) : value,
                ])), name, projectRoot, iosNamedProjectRoot, path_1.default.join(cwd, "gen-image", name)),
            });
            return config;
        },
    ]);
};
exports.withIosImageAsset = withIosImageAsset;
const IMAGE_CACHE_NAME = "quick-action-icons-";
async function generateResizedImageAsync(icon, name, projectRoot, iosNamedProjectRoot, cacheComponent) {
    // Store the image JSON data for assigning via the Contents.json
    const imagesJson = [];
    // If the user provided a single image, then assume it's the 3x image and generate the 1x and 2x images.
    //   const shouldResize = typeof icon === "string";
    const userDefinedIcon = typeof icon === "string"
        ? { "1x": icon, "2x": undefined, "3x": undefined }
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
            const assetPath = (0, path_1.join)(iosNamedProjectRoot, `Assets.xcassets/${name}.imageset`, filename);
            await fs_1.default.promises.writeFile(assetPath, source);
            if (filename) {
                imgEntry.filename = filename;
            }
        }
        imagesJson.push(imgEntry);
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
