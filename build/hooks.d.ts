import * as QuickActions from "./index";
/**
 * Handle quick actions with a callback function. This prevents the entire component from re-rendering when the action changes. Use `useQuickAction` if you want to re-render the component.
 *
 * @param callback function that's called when a quick action launches the app. Will be instantly called with the initial action if it exists.
 */
export declare function useQuickActionCallback(callback: (data: QuickActions.Action) => void | Promise<void>): void;
/**
 * A hook to get the most recent quick action to launch the app. Use `useQuickActionCallback` if you want to handle the action in a callback without re-rendering the component.
 *
 * @returns the most recent quick action to launch the app or null if there is none.
 */
export declare function useQuickAction(): QuickActions.Action | null;
//# sourceMappingURL=hooks.d.ts.map