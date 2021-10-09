import { readdir } from "fs/promises";
import "./.env";
import client from "./bot";
import config from "./config";
import app from "./express";
import { IModule } from "./modules/.types";

(async () => {
  const modules = (await readdir(__dirname + "/modules")).filter(
    (d) => d[0] !== "."
  );

  for (const module of modules) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    (require("./modules/" + module) as IModule).start();
  }
})();

export { app, client, config };
