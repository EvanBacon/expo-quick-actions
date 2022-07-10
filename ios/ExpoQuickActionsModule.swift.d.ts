export type ActionObject = {
  id?: string;
  title?: string;
  subtitle?: string;
  // @Field var icon: String? = nil
  userInfo?: Record<string, any>;
};

export const Module: {
  initial: any;
  getInitial(): Promise<any>;
  isSupported(): Promise<boolean>;
  setItems(items?: ActionObject[]): Promise<void>;

  // Built-ins

  /**
   * Add the provided eventType as an active listener
   * @param eventType name of the event for which we are registering listener
   */
  addListener: (eventType: string) => void;

  /**
   * Remove a specified number of events.  There are no eventTypes in this case, as
   * the native side doesn't remove the name, but only manages a counter of total
   * listeners
   * @param count number of listeners to remove (of any type)
   */
  removeListeners: (count: number) => void;

  startObserving(): void;

  stopObserving(): void;
};

export const View = null;

// TODO: Types for emitter?
