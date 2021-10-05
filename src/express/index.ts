import { createNodeMiddleware } from "@octokit/app";
import express from "express";
import Logger from "js-logger";
import {
  createChannel,
  deleteChannel,
  notifyNewPackage,
  renameChannel,
} from "../bot/channels";
import GHApp from "../github";
import { removeWH } from "../github/webhooks";
import { NodeColors } from "../NodeColors";

const app = express();
app.use(express.json());
app.use(
  createNodeMiddleware(GHApp, {
    pathPrefix: "/gh",
    // log: Logger.get("GitHub"),
  })
);

app.use(express.static(__dirname + "/public"));

GHApp.webhooks.onAny(({ id, name, payload }) => {
  Logger.get("Express").info(`Getting ${name} from GitHub`);
});

GHApp.webhooks.on("repository.created", async ({ payload }) => {
  await createChannel(payload.repository);
});
GHApp.webhooks.on("repository.renamed", async ({ payload }) => {
  await renameChannel(payload.changes.repository.name.from, payload.repository);
});
GHApp.webhooks.on("repository.deleted", async ({ payload }) => {
  await deleteChannel(payload.repository);
});
GHApp.webhooks.on("repository.archived", async ({ payload }) => {
  await deleteChannel(payload.repository);
  await removeWH(payload.repository);
});
GHApp.webhooks.on("repository.unarchived", async ({ payload }) => {
  await createChannel(payload.repository);
});
GHApp.webhooks.on("package.published", async ({ payload }) => {
  await notifyNewPackage(payload);
});

app.listen(process.env.HTTP_PORT, () => {
  Logger.get("Express").info(
    `Web app listening at ${NodeColors.Underscore}http://localhost:${process.env.HTTP_PORT}${NodeColors.Reset}`
  );
});
