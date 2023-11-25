export type Action = {
    icon?: string | null;
    id: string;
    subtitle?: string | null;
    title: string;
    userInfo?: Record<string, any> | null;
};
export declare const initial: Action | undefined, setItems: (data?: Action[]) => Promise<void>, isSupported: () => Promise<boolean>, getInitial: () => Promise<Action>;
export declare function addListener(listener: (action: Action) => void): import("expo-modules-core").Subscription;
//# sourceMappingURL=ExpoQuickActions.d.ts.map