import type { SFSymbol } from "sf-symbols-typescript";
type AppleBuiltInIcons = "compose" | "play" | "pause" | "add" | "location" | "search" | "share" | "prohibit" | "contact" | "home" | "markLocation" | "favorite" | "love" | "cloud" | "invitation" | "confirmation" | "mail" | "message" | "date" | "time" | "capturePhoto" | "captureVideo" | "task" | "taskCompleted" | "alarm" | "bookmark" | "shuffle" | "audio" | "update";
type AppleSymbolId = `symbol:${SFSymbol}`;
type LocalAssetId = `asset:${string}`;
export type Action = {
    id: string;
    title: string;
    icon?: AppleBuiltInIcons | AppleSymbolId | LocalAssetId | (string & {}) | null;
    /** iOS-only. Subtitle for the action. */
    subtitle?: string | null;
    /** Additional serial parameters for the action.  */
    params?: Record<string, number | string | boolean | null | undefined> | null;
};
export declare const initial: Action | undefined;
export declare const maxCount: number | undefined;
export declare const setItems: <TAction extends Action = Action>(data?: TAction[] | undefined) => Promise<void>;
export declare const isSupported: () => Promise<boolean>;
export declare function addListener<TAction extends Action = Action>(listener: (action: TAction) => void): import("expo-modules-core").EventSubscription;
export {};
//# sourceMappingURL=index.d.ts.map