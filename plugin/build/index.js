"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const withAndroidAppIcon_1 = require("./withAndroidAppIcon");
const withIosImageAssets_1 = require("./withIosImageAssets");
const withIosStaticActions_1 = require("./withIosStaticActions");
const withQuickActions = (config, props) => {
    if (props.androidIcons) {
        Object.entries(props.androidIcons).forEach(([name, image]) => {
            config = (0, withAndroidAppIcon_1.withAndroidAppIcon)(config, {
                name,
                src: image,
            });
        });
    }
    if (props.iosIcons) {
        Object.entries(props.iosIcons).forEach(([name, image]) => {
            config = (0, withIosImageAssets_1.withIosImageAsset)(config, {
                name,
                src: image,
            });
        });
    }
    if (props.iosActions) {
        config = (0, withIosStaticActions_1.withIosStaticQuickActions)(config, props.iosActions);
    }
    return config;
};
module.exports = withQuickActions;
