import { AndroidImageProps, withAndroidAppIcon } from "./withAndroidAppIcon";
import { withIosImageAsset, IosImageProps } from "./withIosImageAssets";
import { ConfigPlugin } from "@expo/config-plugins";
import {
  withIosStaticQuickActions,
  IosStaticQuickActionProps,
} from "./withIosStaticActions";
// import { withShortcutsXMLBaseMod } from "./withShortcutsXML";
// import { withAndroidStaticActions } from "./withAndroidStaticActions";
import { validate } from "schema-utils";

import schema from "./options.json";

const withQuickActions: ConfigPlugin<{
  // androidActions?: IosStaticQuickActionProps[];
  androidIcons?: Record<string, AndroidImageProps["src"]>;
  iosIcons?: Record<string, IosImageProps["src"]>;
  iosActions?: IosStaticQuickActionProps[];
}> = (config, props) => {
  validate(schema as any, props);

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

  //   if (props.androidActions) {
  //       withAndroidStaticActions(config, props.androidActions);
  //       // Run last
  //       withShortcutsXMLBaseMod(config);
  //   }

  return config;
};

module.exports = withQuickActions;
