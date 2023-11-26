import { withAndroidAppIcon } from "./withAndroidAppIcon";
import { ConfigPlugin } from "@expo/config-plugins";

const withQuickActions: ConfigPlugin<{ androidIcons: any[] }> = (
  config,
  props
) => {
  for (const [, icon] of props.androidIcons.entries()) {
    config = withAndroidAppIcon(config, icon);
  }

  return config;
};

module.exports = withQuickActions;
