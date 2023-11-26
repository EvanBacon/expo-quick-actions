import { ConfigPlugin } from "@expo/config-plugins";
export type AdaptiveIcon = {
    foregroundImage?: string;
    backgroundColor?: string;
    backgroundImage?: string;
    monochromeImage?: string;
};
export declare const withAndroidAppIcon: ConfigPlugin<{
    name: string;
    baseSize?: number;
    icon: string | AdaptiveIcon;
}>;
