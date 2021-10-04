import { App } from "@octokit/app";
import { readFileSync } from "fs";
import Logger from "js-logger";

const privateKey = readFileSync(
  __dirname + "/../../keys/github.private-key.pem",
  "utf-8"
);

const app = new App({
  appId: parseInt(process.env.GH_APP_ID ?? ""),
  privateKey,
  oauth: {
    clientId: process.env.GH_CLIENT_ID ?? "",
    clientSecret: process.env.GH_CLIENT_SECRET ?? "",
  },
  webhooks: {
    secret: process.env.GH_WH_SECRET ?? "",
  },
  log: Logger.get("GitHub"),
});

export default app;
