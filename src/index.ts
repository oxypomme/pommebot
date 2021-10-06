import "./.env";
import "./bot";
import "./express";
import { readdir } from "fs/promises";
import { IModule } from "./modules/.modules";

(async () => {
  const modules = await (
    await readdir(__dirname + "/modules")
  ).filter((d) => d[0] !== ".");

  for (const module of modules) {
    (require("./modules/" + module) as IModule).start();
  }
})();
