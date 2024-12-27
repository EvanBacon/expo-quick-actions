import { type ConfigPlugin } from "@expo/config-plugins";
type IconSet = Record<string, IconSetProps>;
type IconSetProps = {
    image: string;
    prerendered?: boolean;
};
declare const withDynamicIcon: ConfigPlugin<string[] | IconSet | void>;
export default withDynamicIcon;
