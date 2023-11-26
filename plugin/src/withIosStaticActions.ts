import { ConfigPlugin, withInfoPlist, XML } from "@expo/config-plugins";

const remapping = {
  title: "UIApplicationShortcutItemTitle",
  subtitle: "UIApplicationShortcutItemSubtitle",
  id: "UIApplicationShortcutItemType",
  params: "UIApplicationShortcutItemUserInfo",
};

// Keep in sync with the Swift code.
const builtInIcons: Record<string, string> = {
  compose: "UIApplicationShortcutIconTypeCompose",
  play: "UIApplicationShortcutIconTypePlay",
  pause: "UIApplicationShortcutIconTypePause",
  add: "UIApplicationShortcutIconTypeAdd",
  location: "UIApplicationShortcutIconTypeLocation",
  search: "UIApplicationShortcutIconTypeSearch",
  share: "UIApplicationShortcutIconTypeShare",
  prohibit: "UIApplicationShortcutIconTypeProhibit",
  contact: "UIApplicationShortcutIconTypeContact",
  home: "UIApplicationShortcutIconTypeHome",
  markLocation: "UIApplicationShortcutIconTypeMarkLocation",
  favorite: "UIApplicationShortcutIconTypeFavorite",
  love: "UIApplicationShortcutIconTypeLove",
  cloud: "UIApplicationShortcutIconTypeCloud",
  invitation: "UIApplicationShortcutIconTypeInvitation",
  confirmation: "UIApplicationShortcutIconTypeConfirmation",
  mail: "UIApplicationShortcutIconTypeMail",
  message: "UIApplicationShortcutIconTypeMessage",
  date: "UIApplicationShortcutIconTypeDate",
  time: "UIApplicationShortcutIconTypeTime",
  capturePhoto: "UIApplicationShortcutIconTypeCapturePhoto",
  captureVideo: "UIApplicationShortcutIconTypeCaptureVideo",
  task: "UIApplicationShortcutIconTypeTask",
  taskCompleted: "UIApplicationShortcutIconTypeTaskCompleted",
  alarm: "UIApplicationShortcutIconTypeAlarm",
  bookmark: "UIApplicationShortcutIconTypeBookmark",
  shuffle: "UIApplicationShortcutIconTypeShuffle",
  audio: "UIApplicationShortcutIconTypeAudio",
  update: "UIApplicationShortcutIconTypeUpdate",
};

function resolveImage(image?: string): [string, string] | undefined {
  if (!image) {
    return;
  }

  if (image.startsWith("symbol:")) {
    return [
      "UIApplicationShortcutItemIconSymbolName",
      image.replace(/^symbol:/, ""),
    ];
  }

  const builtIn = builtInIcons[image];
  if (builtIn) {
    return ["UIApplicationShortcutItemIconType", builtIn];
  }

  return ["UIApplicationShortcutItemIconFile", image.replace(/^asset:/, "")];
}

export type IosStaticQuickActionProps = {
  title: string;
  icon?: string;
  subtitle?: string;
  /**
   * A unique string that the system passes to your app
   */
  id: string;
  /**
   * An optional, app-defined dictionary. One use for this dictionary is to provide app version information, as described in the “App Launch and App Update Considerations for Quick Actions” section of the overview in UIApplicationShortcutItem Class Reference.
   */
  params?: XML.XMLObject;
};

// https://developer.apple.com/documentation/uikit/menus_and_shortcuts/add_home_screen_quick_actions
export const withIosStaticQuickActions: ConfigPlugin<
  void | IosStaticQuickActionProps[]
> = (config, _items) => {
  const items = _items || [];

  if (!Array.isArray(items) || !items.length) {
    return config;
  }

  return withInfoPlist(config, (config) => {
    config.modResults.UIApplicationShortcutItems = items.map(
      ({ icon, ...item }) => {
        const result: Record<string, string> = {};

        for (const [key, value] of Object.entries(remapping)) {
          // @ts-expect-error
          const itemValue = item[key];
          if (itemValue) {
            result[value] = itemValue;
          }
        }
        const imgProps = resolveImage(icon);
        if (imgProps) {
          const [key, value] = imgProps;
          result[key] = value;
        }

        return result;
      }
    );

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
