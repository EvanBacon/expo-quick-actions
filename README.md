# expo-quick-actions

> This is not (currently) an official Expo SDK package. Subject to breaking changes.

A comprehensive React Native library for home screen quick actions.

## API documentation

```ts
import * as QuickActions from "expo-quick-actions";
```

### `Action`

The `Action` type is an object with the following properties:

- `id: string`: A unique identifier for the action.
- `title: string`: The title of the action.
- `subtitle?: string | null`: The subtitle of the action, iOS-only.
- `icon?: string | null`: Asset reference to use for the icon.
- `params?: Record<string, number | string | boolean | null | undefined> | null`: Additional serial parameters for the action.

### `initial`

> `Action | null`

A static property that returns the initial quick action item that was used to open the app, if any.

```tsx
const initialAction = QuickActions.initial;
```

### `maxCount`

> `number | null`

A static property that returns the maximum number of quick action items that can be set.

- On iOS, this is hardcoded to 4.
- On Android, this is dynamically collected on start-up.

```tsx
// e.g. 15 on Pixel 6, null on iOS.
const maxCount = QuickActions.maxCount;
```

### `setItems`

> `(items: Action[]) => Promise<void>`

An async function that sets the quick action items for the app. Both Apple and Android recommend a max of 4 items.

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

> Read the [Android design docs for shortcut icons](https://commondatastorage.googleapis.com/androiddevelopers/shareables/design/app-shortcuts-design-guidelines.pdf).

On iOS, there are three types of images you may want to use: default icons, SF Symbols, and custom template images. The `icon` property supports magic prefixes to access all the built-in icons:

### SF Symbols

> `UIApplicationShortcutIcon(systemImageName:)` -- Create an icon using a system image. You can use any of the names here that are usable with -systemImageNamed:.

Icons prefixed with `symbol:` are passed to `UIApplicationShortcutIcon(systemImageName:)`, e.g. `symbol:heart.fill` will use `UIApplicationShortcutIcon(systemImageName: "heart.fill")` which renders the SF Symbols icon named `heart.fill`. Learn more about [Apple SF Symbols](https://developer.apple.com/design/human-interface-guidelines/sf-symbols/overview/). Note: SF Symbols are only available on iOS as Apple copyright restricts using them on other platforms.

### System Icons

> `UIApplicationShortcutIcon(type:)` -- Create an icon using a system-defined image.

Icons matching one of the following will use a built-in icon: "compose", "play", "pause", "add", "location", "search", "share", "prohibit", "contact", "home", "markLocation", "favorite", "love", "cloud", "invitation", "confirmation", "mail", "message", "date", "time", "capturePhoto", "captureVideo", "task", "taskCompleted", "alarm", "bookmark", "shuffle", "audio", "update".

If no built-in icon is found, the icon will default to using a custom image with the same name, e.g. `heart` will use `UIApplicationShortcutIcon(templateImageName: "heart")`.

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

## Config Plugin

There's an optional config plugin that you can use to add images and static iOS actions. Static Android actions are not currently supported because they don't support complex intent.

- `androidIcons`: An object of Android icons. The key is the `icon` property of the action. The value can be a string or an object with `foregroundImage` and `backgroundColor` properties. This generates very similar to `android.adaptiveIcon` as the underlying API is very similar. For simple icons, you can use a string value.
- `iosIcons`: An object of iOS icons. The key is the `icon` property of the action. The value can be a string or an object with `1x`, `2x`, and `3x` properties.
- `iosActions`: An array of iOS actions. These are static actions that will be available unless you clear them with the dynamic API. The `icon` property resolves the same as in the dynamic API, using `symbol:` and `asset:` prefixes.

```json
{
  "plugins": [
    [
      "expo-quick-actions",
      {
        "androidIcons": {
          "shortcut_one": {
            "foregroundImage": "./assets/adaptive-icon.png",
            "backgroundColor": "#282A35"
          },
          "shortcut_two": {
            "foregroundImage": "./assets/adaptive-star.png",
            "backgroundColor": "#ff0000"
          },
          "shortcut_three": "https://evanbacon.dev/pfp.png"
        },
        "iosIcons": {
          "shortcut_one": "./assets/adaptive-icon.png",
          "shortcut_two": {
            "1x": "./assets/adaptive-icon.png"
          }
        },
        "iosActions": [
          {
            "id": "1",
            "title": "Shortcut One",
            "subtitle": "Subtitle One",
            "icon": "shortcut_one",
            "params": {
              "url": "https://baconbrix.com"
            }
          }
        ]
      }
    ]
  ]
}
```

## iOS Best Practice

**Use 4 actions**. Apple supports up-to 4, but most good apps use all 4.

**Use SF Symbols**. While you can have custom icons on iOS (and I made it really easy via the Config Plugin), opt-to use SF Symbols instead. This is because Apple injects their own actions and the icons will look out of place.

If you want to use a custom icon, prefer outline icons to filled icons on iOS.

iOS apps often **have a "Search" shortcut** that opens the app and focuses the search bar. This is a good default shortcut to have. Make it the last item in the list. E.g. Whatsapp, Twitter, Apple Mail, Amazon, Slack.

## Android Best Practice

**Use 4 actions** (Android sometimes supports more, Apple only supports 4).

Android shortcuts can be saved to the screen, iOS shortcuts cannot. This means that Android shortcuts should be thought of as alternative entry points to your app. The icon and name should reflect that.
