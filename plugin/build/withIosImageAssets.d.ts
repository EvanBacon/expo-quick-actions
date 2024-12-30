import { ConfigPlugin } from "@expo/config-plugins";
type ContentsJsonImageIdiom = "iphone" | "ipad" | "watchos" | "ios" | "ios-marketing" | "universal";
type ContentsJsonImageAppearance = {
    appearance: "luminosity";
    value: "dark" | "tinted";
};
type ContentsJsonImageScale = "1x" | "2x" | "3x";
interface ContentsJsonImage {
    appearances?: ContentsJsonImageAppearance[];
    idiom: ContentsJsonImageIdiom;
    size?: string;
    scale?: ContentsJsonImageScale;
    filename?: string;
    platform?: ContentsJsonImageIdiom;
}
interface ContentsJson {
    images: ContentsJsonImage[];
    info: {
        version: number;
        author: string;
    };
}
export type IosImageProps = {
    name: string;
    src: string | {
        "1x"?: string;
        "2x"?: string;
        "3x"?: string;
    };
};
export declare const withIosImageAsset: ConfigPlugin<IosImageProps>;
export interface IOSIcons {
    /**
     * The light icon. It will appear when neither dark nor tinted icons are used, or if they are not provided.
     */
    light?: string;
    /**
     * The dark icon. It will appear for the app when the user's system appearance is dark. See Apple's [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons#iOS-iPadOS) for more information.
     */
    dark?: string;
    /**
     * The tinted icon. It will appear for the app when the user's system appearance is tinted. See Apple's [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons#iOS-iPadOS) for more information.
     */
    tinted?: string;
}
export declare const withIosIconImageAsset: ConfigPlugin<{
    name: string;
    icon: string | IOSIcons;
}>;
/**
 * Writes the Config.json which is used to assign images to their respective platform, dpi, and idiom.
 *
 * @param directory path to add the Contents.json to.
 * @param contents image json data
 */
export declare function writeContentsJsonAsync(directory: string, { images }: Pick<ContentsJson, "images">): Promise<void>;
export {};
