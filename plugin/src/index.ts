import { withAndroidAppIcon } from "./withAndroidAppIcon";
import { withIosImageAsset, IosImageProps } from "./withIosImageAssets";
import { ConfigPlugin } from "@expo/config-plugins";

const withQuickActions: ConfigPlugin<{
  androidIcons: any[];
  iosImages?: IosImageProps[];
}> = (config, props) => {
  props.androidIcons?.forEach((icon) => {
    config = withAndroidAppIcon(config, icon);
  });

  props.iosImages?.forEach((image) => {
    config = withIosImageAsset(config, image);
  });

  return config;
};

module.exports = withQuickActions;
