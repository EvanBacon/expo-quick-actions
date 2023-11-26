"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const withAndroidAppIcon_1 = require("./withAndroidAppIcon");
const withIosImageAssets_1 = require("./withIosImageAssets");
const withQuickActions = (config, props) => {
    props.androidIcons?.forEach((icon) => {
        config = (0, withAndroidAppIcon_1.withAndroidAppIcon)(config, icon);
    });
    props.iosImages?.forEach((image) => {
        config = (0, withIosImageAssets_1.withIosImageAsset)(config, image);
    });
    return config;
};
module.exports = withQuickActions;
