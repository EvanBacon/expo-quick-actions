# expo-quick-actions

A React Native library for home screen quick actions.

## API documentation

```ts
import * as QuickActions from "expo-quick-actions";
```

### `Action`

The `Action` type is an object with the following properties:

- `id: string`: A unique identifier for the action.
- `title: string`: The title of the action.
- `subtitle?: string | null`: The subtitle of the action.
- `icon?: string | null`: Asset reference to use for the icon.
- `params?: Record<string, number | string | boolean | null | undefined> | null`: Additional serial parameters for the action.

### `initial`

> `Action | null`

A static property that returns the initial quick action item that was used to open the app, if any.

```tsx
const initialAction = QuickActions.initial;
```

### `setItems`

> `(items: Action[]) => Promise<void>`

An async function that sets the quick action items for the app.

```ts
QuickActions.setItems([
  {
    id: "0",
    title: "Open Settings",
    subtitle: "Go here to configure settings",
    icon: "heart",
    params: { href: "/settings" },
  },
]);
```

### `isSupported`

> `() => Promise<boolean>`

An async function that returns whether the device supports home screen quick actions.

```ts
const isSupported = await QuickActions.isSupportedAsync();
```

### `addListener`

> `(listener: (payload: Action) => void) => Subscription`

Adds a listener that will fire when a quick action is triggered.

```ts
const subscription = QuickActions.addListener((action) => {
  console.log(action);
});
```

## Icons

On iOS, there are three types of images you may want to use: default icons, SF Symbols, and custom template images. The `icon` property supports magic prefixes to access all the built-in icons:

### SF Symbols

> `UIApplicationShortcutIcon(systemImageName:)` -- Create an icon using a system image. You can use any of the names here that are usable with -systemImageNamed:.

Icons prefixed with `symbol:` are passed to `UIApplicationShortcutIcon(systemImageName:)`, e.g. `symbol:heart.fill` will use `UIApplicationShortcutIcon(systemImageName: "heart.fill")` which renders the SF Symbols icon named `heart.fill`. Learn more about [Apple SF Symbols](https://developer.apple.com/design/human-interface-guidelines/sf-symbols/overview/). Note: SF Symbols are only available on iOS as Apple copyright restricts using them on other platforms.

### System Icons

> `UIApplicationShortcutIcon(type:)` -- Create an icon using a system-defined image.

Icons matching one of the following will use a built-in icon: "compose", "play", "pause", "add", "location", "search", "share", "prohibit", "contact", "home", "markLocation", "favorite", "love", "cloud", "invitation", "confirmation", "mail", "message", "date", "time", "capturePhoto", "captureVideo", "task", "taskCompleted", "alarm", "bookmark", "shuffle", "audio", "update".

If no built-in icon is found, the icon will default to using an SF Symbol with the same name, e.g. `heart` will use `UIApplicationShortcutIcon(systemImageName: "heart")`.

### Custom Images

Create an icon using a system-defined image.

> `UIApplicationShortcutIcon(templateImageName:)` -- Create an icon from a custom image. The provided image named will be loaded from the app's bundle and will be masked to conform to the system-defined icon style.

Icons prefixed with `asset:` are passed to `UIApplicationShortcutIcon(templateImageName:)`, e.g. `asset:heart` will use `UIApplicationShortcutIcon(templateImageName: "heart")` which will load the image named `heart` from the app's bundle and mask it to conform to the system-defined icon style.

## Hooks

I work on bundling at Expo so I mostly try to keep the JS small (and haven't found a good way to ignore unused code without increasing bundle time in development). If you want to use hooks, you can use the following:

```ts
import * as QuickActions from "expo-quick-actions";
import React from "react";

function useQuickActionCallback(
  callback?: (data: QuickActions.Action) => void | Promise<void>
) {
  React.useEffect(() => {
    let isMounted = true;

    if (QuickActions.initial) {
      callback?.(QuickActions.initial);
    }

    const sub = QuickActions.addListener((event) => {
      if (isMounted) {
        callback?.(event);
      }
    });
    return () => {
      isMounted = false;
      sub.remove();
    };
  }, [QuickActions.initial, callback]);
}

function useQuickAction() {
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

// Later ...

import { router } from "expo-router";

useQuickActionCallback((action) => {
  router.push(action.params?.href);
});

// Or...

const action = useQuickAction();

if (action) {
  router.push(action.params?.href);
}
```
