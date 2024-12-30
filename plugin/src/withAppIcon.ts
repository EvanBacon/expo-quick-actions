import {
  type ConfigPlugin,
  IOSConfig,
  withXcodeProject,
} from "@expo/config-plugins";

import { withAndroidDynamicAppIcons } from "./withAndroidDynamicAppIcon";
import { IOSIcons, withIosIconImageAsset } from "./withIosImageAssets";

type IconSet = Record<string, IconSetProps>;
type IconSetProps = { image: string | IOSIcons };

type Props = {
  icons: IconSet;
};

const withDynamicIcon: ConfigPlugin<string[] | IconSet | void> = (
  config,
  props = {}
) => {
  const icons = resolveIcons(props);

  // TODO: More sensible android options and some way to add platform specific icons.
  withAndroidDynamicAppIcons(config, {
    icons: Object.fromEntries(
      Object.entries(icons).map(([key, value]) => [
        // Must start with letter on Android.
        `expo_ic_${key}`,
        typeof value.image === "string" ? value.image : value.image.light!,
      ])
    ),
  });

  for (const [key, value] of Object.entries(icons)) {
    config = withIosIconImageAsset(config, {
      name: `expo_ic_${key}`,
      icon: value.image,
    });
  }

  config = withIconXcodeProject(
    config,
    Object.keys(icons).map((key) => `expo_ic_${key}`)
  );

  return config;
};

const withIconXcodeProject: ConfigPlugin<string[]> = (config, icons) => {
  return withXcodeProject(config, async (config) => {
    // 1. Set the build settings for the main target

    const targets = IOSConfig.Target.findSignableTargets(config.modResults);
    const iconNames = JSON.stringify(icons.join(" "));

    for (const [, nativeTarget] of targets) {
      IOSConfig.XcodeUtils.getBuildConfigurationsForListId(
        config.modResults,
        nativeTarget.buildConfigurationList
      )
        .filter(
          ([, item]: IOSConfig.XcodeUtils.ConfigurationSectionEntry) =>
            item.buildSettings?.ASSETCATALOG_COMPILER_APPICON_NAME
        )
        .forEach(([, item]: IOSConfig.XcodeUtils.ConfigurationSectionEntry) => {
          item.buildSettings.ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS =
            "YES";
          item.buildSettings.ASSETCATALOG_COMPILER_ALTERNATE_APPICON_NAMES =
            iconNames;
        });
    }

    return config;
  });
};

/** Resolve and sanitize the icon set from config plugin props. */
function resolveIcons(props: string[] | IconSet | void): Props["icons"] {
  let icons: Props["icons"] = {};

  if (Array.isArray(props)) {
    icons = props.reduce(
      (prev, curr, i) => ({ ...prev, [i]: { image: curr } }),
      {}
    );
  } else if (props) {
    icons = props;
  }

  return icons;
}

export default withDynamicIcon;
