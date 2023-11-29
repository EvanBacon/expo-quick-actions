export type Action = {
    id: string;
    title: string;
    icon?: string | null;
    /** iOS-only. Subtitle for the action. */
    subtitle?: string | null;
    /** Additional serial parameters for the action.  */
    params?: Record<string, number | string | boolean | null | undefined> | null;
};
export declare const initial: Action | undefined, maxCount: number | undefined, setItems: <TAction extends Action = Action>(data?: TAction[] | undefined) => Promise<void>, isSupported: () => Promise<boolean>;
export declare function addListener<TAction extends Action = Action>(listener: (action: TAction) => void): import("expo-modules-core").Subscription;
//# sourceMappingURL=index.d.ts.map