import { ConfigPlugin } from "@expo/config-plugins";
export declare const BASELINE_PIXEL_SIZE = 108;
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
/**
 * Resizes the user-provided icon to create a set of legacy icon files in
 * their respective "mipmap" directories for <= Android 7, and creates a set of adaptive
 * icon files for > Android 7 from the adaptive icon files (if provided).
 */
export declare function setIconAsync(projectRoot: string, { icon, backgroundColor, backgroundImage, monochromeImage, isAdaptive, name, colorName, baselineSize, }: {
    icon: string | null;
    backgroundColor: string | null;
    backgroundImage: string | null;
    monochromeImage: string | null;
    isAdaptive: boolean;
    name: string;
    colorName: string;
    baselineSize: number;
}): Promise<true | null>;
