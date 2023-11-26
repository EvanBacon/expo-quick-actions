"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const withAndroidAppIcon_1 = require("./withAndroidAppIcon");
const withQuickActions = (config, props) => {
    for (const [, icon] of props.androidIcons.entries()) {
        config = (0, withAndroidAppIcon_1.withAndroidAppIcon)(config, icon);
    }
    return config;
};
module.exports = withQuickActions;
