import { withDangerousMod } from "expo/config-plugins";

const withCustomDrawables = (config, images) => {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const drawableDirPath = path.join(
        config.modRequest.platformProjectRoot,
        "app/src/main/res/drawable"
      );
      if (!fs.existsSync(drawableDirPath)) {
        fs.mkdirSync(drawableDirPath, { recursive: true });
      }

      for (const [name, url] of Object.entries(images)) {
        const filepath = path.join(drawableDirPath, `${name}.png`); // Assuming PNG format
        await downloadImage(url, filepath);
      }

      return config;
    },
  ]);
};
