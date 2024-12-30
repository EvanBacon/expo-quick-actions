/** Indicates whether the device supports alternate app icons. */
export declare const isSupported: boolean;
/**
 * Sets the alternate app icon for the application. This closes the app on Android.
 *
 * @param name The name of the alternate icon to set, or `null` to reset to the default icon.
 * @return A `Promise` that resolves with the current alternate icon name, or `null` if no alternate icon is set.
 * @throws {Error} If there is an error setting the alternate icon.
 */
export declare const setIcon: ((name: string | null) => Promise<string | null>) | undefined;
/**
 * Gets the current alternate app icon name.
 * @return A `Promise` that resolves with the current alternate icon name, or `null` if no alternate icon is set.
 */
export declare const getIcon: (() => Promise<string | null>) | undefined;
//# sourceMappingURL=icon.d.ts.map