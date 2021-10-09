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

try {
  config = { ...config, ...require(path) };
} catch (error) {
  closeSync(openSync(path, "w"));
  config = { ...config, ...require(path) };
}

export default config;
