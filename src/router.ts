import React from "react";
import * as QuickActions from "./index";
import { useRouter } from "expo-router/build/hooks";

type Href = any;

// type TypedHref = Parameters<typeof router.push>[0];

export type RouterAction<THref extends Href = Href> = Omit<
  QuickActions.Action,
  "params"
> & {
  id: string;
  title: string;
  icon?: string | null;
  /** iOS-only. Subtitle for the action. */
  subtitle?: string | null;
  /** Additional serial parameters for the action. */
  params: {
    /** Href should be defined in router projects. */
    href: THref;
  } & QuickActions.Action["params"];
};

export function isRouterAction(
  action: QuickActions.Action
): action is RouterAction {
  return !!action.params && isHref(action.params.href);
}

function isHref(href: any): href is Href {
  return (
    typeof href === "string" ||
    (typeof href === "object" &&
      href !== null &&
      typeof href.pathname === "string")
  );
}

type OptionalPromise<T> = T | Promise<T>;

/**
 * Handle quick actions with `params.href`.
 *
 * **Warning:** This should be used inside of a sub-layout route (`app/(root)/_layout.tsx`) and not inside the root layout route (`app/_layout.tsx`) as it will attempt a navigation.
 *
 * @param callback optional callback to handle the action. If the callback returns true, the router will **not** handle the action.
 */
export function useQuickActionRouting(
  callback?: (
    data: QuickActions.Action
  ) => OptionalPromise<boolean | undefined | void>
) {
  const router = useRouter();

  React.useEffect(() => {
    let isMounted = true;

    const validCallback = (data: QuickActions.Action) => {
      if (isMounted) {
        if (!callback?.(data) && isRouterAction(data)) {
          setTimeout(() => {
            router.navigate(data.params.href);
          });
        }
      }
    };

    if (QuickActions.initial) {
      validCallback(QuickActions.initial);
    }

    const sub = QuickActions.addListener((event) => validCallback(event));
    return () => {
      isMounted = false;
      sub?.remove();
    };
  }, [QuickActions.initial, router, callback]);
}
