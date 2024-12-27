import { NativeModule } from "expo-modules-core";
declare class ExpoAppIconType extends NativeModule {
    /** Indicates whether the device supports alternate app icons. */
    isSupported: boolean;
    /**
     * Sets the alternate app icon for the application.
     * @param name The name of the alternate icon to set, or `null` to reset to the default icon.
     * @return A `Promise` that resolves with the current alternate icon name, or `null` if no alternate icon is set.
     * @throws {Error} If there is an error setting the alternate icon.
     * @platform ios
     */
    setIcon(name: string | null): Promise<string | null>;
    /**
     * Gets the current alternate app icon name.
     * @return A `Promise` that resolves with the current alternate icon name, or `null` if no alternate icon is set.
     * @platform ios
     */
    getIcon(): Promise<string | null>;
}
export declare const ExpoAppIcon: ExpoAppIconType;
export {};
//# sourceMappingURL=icon.d.ts.map