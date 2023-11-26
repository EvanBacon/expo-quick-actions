import { ConfigPlugin, XML } from "@expo/config-plugins";
export type IosStaticQuickActionProps = {
    title: string;
    icon?: string;
    subtitle?: string;
    /**
     * A unique string that the system passes to your app
     */
    id: string;
    /**
     * An optional, app-defined dictionary. One use for this dictionary is to provide app version information, as described in the “App Launch and App Update Considerations for Quick Actions” section of the overview in UIApplicationShortcutItem Class Reference.
     */
    params?: XML.XMLObject;
};
export declare const withIosStaticQuickActions: ConfigPlugin<void | IosStaticQuickActionProps[]>;
