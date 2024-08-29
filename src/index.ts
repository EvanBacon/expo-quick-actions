import { EventEmitter, requireNativeModule } from "expo-modules-core";
import type { SFSymbol } from "sf-symbols-typescript";

type ConstructorParametersType<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: infer P) => any ? P : never;

type PrivateNativeModule = ConstructorParametersType<typeof EventEmitter>[0];

const ExpoQuickActions = requireNativeModule('ExpoQuickActions') as PrivateNativeModule & {
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

export const { initial, maxCount, setItems, isSupported } = ExpoQuickActions;

const emitter = new EventEmitter(ExpoQuickActions);

export function addListener<TAction extends Action = Action>(
  listener: (action: TAction) => void
) {
  return emitter.addListener<TAction>("onQuickAction", listener);
}
