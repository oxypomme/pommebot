import { readdir } from "fs/promises";
import "./.env";
import client from "./bot";
import { reloadCommands } from "./bot/commands";
import config from "./config";
import app from "./express";
import { IModule } from "./modules/.types";

(async () => {
  const modules = (await readdir(__dirname + "/modules")).filter(
    (d) => d[0] !== "."
  );

  for (const module of modules) {
    ((await import("./modules/" + module)) as IModule).start();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    // (require("./modules/" + module) as IModule).start();
  }

  reloadCommands();
})();

export { app, client, config };
