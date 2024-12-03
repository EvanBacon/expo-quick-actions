const ExpoQuickActions = globalThis.expo?.modules
    ?.ExpoQuickActions;
export const { initial, maxCount, setItems, isSupported } = ExpoQuickActions;
export function addListener(listener) {
    return ExpoQuickActions.addListener("onQuickAction", listener);
}
//# sourceMappingURL=index.js.map