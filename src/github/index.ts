import { App } from "@octokit/app";
import { createAppAuth } from "@octokit/auth-app";
import { AuthInterface } from "@octokit/auth-app/dist-types/types";
import { readFileSync } from "fs";
import Logger from "js-logger";
import { join } from "path";

const privateKey = readFileSync(
  join(__dirname, "/../../keys/github.private-key.pem"),
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

export const createGHAuth = (installationId: number): AuthInterface =>
  createAppAuth({
    appId: parseInt(process.env.GH_APP_ID ?? ""),
    privateKey,
    clientId: process.env.GH_CLIENT_ID ?? "",
    clientSecret: process.env.GH_CLIENT_SECRET ?? "",
    installationId,
  });

export default app;
