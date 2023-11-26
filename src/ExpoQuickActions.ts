import { EventEmitter, requireNativeModule } from "expo-modules-core";

type ConstructorParametersType<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: infer P) => any ? P : never;

type PrivateNativeModule = ConstructorParametersType<typeof EventEmitter>[0];

const ExpoQuickActions = requireNativeModule(
  "ExpoQuickActions"
) as PrivateNativeModule & {
  initial?: Action;
  setItems(data?: Action[]): Promise<void>;
  getInitial(): Promise<Action>;
  isSupported(): Promise<boolean>;
};

export type Action = {
  id: string;
  title: string;
  icon?: string | null;
  subtitle?: string | null;
  userInfo?: Record<string, any> | null;
};

export const { initial, setItems, isSupported, getInitial } = ExpoQuickActions;

const emitter = new EventEmitter(ExpoQuickActions);

export function addListener(listener: (action: Action) => void) {
  return emitter.addListener<Action>("onQuickAction", listener);
}
