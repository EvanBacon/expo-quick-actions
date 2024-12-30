import {
  AndroidConfig,
  ConfigPlugin,
  withAndroidManifest,
  withDangerousMod,
} from "@expo/config-plugins";
import { generateImageAsync } from "@expo/image-utils";
import fs from "fs";
import path from "path";

// import { withAndroidAppIcon } from "./withAndroidAppIcon";

const { getMainApplicationOrThrow, getMainActivityOrThrow } =
  AndroidConfig.Manifest;

const ANDROID_FOLDER_PATH = ["app", "src", "main", "res"];
const ANDROID_MIPMAP_NAMES = [
  "mipmap-hdpi",
  "mipmap-mdpi",
  "mipmap-xhdpi",
  "mipmap-xxhdpi",
  "mipmap-xxxhdpi",
];
const ANDROID_DRAWABLE_NAMES = ["drawable-anydpi-v24"];
const ANDROID_SIZES = [162, 108, 216, 324, 432];

type Props = {
  icons: Record<string, string>;
};

export const withAndroidDynamicAppIcons: ConfigPlugin<Props> = (
  config,
  { icons }
) => {
  // if (icons) {
  //   Object.entries(icons).forEach(([name, image]) => {
  //     config = withAndroidAppIcon(config, {
  //       name,
  //       src: image,
  //     });
  //   });
  // }
  withIconAndroidManifest(config, { icons });
  withIconAndroidImages(config, { icons });
  return config;
};

const withIconAndroidManifest: ConfigPlugin<Props> = (config, { icons }) => {
  return withAndroidManifest(config, (config) => {
    const mainApplication: any = getMainApplicationOrThrow(config.modResults);
    const mainActivity = getMainActivityOrThrow(config.modResults);

    const iconNamePrefix = `${config.android!.package}.MainActivity`;
    const iconNames = Object.keys(icons);

    function addIconActivityAlias(config: any[]): any[] {
      return [
        ...config,
        ...iconNames.map((iconName) => ({
          $: {
            "android:name": `${iconNamePrefix}${iconName}`,
            "android:enabled": "false",
            "android:exported": "true",
            "android:icon": `@mipmap/${iconName}`,
            "android:targetActivity": ".MainActivity",
            "android:roundIcon": `@mipmap/${iconName}_round`,
          },
          "intent-filter": [
            ...(mainActivity["intent-filter"] || [
              {
                action: [
                  { $: { "android:name": "android.intent.action.MAIN" } },
                ],
                category: [
                  {
                    $: { "android:name": "android.intent.category.LAUNCHER" },
                  },
                ],
              },
            ]),
          ],
        })),
      ];
    }

    function removeIconActivityAlias(config: any[]): any[] {
      return config.filter(
        (activityAlias) =>
          !(activityAlias.$["android:name"] as string).startsWith(
            iconNamePrefix
          )
      );
    }

    mainApplication["activity-alias"] = removeIconActivityAlias(
      mainApplication["activity-alias"] || []
    );
    mainApplication["activity-alias"] = addIconActivityAlias(
      mainApplication["activity-alias"] || []
    );

    return config;
  });
};

const withIconAndroidImages: ConfigPlugin<Props> = (config, { icons }) => {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const androidResPath = path.join(
        config.modRequest.platformProjectRoot,
        ...ANDROID_FOLDER_PATH
      );

      const addIconRes = async (folders: string[], round?: boolean) => {
        for (let i = 0; i < folders.length; i++) {
          const size = ANDROID_SIZES[i];
          const outputPath = path.join(androidResPath, folders[i]);

          await fs.promises.mkdir(outputPath, { recursive: true });

          // square ones
          for (const [name, image] of Object.entries(icons)) {
            if (!image) continue;
            const fileName = `${name}.png`;

            const { source } = await generateImageAsync(
              {
                projectRoot: config.modRequest.projectRoot,
                cacheType: `expo-dynamic-app-icon-${size}`,
              },
              {
                name: fileName,
                src: image,
                removeTransparency: true,
                backgroundColor: "#ffffff",
                resizeMode: "cover",
                width: size,
                height: size,
              }
            );
            await fs.promises.writeFile(
              path.join(outputPath, fileName),
              source
            );
          }

          if (round) {
            // round ones
            for (const [name, image] of Object.entries(icons)) {
              if (!image) continue;
              const fileName = `${name}_round.png`;

              const { source } = await generateImageAsync(
                {
                  projectRoot: config.modRequest.projectRoot,
                  cacheType: `expo-dynamic-app-icon-round-${size}`,
                },
                {
                  name: fileName,
                  src: image,
                  removeTransparency: true,
                  backgroundColor: "#ffffff",
                  resizeMode: "cover",
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                }
              );
              await fs.promises.writeFile(
                path.join(outputPath, fileName),
                source
              );
            }
          }
        }
      };

      // Remove and add icons for mipmap folders
      await addIconRes(ANDROID_MIPMAP_NAMES, true);

      // Also remove and add icons for drawable folders
      await addIconRes(ANDROID_DRAWABLE_NAMES, false);

      return config;
    },
  ]);
};
