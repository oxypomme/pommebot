import { readdir } from "fs/promises";
import Logger from "js-logger";
import "./.env";
import client from "./bot";
import { reloadCommands } from "./bot/commands";
import getConfig from "./config";
import app from "./express";
import { IModule } from "./modules/.types";

(async () => {
  const modules = (await readdir(__dirname + "/modules")).filter(
    (d) => d[0] !== "."
  );

  Logger.get("Modules").info("Detected modules", modules);
  for (const module of modules) {
    if (((await import("./modules/" + module)) as IModule).start()) {
      Logger.get("Modules").info(module, "started");
    }
  }

  reloadCommands();
})();

export { app, client, getConfig };
