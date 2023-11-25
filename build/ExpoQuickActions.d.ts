type Event = {};
export type Action = {
    icon?: unknown;
    id: string;
    subtitle?: string | null;
    title: string;
    userInfo?: Record<string, any> | null;
};
export declare const initial: Action | undefined, setItems: (data?: Action[]) => Promise<void>, isSupported: () => Promise<boolean>, getInitial: () => Promise<Action>;
export declare function addListener(listener: (event: Event) => void): import("expo-modules-core").Subscription;
export {};
//# sourceMappingURL=ExpoQuickActions.d.ts.map