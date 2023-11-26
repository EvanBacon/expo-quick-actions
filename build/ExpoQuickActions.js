import { EventEmitter, requireNativeModule } from "expo-modules-core";
const ExpoQuickActions = requireNativeModule("ExpoQuickActions");
export const { initial, setItems, isSupported } = ExpoQuickActions;
const emitter = new EventEmitter(ExpoQuickActions);
export function addListener(listener) {
    return emitter.addListener("onQuickAction", listener);
}
//# sourceMappingURL=ExpoQuickActions.js.map