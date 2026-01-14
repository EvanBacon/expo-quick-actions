import {
  AndroidConfig,
  ConfigPlugin,
  withAndroidManifest,
} from "@expo/config-plugins";

const { getMainApplicationOrThrow, getMainActivityOrThrow } =
  AndroidConfig.Manifest;

// Import AdaptiveIcon type and withAndroidAppIcon from withAndroidAppIcon
import { AdaptiveIcon, withAndroidAppIcon } from "./withAndroidAppIcon";

type Props = {
  icons: Record<string, string | AdaptiveIcon>;
};

export const withAndroidDynamicAppIcons: ConfigPlugin<Props> = (
  config,
  { icons }
) => {
  // Use withAndroidAppIcon for each icon - it handles colors.xml and image generation
  Object.entries(icons).forEach(([iconName, iconSrc]) => {
    if (!iconSrc) return;
    config = withAndroidAppIcon(config, {
      name: iconName,
      src: iconSrc,
    });
  });

  // Handle manifest changes (activity-alias creation) - unique to dynamic app icons
  withIconAndroidManifest(config, { icons });
  return config;
};

const withIconAndroidManifest: ConfigPlugin<Props> = (config, { icons }) => {
  return withAndroidManifest(config, (config) => {
    const mainApplication: any = getMainApplicationOrThrow(config.modResults);
    const mainActivity = getMainActivityOrThrow(config.modResults);

    const iconNamePrefix = `${config.android!.package}.MainActivity`;
    const iconNames = Object.keys(icons);

    function addIconActivityAlias(config: any[]): any[] {
      return [
        ...config,
        ...iconNames.map((iconName) => {
          const iconSrc = icons[iconName];
          const isAdaptiveIcon =
            typeof iconSrc === "object" && iconSrc !== null;

          const activityAliasAttributes: any = {
            "android:name": `${iconNamePrefix}${iconName}`,
            "android:enabled": "false",
            "android:exported": "true",
            "android:icon": `@mipmap/${iconName}`,
            "android:targetActivity": ".MainActivity",
          };

          // Only add roundIcon if it's an AdaptiveIcon
          if (isAdaptiveIcon) {
            activityAliasAttributes["android:roundIcon"] =
              `@mipmap/${iconName}_round`;
          }

          return {
            $: activityAliasAttributes,
            "intent-filter": [
              ...(mainActivity["intent-filter"] || [
                {
                  action: [
                    { $: { "android:name": "android.intent.action.MAIN" } },
                  ],
                  category: [
                    {
                      $: { "android:name": "android.intent.category.LAUNCHER" },
                    },
                  ],
                },
              ]),
            ],
          };
        }),
      ];
    }

    function removeIconActivityAlias(config: any[]): any[] {
      return config.filter(
        (activityAlias) =>
          !(activityAlias.$["android:name"] as string).startsWith(
            iconNamePrefix
          )
      );
    }

    mainApplication["activity-alias"] = removeIconActivityAlias(
      mainApplication["activity-alias"] || []
    );
    mainApplication["activity-alias"] = addIconActivityAlias(
      mainApplication["activity-alias"] || []
    );

    return config;
  });
};
