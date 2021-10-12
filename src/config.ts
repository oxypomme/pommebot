import { closeSync, openSync, writeFileSync } from "fs";

interface IConfig {
  add: (obj: Partial<IConfig>) => IConfig;
  [key: string]: any;
}
const path = __dirname + "/../config/index.json";

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
    closeSync(openSync(path, "w"));
    fileConf = await import(path);
  }
  config = { ...config, ...fileConf };
})();

export default config;
