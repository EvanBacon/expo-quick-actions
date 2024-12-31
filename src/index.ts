import { EventEmitter } from "expo-modules-core";
import type { SFSymbol } from "sf-symbols-typescript";

const ExpoQuickActions = globalThis.expo?.modules
  ?.ExpoQuickActions as InstanceType<typeof EventEmitter> & {
  initial?: Action;
  setItems<TAction extends Action = Action>(data?: TAction[]): Promise<void>;
  isSupported(): Promise<boolean>;
  /** Android-only. The maximum number of shortcuts allowed. */
  maxCount?: number;
};

type AppleBuiltInIcons =
  | "compose"
  | "play"
  | "pause"
  | "add"
  | "location"
  | "search"
  | "share"
  | "prohibit"
  | "contact"
  | "home"
  | "markLocation"
  | "favorite"
  | "love"
  | "cloud"
  | "invitation"
  | "confirmation"
  | "mail"
  | "message"
  | "date"
  | "time"
  | "capturePhoto"
  | "captureVideo"
  | "task"
  | "taskCompleted"
  | "alarm"
  | "bookmark"
  | "shuffle"
  | "audio"
  | "update";

type AppleSymbolId = `symbol:${SFSymbol}`;

type LocalAssetId = `asset:${string}`;

export type Action = {
  id: string;
  title: string;
  icon?:
    | AppleBuiltInIcons
    | AppleSymbolId
    | LocalAssetId
    | (string & {})
    | null;
  /** iOS-only. Subtitle for the action. */
  subtitle?: string | null;
  /** Additional serial parameters for the action.  */
  params?: Record<string, number | string | boolean | null | undefined> | null;
};

export const initial: Action | undefined = ExpoQuickActions?.initial;
export const maxCount: number | undefined = ExpoQuickActions?.maxCount;
export const setItems = ExpoQuickActions?.setItems ?? (() => Promise.resolve());
export const isSupported =
  ExpoQuickActions?.isSupported ?? (() => Promise.resolve(false));

export function addListener<TAction extends Action = Action>(
  listener: (action: TAction) => void
) {
  if (!ExpoQuickActions?.addListener) {
    return { remove: () => {} };
  }
  return ExpoQuickActions?.addListener?.("onQuickAction", listener);
}
