import { ConfigPlugin } from "@expo/config-plugins";
import { IOSIcons } from "./withIosImageAssets";
import { AdaptiveIcon } from "./withAndroidAppIcon";
type IconSet = Record<string, IconSetProps>;
type IconSetProps = {
    image: string | IOSIcons | AdaptiveIcon;
};
declare const withDynamicIcon: ConfigPlugin<string[] | IconSet | void>;
export default withDynamicIcon;
