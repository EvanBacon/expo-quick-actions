import { type ConfigPlugin } from "@expo/config-plugins";
import { IOSIcons } from "./withIosImageAssets";
type IconSet = Record<string, IconSetProps>;
type IconSetProps = {
    image: string | IOSIcons;
};
declare const withDynamicIcon: ConfigPlugin<string[] | IconSet | void>;
export default withDynamicIcon;
