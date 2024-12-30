import { ConfigPlugin, withDangerousMod } from "@expo/config-plugins";
import { createSquareAsync, generateImageAsync } from "@expo/image-utils";
import fs from "fs";
import path, { join } from "path";

type ContentsJsonImageIdiom =
  | "iphone"
  | "ipad"
  | "watchos"
  | "ios"
  | "ios-marketing"
  | "universal";

type ContentsJsonImageAppearance = {
  appearance: "luminosity";
  value: "dark" | "tinted";
};

type ContentsJsonImageScale = "1x" | "2x" | "3x";

interface ContentsJsonImage {
  appearances?: ContentsJsonImageAppearance[];
  idiom: ContentsJsonImageIdiom;
  size?: string;
  scale?: ContentsJsonImageScale;
  filename?: string;
  platform?: ContentsJsonImageIdiom;
}

interface ContentsJson {
  images: ContentsJsonImage[];
  info: {
    version: number;
    author: string;
  };
}

export type IosImageProps = {
  //   cwd: string;
  name: string;
  src: string | { "1x"?: string; "2x"?: string; "3x"?: string };
};

export const withIosImageAsset: ConfigPlugin<IosImageProps> = (
  config,
  { name, src: image }
) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;

      const cwd = config.modRequest.projectName!;
      const iosNamedProjectRoot = join(
        config.modRequest.platformProjectRoot,
        config.modRequest.projectName!
      );

      const imgPath = `Images.xcassets/${name}.imageset`;
      // Ensure the Images.xcassets/AppIcon.appiconset path exists
      await fs.promises.mkdir(join(iosNamedProjectRoot, imgPath), {
        recursive: true,
      });

      // Finally, write the Config.json
      await writeContentsJsonAsync(join(iosNamedProjectRoot, imgPath), {
        images: await generateResizedImageAsync(
          image,
          name,
          projectRoot,
          iosNamedProjectRoot,
          path.join(cwd, "gen-image", name),
          true
        ),
      });

      return config;
    },
  ]);
};

export interface IOSIcons {
  /**
   * The light icon. It will appear when neither dark nor tinted icons are used, or if they are not provided.
   */
  light?: string;
  /**
   * The dark icon. It will appear for the app when the user's system appearance is dark. See Apple's [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons#iOS-iPadOS) for more information.
   */
  dark?: string;
  /**
   * The tinted icon. It will appear for the app when the user's system appearance is tinted. See Apple's [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons#iOS-iPadOS) for more information.
   */
  tinted?: string;
}

export const withIosIconImageAsset: ConfigPlugin<{
  name: string;
  icon: string | IOSIcons;
}> = (config, { name, icon }) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;

      const iosNamedProjectRoot = join(
        config.modRequest.platformProjectRoot,
        config.modRequest.projectName!
      );

      const imgPath = `Images.xcassets/${name}.appiconset`;
      // Ensure the Images.xcassets/AppIcon.appiconset path exists
      await fs.promises.mkdir(join(iosNamedProjectRoot, imgPath), {
        recursive: true,
      });

      const imagesJson: ContentsJson["images"] = [];

      const baseIconPath =
        typeof icon === "object"
          ? icon?.light || icon?.dark || icon?.tinted
          : icon;

      // Store the image JSON data for assigning via the Contents.json
      const baseIcon = await generateUniversalIconAsync(projectRoot, imgPath, {
        icon: baseIconPath,
        cacheKey: "universal-icon",
        iosNamedProjectRoot,
        platform: "ios",
      });

      imagesJson.push(baseIcon);

      if (typeof icon === "object") {
        if (icon?.dark) {
          const darkIcon = await generateUniversalIconAsync(
            projectRoot,
            imgPath,
            {
              icon: icon.dark,
              cacheKey: "universal-icon-dark",
              iosNamedProjectRoot,
              platform: "ios",
              appearance: "dark",
            }
          );

          imagesJson.push(darkIcon);
        }

        if (icon?.tinted) {
          const tintedIcon = await generateUniversalIconAsync(
            projectRoot,
            imgPath,
            {
              icon: icon.tinted,
              cacheKey: "universal-icon-tinted",
              iosNamedProjectRoot,
              platform: "ios",
              appearance: "tinted",
            }
          );

          imagesJson.push(tintedIcon);
        }
      }

      // Finally, write the Contents.json
      await writeContentsJsonAsync(join(iosNamedProjectRoot, imgPath), {
        images: imagesJson,
      });

      return config;
    },
  ]);
};

function getAppleIconName(
  size: number,
  scale: number,
  appearance?: "dark" | "tinted"
): string {
  let name = "App-Icon";

  if (appearance) {
    name = `${name}-${appearance}`;
  }

  name = `${name}-${size}x${size}@${scale}x.png`;

  return name;
}

async function generateUniversalIconAsync(
  projectRoot: string,
  imagesetPath: string,
  {
    icon,
    cacheKey,
    iosNamedProjectRoot,
    platform,
    appearance,
  }: {
    platform: "watchos" | "ios";
    icon?: string | null;
    appearance?: "dark" | "tinted";
    iosNamedProjectRoot: string;
    cacheKey: string;
  }
): Promise<ContentsJsonImage> {
  const size = 1024;
  const filename = getAppleIconName(size, 1, appearance);

  let source: Buffer;

  if (icon) {
    // Using this method will cache the images in `.expo` based on the properties used to generate them.
    // this method also supports remote URLs and using the global sharp instance.
    source = (
      await generateImageAsync(
        { projectRoot, cacheType: IMAGE_CACHE_NAME + cacheKey },
        {
          src: icon,
          name: filename,
          width: size,
          height: size,
          // Transparency needs to be preserved in dark variant, but can safely be removed in "light" and "tinted" variants.
          removeTransparency: appearance !== "dark",
          // The icon should be square, but if it's not then it will be cropped.
          resizeMode: "cover",
          // Force the background color to solid white to prevent any transparency. (for "any" and "tinted" variants)
          // TODO: Maybe use a more adaptive option based on the icon color?
          backgroundColor: appearance !== "dark" ? "#ffffff" : undefined,
        }
      )
    ).source;
  } else {
    // Create a white square image if no icon exists to mitigate the chance of a submission failure to the app store.
    source = await createSquareAsync({ size });
  }
  // Write image buffer to the file system.
  const assetPath = join(iosNamedProjectRoot, imagesetPath, filename);
  await fs.promises.writeFile(assetPath, source);

  return {
    filename,
    idiom: "universal",
    platform,
    size: `${size}x${size}`,
    ...(appearance
      ? { appearances: [{ appearance: "luminosity", value: appearance }] }
      : {}),
  };
}

const IMAGE_CACHE_NAME = "quick-action-icons-";

async function generateResizedImageAsync(
  icon: { "1x"?: string; "2x"?: string; "3x"?: string } | string,
  name: string,
  projectRoot: string,
  iosNamedProjectRoot: string,
  cacheComponent: string,
  downscaleMissing?: boolean
) {
  // Store the image JSON data for assigning via the Contents.json
  const imagesJson: ContentsJsonImage[] = [];

  // If the user provided a single image, then assume it's the 3x image and generate the 1x and 2x images.
  const shouldResize = downscaleMissing && typeof icon === "string";
  const userDefinedIcon =
    typeof icon === "string"
      ? {
          "1x": icon,
          "2x": undefined,
          "3x": undefined,
          //   "2x": shouldResize ? icon : undefined,
          //   "3x": shouldResize ? icon : undefined,
        }
      : icon;

  for (const icon of Object.entries(userDefinedIcon)) {
    const [scale, iconPath] = icon;
    const filename = `${scale}.png`;

    const imgEntry: ContentsJsonImage = {
      idiom: "universal",
      // @ts-ignore: template types not supported in TS yet
      scale,
    };

    if (iconPath) {
      // Using this method will cache the images in `.expo` based on the properties used to generate them.
      // this method also supports remote URLs and using the global sharp instance.
      const { source } = await generateImageAsync(
        { projectRoot, cacheType: IMAGE_CACHE_NAME + cacheComponent },
        // @ts-expect-error
        {
          src: iconPath,
          name: filename,
        }
      );
      // Write image buffer to the file system.
      const assetPath = join(
        iosNamedProjectRoot,
        `Images.xcassets/${name}.imageset`,
        filename
      );
      await fs.promises.writeFile(assetPath, source);
      if (filename) {
        imgEntry.filename = filename;
      }
    }

    imagesJson.push(imgEntry);
  }

  if (shouldResize) {
    let largestImage = imagesJson.find((image) => image.filename);
    imagesJson.map((image) => {
      if (!image.filename) {
        image.filename = largestImage?.filename;
      }
    });
  }

  return imagesJson;
}

/**
 * Writes the Config.json which is used to assign images to their respective platform, dpi, and idiom.
 *
 * @param directory path to add the Contents.json to.
 * @param contents image json data
 */
export async function writeContentsJsonAsync(
  directory: string,
  { images }: Pick<ContentsJson, "images">
): Promise<void> {
  await fs.promises.mkdir(directory, { recursive: true });

  await fs.promises.writeFile(
    join(directory, "Contents.json"),
    JSON.stringify(
      {
        images,
        info: {
          version: 1,
          // common practice is for the tool that generated the icons to be the "author"
          author: "expo",
        },
      },
      null,
      2
    )
  );
}
