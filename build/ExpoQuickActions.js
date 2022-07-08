import { EventEmitter, NativeModulesProxy, } from "expo-modules-core";
const { ExpoQuickActions } = NativeModulesProxy;
const emitter = new EventEmitter(ExpoQuickActions);
const onEventName = "onQuickAction";
export const initial = ExpoQuickActions.initial;
export const setItems = ExpoQuickActions.setItems;
export const getInitial = ExpoQuickActions.getInitial;
export const isSupported = ExpoQuickActions.isSupported;
export function addListener(listener) {
    return emitter.addListener(onEventName, listener);
}
//# sourceMappingURL=ExpoQuickActions.js.map