import {
  AndroidConfig,
  ConfigPlugin,
  withAndroidColors,
  withDangerousMod,
} from "@expo/config-plugins";
import { compositeImagesAsync, generateImageAsync } from "@expo/image-utils";
import fs from "fs";
import path from "path";

const { Colors } = AndroidConfig;

type DPIString = "mdpi" | "hdpi" | "xhdpi" | "xxhdpi" | "xxxhdpi";
type dpiMap = Record<DPIString, { folderName: string; scale: number }>;

const dpiValues: dpiMap = {
  mdpi: { folderName: "mipmap-mdpi", scale: 1 },
  hdpi: { folderName: "mipmap-hdpi", scale: 1.5 },
  xhdpi: { folderName: "mipmap-xhdpi", scale: 2 },
  xxhdpi: { folderName: "mipmap-xxhdpi", scale: 3 },
  xxxhdpi: { folderName: "mipmap-xxxhdpi", scale: 4 },
};
const BASELINE_PIXEL_SIZE = 108;
const ANDROID_RES_PATH = "android/app/src/main/res/";
const MIPMAP_ANYDPI_V26 = "mipmap-anydpi-v26";

export type AdaptiveIcon = {
  foregroundImage: string;
  backgroundColor?: string;
  backgroundImage?: string;
  monochromeImage?: string;
};

export type AndroidImageProps = {
  name: string;
  src: string | AdaptiveIcon;
};

export const withAndroidAppIcon: ConfigPlugin<AndroidImageProps> = (
  config,
  props
) => {
  const icon =
    typeof props.src === "string" ? props.src : props.src.foregroundImage;

  if (!icon) {
    return config;
  }

  const name = props.name; // ?? "ic_launcher";
  // NOTE: This is normally `iconBackground`
  const backgroundColorName = `${name}_background_color`;
  const backgroundColor =
    typeof props.src === "string" ? null : props.src.backgroundColor ?? null;
  const backgroundImage =
    typeof props.src === "string" ? null : props.src.backgroundImage ?? null;
  const monochromeImage =
    typeof props.src === "string" ? null : props.src.monochromeImage ?? null;

  const isAdaptive = typeof props.src !== "string";
  // Apply colors.xml changes
  withAndroidColors(config, (config) => {
    if (isAdaptive) {
      config.modResults = Colors.assignColorValue(config.modResults, {
        value: backgroundColor ?? "#FFFFFF",
        name: backgroundColorName,
      });
    } else {
      config.modResults = Colors.removeColorItem(
        backgroundColorName,
        config.modResults
      );
    }

    return config;
  });

  return withDangerousMod(config, [
    "android",
    async (config) => {
      await setIconAsync(config.modRequest.projectRoot, {
        icon,
        backgroundColor,
        backgroundImage,
        monochromeImage,
        isAdaptive,
        name,
        colorName: backgroundColorName,
        baselineSize: BASELINE_PIXEL_SIZE,
      });
      return config;
    },
  ]);
};

/**
 * Resizes the user-provided icon to create a set of legacy icon files in
 * their respective "mipmap" directories for <= Android 7, and creates a set of adaptive
 * icon files for > Android 7 from the adaptive icon files (if provided).
 */
async function setIconAsync(
  projectRoot: string,
  {
    icon,
    backgroundColor,
    backgroundImage,
    monochromeImage,
    isAdaptive,
    name,
    colorName,
    baselineSize,
  }: {
    icon: string | null;
    backgroundColor: string | null;
    backgroundImage: string | null;
    monochromeImage: string | null;
    isAdaptive: boolean;
    name: string;
    colorName: string;
    baselineSize: number;
  }
) {
  if (!icon) {
    return null;
  }

  await configureLegacyIconAsync(
    projectRoot,
    icon,
    backgroundImage,
    backgroundColor,
    name,
    baselineSize
  );
  const roundName = `${name}_round.png`;
  if (isAdaptive) {
    await generateMultiLayerImageAsync(projectRoot, {
      icon,
      baselineSize,
      borderRadiusRatio: 0.5,
      outputImageFileName: roundName,
      backgroundImage,
      backgroundColor,
      imageCacheFolder: name + "-android-standard-circle",
      backgroundImageCacheFolder: name + "-android-standard-round-background",
    });
  } else {
    await deleteIconNamedAsync(projectRoot, roundName);
  }
  await configureAdaptiveIconAsync(
    projectRoot,
    icon,
    backgroundImage,
    monochromeImage,
    isAdaptive,
    {
      name,
      colorName: colorName,
      baselineSize,
    }
  );

  return true;
}

/**
 * Configures legacy icon files to be used on Android 7 and earlier. If adaptive icon configuration
 * was provided, we create a pseudo-adaptive icon by layering the provided files (or background
 * color if no backgroundImage is provided. If no backgroundImage and no backgroundColor are provided,
 * the background is set to transparent.)
 */
async function configureLegacyIconAsync(
  projectRoot: string,
  icon: string,
  backgroundImage: string | null,
  backgroundColor: string | null,
  name: string,
  baselineSize: number
) {
  return generateMultiLayerImageAsync(projectRoot, {
    icon,
    backgroundImage,
    backgroundColor,
    outputImageFileName: `${name}.png`,
    imageCacheFolder: name + "-android-standard-square",
    backgroundImageCacheFolder: name + "-android-standard-square-background",
    baselineSize,
  });
}

/**
 * Configures adaptive icon files to be used on Android 8 and up. A foreground image must be provided,
 * and will have a transparent background unless:
 * - A backgroundImage is provided, or
 * - A backgroundColor was specified
 */
async function configureAdaptiveIconAsync(
  projectRoot: string,
  foregroundImage: string,
  backgroundImage: string | null,
  monochromeImage: string | null,
  isAdaptive: boolean,
  {
    name,
    colorName,
    baselineSize,
  }: { name: string; colorName: string; baselineSize: number }
) {
  if (monochromeImage) {
    await generateMonochromeImageAsync(projectRoot, {
      icon: monochromeImage,
      imageCacheFolder: name + "-android-adaptive-monochrome",
      outputImageFileName: `${name}_monochrome.png`,
      baselineSize,
    });
  }
  await generateMultiLayerImageAsync(projectRoot, {
    baselineSize,
    backgroundColor: "transparent",
    backgroundImage,
    backgroundImageCacheFolder: name + "-android-adaptive-background",
    outputImageFileName: `${name}_foreground.png`,
    icon: foregroundImage,
    imageCacheFolder: name + "-android-adaptive-foreground",
    backgroundImageFileName: `${name}_background.png`,
  });

  // create ic_launcher.xml and ic_launcher_round.xml
  const icLauncherXmlString = createAdaptiveIconXmlString(
    backgroundImage,
    monochromeImage,
    {
      name,
      colorName: colorName,
    }
  );
  await createAdaptiveIconXmlFiles(
    projectRoot,
    icLauncherXmlString,
    name,
    // If the user only defined icon and not android.adaptiveIcon, then skip enabling the layering system
    // this will scale the image down and present it uncropped.
    isAdaptive
  );
}

const createAdaptiveIconXmlString = (
  backgroundImage: string | null,
  monochromeImage: string | null,
  {
    name,
    colorName,
  }: {
    /** ic_launcher */
    name: string;
    colorName: string;
  }
) => {
  const background = backgroundImage
    ? `@mipmap/${name}_background`
    : `@color/${colorName}`;

  const iconElements: string[] = [
    `<background android:drawable="${background}"/>`,
    `<foreground android:drawable="@mipmap/${name}_foreground"/>`,
  ];

  if (monochromeImage) {
    iconElements.push(
      `<monochrome android:drawable="@mipmap/${name}_monochrome"/>`
    );
  }

  return `<?xml version="1.0" encoding="utf-8"?>
  <adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
      ${iconElements.join("\n    ")}
  </adaptive-icon>`;
};

async function createAdaptiveIconXmlFiles(
  projectRoot: string,
  icLauncherXmlString: string,
  name: string,
  add: boolean
) {
  const anyDpiV26Directory = path.resolve(
    projectRoot,
    ANDROID_RES_PATH,
    MIPMAP_ANYDPI_V26
  );
  await fs.promises.mkdir(anyDpiV26Directory, { recursive: true });
  const launcherPath = path.resolve(anyDpiV26Directory, `${name}.xml`);
  const launcherRoundPath = path.resolve(
    anyDpiV26Directory,
    `${name}_round.xml`
    // IC_LAUNCHER_ROUND_XML
  );
  if (add) {
    await Promise.all([
      fs.promises.writeFile(launcherPath, icLauncherXmlString),
      fs.promises.writeFile(launcherRoundPath, icLauncherXmlString),
    ]);
  } else {
    // Remove the xml if the icon switches from adaptive to standard.
    await Promise.all(
      [launcherPath, launcherRoundPath].map((path) => remove(path))
    );
  }
}

async function generateMultiLayerImageAsync(
  projectRoot: string,
  {
    icon,
    backgroundColor,
    backgroundImage,
    imageCacheFolder,
    backgroundImageCacheFolder,
    borderRadiusRatio,
    outputImageFileName,
    backgroundImageFileName,
    baselineSize,
  }: {
    icon: string;
    backgroundImage: string | null;
    backgroundColor: string | null;
    imageCacheFolder: string;
    backgroundImageCacheFolder: string;
    backgroundImageFileName?: string;
    borderRadiusRatio?: number;
    outputImageFileName: string;
    baselineSize: number;
  }
) {
  await iterateDpiValues(projectRoot, async ({ dpiFolder, scale }) => {
    let iconLayer = await generateIconAsync(projectRoot, {
      baseSize: baselineSize,
      cacheType: imageCacheFolder,
      src: icon,
      scale,
      // backgroundImage overrides backgroundColor
      backgroundColor: backgroundImage
        ? "transparent"
        : backgroundColor ?? "transparent",
      borderRadiusRatio,
    });

    if (backgroundImage) {
      const backgroundLayer = await generateIconAsync(projectRoot, {
        baseSize: baselineSize,
        cacheType: backgroundImageCacheFolder,
        src: backgroundImage,
        scale,
        backgroundColor: "transparent",
        borderRadiusRatio,
      });

      if (backgroundImageFileName) {
        await fs.promises.writeFile(
          path.resolve(dpiFolder, backgroundImageFileName),
          backgroundLayer
        );
      } else {
        iconLayer = await compositeImagesAsync({
          foreground: iconLayer,
          background: backgroundLayer,
        });
      }
    } else if (backgroundImageFileName) {
      // Remove any instances of ic_launcher_background.png that are there from previous icons
      await deleteIconNamedAsync(projectRoot, backgroundImageFileName);
    }

    await fs.promises.mkdir(dpiFolder, { recursive: true });
    await fs.promises.writeFile(
      path.resolve(dpiFolder, outputImageFileName),
      iconLayer
    );
  });
}

async function generateMonochromeImageAsync(
  projectRoot: string,
  {
    icon,
    imageCacheFolder,
    outputImageFileName,
    baselineSize,
  }: {
    icon: string;
    imageCacheFolder: string;
    outputImageFileName: string;
    baselineSize: number;
  }
) {
  await iterateDpiValues(projectRoot, async ({ dpiFolder, scale }) => {
    const monochromeIcon = await generateIconAsync(projectRoot, {
      baseSize: baselineSize,
      cacheType: imageCacheFolder,
      src: icon,
      scale,
      backgroundColor: "transparent",
    });
    await fs.promises.mkdir(dpiFolder, { recursive: true });

    await fs.promises.writeFile(
      path.resolve(dpiFolder, outputImageFileName),
      monochromeIcon
    );
  });
}

function iterateDpiValues(
  projectRoot: string,
  callback: (value: {
    dpiFolder: string;
    folderName: string;
    scale: number;
  }) => Promise<void>
) {
  return Promise.all(
    Object.values(dpiValues).map((value) =>
      callback({
        dpiFolder: path.resolve(
          projectRoot,
          ANDROID_RES_PATH,
          value.folderName
        ),
        ...value,
      })
    )
  );
}

async function deleteIconNamedAsync(projectRoot: string, name: string) {
  return iterateDpiValues(projectRoot, ({ dpiFolder }) => {
    return remove(path.resolve(dpiFolder, name));
  });
}

async function remove(p: string) {
  if (fs.existsSync(p)) {
    return fs.promises.unlink(p);
  }
}

async function generateIconAsync(
  projectRoot: string,
  {
    cacheType,
    src,
    scale,
    backgroundColor,
    borderRadiusRatio,
    baseSize,
  }: {
    cacheType: string;
    src: string;
    scale: number;
    backgroundColor: string;
    borderRadiusRatio?: number;
    baseSize: number;
  }
) {
  const iconSizePx = baseSize * scale;

  return (
    await generateImageAsync(
      { projectRoot, cacheType },
      {
        src,
        width: iconSizePx,
        height: iconSizePx,
        resizeMode: "cover",
        backgroundColor,
        borderRadius: borderRadiusRatio
          ? iconSizePx * borderRadiusRatio
          : undefined,
      }
    )
  ).source;
}
