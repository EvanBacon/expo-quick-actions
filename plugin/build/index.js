"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const withAndroidAppIcon_1 = require("./withAndroidAppIcon");
const withIosImageAssets_1 = require("./withIosImageAssets");
const withQuickActions = (config, props) => {
    if (props.androidImages) {
        Object.entries(props.androidImages).forEach(([name, image]) => {
            config = (0, withAndroidAppIcon_1.withAndroidAppIcon)(config, {
                name,
                src: image,
            });
        });
    }
    if (props.iosImages) {
        Object.entries(props.iosImages).forEach(([name, image]) => {
            config = (0, withIosImageAssets_1.withIosImageAsset)(config, {
                name,
                src: image,
            });
        });
    }
    return config;
};
module.exports = withQuickActions;
