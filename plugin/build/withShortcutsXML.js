"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withShortcutsXMLBaseMod = exports.withShortcutsXml = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const path_1 = __importDefault(require("path"));
const Paths_1 = require("@expo/config-plugins/build/android/Paths");
const customModName = "shortcuts";
const withShortcutsXml = (config, action) => {
    return (0, config_plugins_1.withMod)(config, {
        platform: "android",
        mod: customModName,
        action,
    });
};
exports.withShortcutsXml = withShortcutsXml;
const fallbackResourceString = `<?xml version="1.0" encoding="utf-8"?><shortcuts xmlns:android="http://schemas.android.com/apk/res/android"></shortcuts>`;
const withShortcutsXMLBaseModInternal = (config) => {
    return config_plugins_1.BaseMods.withGeneratedBaseMods(config, {
        platform: "android",
        saveToInternal: true,
        skipEmptyMod: false,
        providers: {
            [customModName]: config_plugins_1.BaseMods.provider({
                isIntrospective: true,
                async getFilePath({ modRequest, _internal }) {
                    try {
                        return path_1.default.join(path_1.default.dirname(await (0, Paths_1.getResourceFolderAsync)(_internal.projectRoot)), "xml/shortcuts.xml");
                    }
                    catch (error) {
                        if (!modRequest.introspect) {
                            throw error;
                        }
                    }
                    return "";
                },
                async read(filePath, { modRequest }) {
                    try {
                        return (await config_plugins_1.XML.readXMLAsync({
                            path: filePath,
                            fallback: fallbackResourceString,
                        }));
                    }
                    catch (error) {
                        if (!modRequest.introspect) {
                            throw error;
                        }
                    }
                    return { shortcuts: {} };
                },
                async write(filePath, { modResults, modRequest: { introspect } }) {
                    if (introspect)
                        return;
                    await config_plugins_1.XML.writeXMLAsync({ path: filePath, xml: modResults });
                },
            }),
        },
    });
};
exports.withShortcutsXMLBaseMod = (0, config_plugins_1.createRunOncePlugin)(withShortcutsXMLBaseModInternal, "withShortcutsXMLBaseMod");
