"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const withAndroidAppIcon_1 = require("./withAndroidAppIcon");
const withIosImageAssets_1 = require("./withIosImageAssets");
const withIosStaticActions_1 = require("./withIosStaticActions");
// import { withShortcutsXMLBaseMod } from "./withShortcutsXML";
// import { withAndroidStaticActions } from "./withAndroidStaticActions";
const schema_utils_1 = require("schema-utils");
const options_json_1 = __importDefault(require("./options.json"));
const withQuickActions = (config, props) => {
    // Support for `npx expo install` adding the plugin without any props.
    if (!props) {
        return config;
    }
    (0, schema_utils_1.validate)(options_json_1.default, props);
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
    //   if (props.androidActions) {
    //       withAndroidStaticActions(config, props.androidActions);
    //       // Run last
    //       withShortcutsXMLBaseMod(config);
    //   }
    return config;
};
module.exports = withQuickActions;
