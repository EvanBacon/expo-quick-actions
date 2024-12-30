import { NativeModule, requireOptionalNativeModule } from "expo-modules-core";

declare class ExpoAppIconType extends NativeModule {
  /** Indicates whether the device supports alternate app icons. */
  isSupported: boolean;

  /**
   * Sets the alternate app icon for the application.
   * @param name The name of the alternate icon to set, or `null` to reset to the default icon.
   * @return A `Promise` that resolves with the current alternate icon name, or `null` if no alternate icon is set.
   * @throws {Error} If there is an error setting the alternate icon.
   */
  setIcon(name: string | null): Promise<string | null>;

  /**
   * Gets the current alternate app icon name.
   * @return A `Promise` that resolves with the current alternate icon name, or `null` if no alternate icon is set.
   */
  getIcon(): Promise<string | null>;
}

const ExpoAppIcon = requireOptionalNativeModule<ExpoAppIconType>("ExpoAppIcon");

/** Indicates whether the device supports alternate app icons. */
export const isSupported = ExpoAppIcon ? ExpoAppIcon.isSupported : false;

/**
 * Sets the alternate app icon for the application. This closes the app on Android.
 *
 * @param name The name of the alternate icon to set, or `null` to reset to the default icon.
 * @return A `Promise` that resolves with the current alternate icon name, or `null` if no alternate icon is set.
 * @throws {Error} If there is an error setting the alternate icon.
 */
export const setIcon = ExpoAppIcon?.setIcon;

/**
 * Gets the current alternate app icon name.
 * @return A `Promise` that resolves with the current alternate icon name, or `null` if no alternate icon is set.
 */
export const getIcon = ExpoAppIcon?.getIcon;
