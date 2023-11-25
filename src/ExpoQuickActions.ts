import { EventEmitter, NativeModulesProxy } from "expo-modules-core";

const ExpoQuickActions = NativeModulesProxy.ExpoQuickActions as {
  __expo_module_name__?: string;
  startObserving?: () => void;
  stopObserving?: () => void;
  addListener: (eventName: string) => void;
  removeListeners: (count: number) => void;

  initial?: Action;
  setItems(data?: Action[]): Promise<void>;
  getInitial(): Promise<Action>;
  isSupported(): Promise<boolean>;
};

const emitter = new EventEmitter(ExpoQuickActions);

type Event = {};

export type Action = {
  icon?: unknown;
  id: string;
  subtitle?: string | null;
  title: string;
  userInfo?: Record<string, any> | null;
};

export const { initial, setItems, isSupported, getInitial } = ExpoQuickActions;

export function addListener(listener: (event: Event) => void) {
  return emitter.addListener<Event>("onQuickAction", listener);
}
