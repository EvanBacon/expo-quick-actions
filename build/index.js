const ExpoQuickActions = globalThis.expo?.modules
    ?.ExpoQuickActions;
export const initial = ExpoQuickActions?.initial;
export const maxCount = ExpoQuickActions?.maxCount;
export const setItems = ExpoQuickActions?.setItems ?? (() => Promise.resolve());
export const isSupported = ExpoQuickActions?.isSupported ?? (() => Promise.resolve(false));
export function addListener(listener) {
    return ExpoQuickActions?.addListener?.("onQuickAction", listener);
}
//# sourceMappingURL=index.js.map