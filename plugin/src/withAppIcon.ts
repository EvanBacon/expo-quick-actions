import {
  type ConfigPlugin,
  IOSConfig,
  withXcodeProject,
} from "@expo/config-plugins";

import { withAndroidDynamicAppIcons } from "./withAndroidDynamicAppIcon";
import { withIosIconImageAsset } from "./withIosImageAssets";

type IconDimensions = {
  /** The scale of the icon itself, affets file name and width/height when omitted. */
  scale: number;
  /** Both width and height of the icon, affects file name only. */
  size: number;
  /** The width, in pixels, of the icon. Generated from `size` + `scale` when omitted */
  width?: number;
  /** The height, in pixels, of the icon. Generated from `size` + `scale` when omitted */
  height?: number;
  /** Special target of the icon dimension, if any */
  target?: null | "ipad";
};

type IconSet = Record<string, IconSetProps>;
type IconSetProps = { image: string; prerendered?: boolean };

type Props = {
  icons: Record<string, { image: string; prerendered?: boolean }>;
  dimensions: Required<IconDimensions>[];
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
        value.image,
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

/** Get the icon name, used to refer to the icon from within the plist */
function getIconName(
  name: string,
  dimension: Pick<Props["dimensions"][0], "size">
) {
  return `${name}-Icon-${dimension.size}x${dimension.size}`;
}

export default withDynamicIcon;
