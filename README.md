# expo-quick-actions

A React Native library for home screen quick actions.

## API documentation

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
