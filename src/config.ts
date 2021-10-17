import { mkdirSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";

interface IConfig {
  add: (obj: Partial<IConfig>) => IConfig;
  [key: string]: any;
}
const path = resolve(__dirname, "/../config/index.json");

let config: IConfig = {
  add: (obj): IConfig => {
    config = {
      ...config,
      ...obj,
    };
    writeFileSync(path, JSON.stringify(config));
    return config;
  },
};

(async () => {
  let fileConf = {};
  try {
    fileConf = await import(path);
  } catch (error) {
    mkdirSync(dirname(path), {
      recursive: true,
    });
  }
  config.add(fileConf);
})();

export default config;
