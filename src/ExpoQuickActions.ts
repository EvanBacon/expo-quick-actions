import {
  EventEmitter,
  Subscription,
  NativeModulesProxy,
} from "expo-modules-core";
const { ExpoQuickActions } = NativeModulesProxy;

const emitter = new EventEmitter(ExpoQuickActions);

const onEventName = "onQuickAction";

type Event = {};
type Action = {
  icon?: unknown;
  id: string;
  subtitle?: string | null;
  title: string;
  userInfo?: Record<string, any> | null;
};

export const initial: Action | undefined = ExpoQuickActions.initial;

export const setItems: (data?: Action[]) => Promise<void> =
  ExpoQuickActions.setItems;

export const getInitial: () => Promise<Action> = ExpoQuickActions.getInitial;
export const isSupported: () => Promise<boolean> = ExpoQuickActions.isSupported;

export function addListener(listener: (event: Event) => void): Subscription {
  return emitter.addListener<Event>(onEventName, listener);
}
