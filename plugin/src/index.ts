import { AndroidImageProps, withAndroidAppIcon } from "./withAndroidAppIcon";
import { withIosImageAsset, IosImageProps } from "./withIosImageAssets";
import { ConfigPlugin } from "@expo/config-plugins";

const withQuickActions: ConfigPlugin<{
  androidImages?: Record<string, AndroidImageProps["src"]>;
  iosImages?: Record<string, IosImageProps["src"]>;
}> = (config, props) => {
  if (props.androidImages) {
    Object.entries(props.androidImages).forEach(([name, image]) => {
      config = withAndroidAppIcon(config, {
        name,
        src: image,
      });
    });
  }
  if (props.iosImages) {
    Object.entries(props.iosImages).forEach(([name, image]) => {
      config = withIosImageAsset(config, {
        name,
        src: image,
      });
    });
  }

  return config;
};

module.exports = withQuickActions;
