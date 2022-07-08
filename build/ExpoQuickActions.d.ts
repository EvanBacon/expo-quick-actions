import { Subscription } from "expo-modules-core";
declare type Event = {};
declare type Action = {
    icon?: unknown;
    id: string;
    subtitle?: string | null;
    title: string;
    userInfo?: Record<string, any> | null;
};
export declare const initial: Action | undefined;
export declare const setItems: (data?: Action[]) => Promise<void>;
export declare const getInitial: () => Promise<Action>;
export declare const isSupported: () => Promise<boolean>;
export declare function addListener(listener: (event: Event) => void): Subscription;
export {};
