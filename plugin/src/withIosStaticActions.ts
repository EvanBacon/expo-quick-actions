import { ConfigPlugin, withInfoPlist, XML } from "@expo/config-plugins";

const remapping = {
  iconType: "UIApplicationShortcutItemIconType",
  iconFile: "UIApplicationShortcutItemIconFile",
  iconSymbolName: "UIApplicationShortcutItemIconSymbolName",
  title: "UIApplicationShortcutItemTitle",
  subtitle: "UIApplicationShortcutItemSubtitle",
  type: "UIApplicationShortcutItemType",
  params: "UIApplicationShortcutItemUserInfo",
};

// https://developer.apple.com/documentation/uikit/menus_and_shortcuts/add_home_screen_quick_actions
// TODO: Auto generate images in asset catalogues
// TODO: Use the magic prefix for icon names
export const withReactNativeQuickActions: ConfigPlugin<
  | void
  | {
      // https://github.com/jordanbyron/react-native-quick-actions/blob/d94a7319e70dc0b7f882b8cd573b04ad3463d87b/RNQuickAction/RNQuickAction/RNQuickActionManager.m#L69-L99
      iconType?: "UIApplicationShortcutIconTypeLocation" | string;
      title: string;
      // UIApplicationShortcutItemIconSymbolName
      iconSymbolName?: "square.stack.3d.up" | string;
      iconFile?: string;
      subtitle?: string;
      /**
       * A unique string that the system passes to your app
       */
      type: string;
      /**
       * An optional, app-defined dictionary. One use for this dictionary is to provide app version information, as described in the “App Launch and App Update Considerations for Quick Actions” section of the overview in UIApplicationShortcutItem Class Reference.
       */
      params?: XML.XMLObject;
    }[]
> = (config, _items) => {
  const items = _items || [];

  if (!Array.isArray(items) || !items.length) {
    return config;
  }

  return withInfoPlist(config, (config) => {
    config.modResults.UIApplicationShortcutItems = items.map((item) => {
      const result: Record<string, string> = {};

      for (const [key, value] of Object.entries(remapping)) {
        // @ts-expect-error
        const itemValue = item[key];
        if (itemValue) {
          result[value] = itemValue;
        }
      }

      return result;
    });

    for (const index in config.modResults.UIApplicationShortcutItems) {
      const item = config.modResults.UIApplicationShortcutItems[
        index
      ] as Record<string, any>;
      for (const key of Object.keys(item)) {
        if (!item[key]) {
          // @ts-expect-error
          delete config.modResults.UIApplicationShortcutItems[index][key];
        }
      }
    }

    return config;
  });
};
