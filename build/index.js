import { EventEmitter } from "expo-modules-core";
const ExpoQuickActions = globalThis.expo?.modules
    ?.ExpoQuickActions;
export const { initial, maxCount, setItems, isSupported } = ExpoQuickActions;
const emitter = new EventEmitter(ExpoQuickActions);
export function addListener(listener) {
    return emitter.addListener("onQuickAction", listener);
}
//# sourceMappingURL=index.js.map