import { EventEmitter, NativeModulesProxy } from "expo-modules-core";
const ExpoQuickActions = NativeModulesProxy.ExpoQuickActions;
export const { initial, setItems, isSupported, getInitial } = ExpoQuickActions;
const emitter = new EventEmitter(ExpoQuickActions);
export function addListener(listener) {
    return emitter.addListener("onQuickAction", listener);
}
//# sourceMappingURL=ExpoQuickActions.js.map