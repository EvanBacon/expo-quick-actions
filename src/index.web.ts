export const isSupported = () => Promise.resolve(false);
export const setItems = () => Promise.resolve();
export function addListener() {
  return { remove() {} };
}
