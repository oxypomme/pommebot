import { readdir } from "fs/promises";
import "./.env";
import "./bot";
import "./express";
import { IModule } from "./modules/.types";

(async () => {
  const modules = await (
    await readdir(__dirname + "/modules")
  ).filter((d) => d[0] !== ".");

  for (const module of modules) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    (require("./modules/" + module) as IModule).start();
  }
})();
