import { ConfigPlugin, withDangerousMod } from "@expo/config-plugins";
import { generateImageAsync } from "@expo/image-utils";
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
  value: "dark";
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
      const iosNamedProjectRoot = join(projectRoot, cwd);

      const imgPath = `Assets.xcassets/${name}.imageset`;
      // Ensure the Images.xcassets/AppIcon.appiconset path exists
      await fs.promises.mkdir(join(iosNamedProjectRoot, imgPath), {
        recursive: true,
      });

      const userDefinedIcon =
        typeof image === "string"
          ? { "1x": image, "2x": undefined, "3x": undefined }
          : image;

      // Finally, write the Config.json
      await writeContentsJsonAsync(join(iosNamedProjectRoot, imgPath), {
        images: await generateResizedImageAsync(
          Object.fromEntries(
            Object.entries(userDefinedIcon).map(([key, value]) => [
              key,
              value?.match(/^[./]/) ? path.join(cwd, value) : value,
            ])
          ),
          name,
          projectRoot,
          iosNamedProjectRoot,
          path.join(cwd, "gen-image", name)
        ),
      });

      return config;
    },
  ]);
};

const IMAGE_CACHE_NAME = "quick-action-icons-";

async function generateResizedImageAsync(
  icon: { "1x"?: string; "2x"?: string; "3x"?: string } | string,
  name: string,
  projectRoot: string,
  iosNamedProjectRoot: string,
  cacheComponent: string
) {
  // Store the image JSON data for assigning via the Contents.json
  const imagesJson: ContentsJsonImage[] = [];

  // If the user provided a single image, then assume it's the 3x image and generate the 1x and 2x images.
  //   const shouldResize = typeof icon === "string";
  const userDefinedIcon =
    typeof icon === "string"
      ? { "1x": icon, "2x": undefined, "3x": undefined }
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
        `Assets.xcassets/${name}.imageset`,
        filename
      );
      await fs.promises.writeFile(assetPath, source);
      if (filename) {
        imgEntry.filename = filename;
      }
    }

    imagesJson.push(imgEntry);
  }

  return imagesJson;
}

/**
 * Writes the Config.json which is used to assign images to their respective platform, dpi, and idiom.
 *
 * @param directory path to add the Contents.json to.
 * @param contents image json data
 */
async function writeContentsJsonAsync(
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
