import { ConfigPlugin } from "@expo/config-plugins";
export type AdaptiveIcon = {
    foregroundImage: string;
    backgroundColor?: string;
    backgroundImage?: string;
    monochromeImage?: string;
};
export type AndroidImageProps = {
    name: string;
    src: string | AdaptiveIcon;
};
export declare const withAndroidAppIcon: ConfigPlugin<AndroidImageProps>;
