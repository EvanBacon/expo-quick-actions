import { ConfigPlugin } from "@expo/config-plugins";
import { AdaptiveIcon } from "./withAndroidAppIcon";
type Props = {
    icons: Record<string, string | AdaptiveIcon>;
};
export declare const withAndroidDynamicAppIcons: ConfigPlugin<Props>;
export {};
