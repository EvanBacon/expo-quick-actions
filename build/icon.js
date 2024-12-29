import { NativeModule, requireOptionalNativeModule } from "expo-modules-core";
const ExpoAppIcon = requireOptionalNativeModule("ExpoAppIcon");
export const isSupported = ExpoAppIcon ? ExpoAppIcon.isSupported : false;
export const setIcon = ExpoAppIcon?.setIcon;
export const getIcon = ExpoAppIcon?.getIcon;
//# sourceMappingURL=icon.js.map