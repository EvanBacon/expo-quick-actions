export type Action = {
    id: string;
    title: string;
    icon?: string | null;
    subtitle?: string | null;
    userInfo?: Record<string, any> | null;
};
export declare const initial: Action | undefined, setItems: (data?: Action[]) => Promise<void>, isSupported: () => Promise<boolean>, getInitial: () => Promise<Action>;
export declare function addListener(listener: (action: Action) => void): import("expo-modules-core").Subscription;
//# sourceMappingURL=ExpoQuickActions.d.ts.map