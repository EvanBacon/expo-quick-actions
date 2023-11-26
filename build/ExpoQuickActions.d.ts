export type Action = {
    id: string;
    title: string;
    icon?: string | null;
    subtitle?: string | null;
    /** Additional serial parameters for the action.  */
    params?: Record<string, number | string | boolean | null | undefined> | null;
};
export declare const initial: Action | undefined, maxCount: number | undefined, setItems: (data?: Action[]) => Promise<void>, isSupported: () => Promise<boolean>;
export declare function addListener(listener: (action: Action) => void): import("expo-modules-core").Subscription;
//# sourceMappingURL=ExpoQuickActions.d.ts.map