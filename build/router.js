import React from "react";
import * as QuickActions from "./index";
import { useRouter } from "expo-router";
export function isRouterAction(action) {
    return !!action.params && isHref(action.params.href);
}
function isHref(href) {
    return (typeof href === "string" ||
        (typeof href === "object" &&
            href !== null &&
            typeof href.pathname === "string"));
}
/**
 * Handle quick actions with `params.href`.
 *
 * **Warning:** This should be used inside of a sub-layout route (`app/(root)/_layout.tsx`) and not inside the root layout route (`app/_layout.tsx`) as it will attempt a navigation.
 *
 * @param callback optional callback to handle the action. If the callback returns true, the router will **not** handle the action.
 */
export function useQuickActionRouting(callback) {
    const router = useRouter();
    React.useEffect(() => {
        let isMounted = true;
        const validCallback = (data) => {
            if (isMounted) {
                if (!callback?.(data) && isRouterAction(data)) {
                    setTimeout(() => {
                        if ("navigate" in router) {
                            // @ts-expect-error: v3 and greater
                            router.navigate(data.params.href);
                        }
                        else {
                            router.push(data.params.href);
                        }
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
            sub.remove();
        };
    }, [QuickActions.initial, router, callback]);
}
//# sourceMappingURL=router.js.map