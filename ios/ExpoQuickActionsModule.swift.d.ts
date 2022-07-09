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
};

export const View = null;

// TODO: Types for emitter?
