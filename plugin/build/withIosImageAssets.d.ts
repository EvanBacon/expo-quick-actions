import { ConfigPlugin } from "@expo/config-plugins";
export type IosImageProps = {
    name: string;
    src: string | {
        "1x"?: string;
        "2x"?: string;
        "3x"?: string;
    };
};
export declare const withIosImageAsset: ConfigPlugin<IosImageProps>;
