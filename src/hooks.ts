import React from "react";
import * as QuickActions from "./index";

/**
 * Handle quick actions with a callback function. This prevents the entire component from re-rendering when the action changes. Use `useQuickAction` if you want to re-render the component.
 *
 * @param callback function that's called when a quick action launches the app. Will be instantly called with the initial action if it exists.
 */
export function useQuickActionCallback(
  callback: (data: QuickActions.Action) => void | Promise<void>
) {
  React.useEffect(() => {
    let isMounted = true;

    if (QuickActions.initial) {
      callback(QuickActions.initial);
    }

    const sub = QuickActions.addListener((event) => {
      if (isMounted) {
        callback(event);
      }
    });
    return () => {
      isMounted = false;
      sub.remove();
    };
  }, [QuickActions.initial, callback]);
}

/**
 * A hook to get the most recent quick action to launch the app. Use `useQuickActionCallback` if you want to handle the action in a callback without re-rendering the component.
 *
 * @returns the most recent quick action to launch the app or null if there is none.
 */
export function useQuickAction(): QuickActions.Action | null {
  const [action, setAction] = React.useState<QuickActions.Action | null>(
    QuickActions.initial ?? null
  );

  React.useEffect(() => {
    let isMounted = true;
    const sub = QuickActions.addListener((event) => {
      if (isMounted) {
        setAction(event);
      }
    });
    return () => {
      isMounted = false;
      sub.remove();
    };
  }, []);

  return action;
}
