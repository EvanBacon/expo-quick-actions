import { AndroidImageProps, withAndroidAppIcon } from "./withAndroidAppIcon";
import { withIosImageAsset, IosImageProps } from "./withIosImageAssets";
import { ConfigPlugin } from "@expo/config-plugins";
import {
  withIosStaticQuickActions,
  IosStaticQuickActionProps,
} from "./withIosStaticActions";

const withQuickActions: ConfigPlugin<{
  androidIcons?: Record<string, AndroidImageProps["src"]>;
  iosIcons?: Record<string, IosImageProps["src"]>;
  iosActions?: IosStaticQuickActionProps[];
}> = (config, props) => {
  if (props.androidIcons) {
    Object.entries(props.androidIcons).forEach(([name, image]) => {
      config = withAndroidAppIcon(config, {
        name,
        src: image,
      });
    });
  }

  if (props.iosIcons) {
    Object.entries(props.iosIcons).forEach(([name, image]) => {
      config = withIosImageAsset(config, {
        name,
        src: image,
      });
    });
  }

  if (props.iosActions) {
    config = withIosStaticQuickActions(config, props.iosActions);
  }

  return config;
};

module.exports = withQuickActions;
