import { App } from "@octokit/app";
import Logger from "js-logger";

const app = new App({
  appId: parseInt(process.env.GH_APP_ID ?? ""),
  privateKey: process.env.GH_APP_SECRET ?? "",
  webhooks: {
    secret: process.env.GH_WH_SECRET ?? "",
  },
  pathPrefix: "/gh",
  log: Logger.get("GitHub"),
});

export default app;
