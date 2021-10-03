import express from "express";
import GHWebhook from "express-github-webhook";
import Logger from "js-logger";
import { createChannel, deleteChannel, renameChannel } from "../bot/channels";
import { NodeColors } from "../NodeColors";
import { IPayload } from "./GHTypes";

const GHHandler = GHWebhook({ path: "/gh", secret: process.env.GH_WH_SECRET });

const app = express();
app.use(express.json());
app.use(GHHandler);

app.use(express.static(__dirname + "/public"));

// GHHandler.on("*", function (event: GHEvent, repo: string, data: IPayload) {
//   console.log(`Getting ${event}`);
// });

GHHandler.on("repository", async (repo: string, data: IPayload) => {
  switch (data.action) {
    case "created":
      await createChannel(`${data.repository.owner.login}/${repo}`);
      break;

    case "renamed":
      await renameChannel(
        data.changes.repository.name.from,
        `${data.repository.owner.login}/${repo}`
      );
      break;

    case "deleted":
      await deleteChannel(`${data.repository.owner.login}/${repo}`);
      break;

    default:
      break;
  }
});

app.listen(process.env.HTTP_PORT, () => {
  Logger.get("Express").info(
    `Web app listening at ${NodeColors.Underscore}http://localhost:${process.env.HTTP_PORT}${NodeColors.Reset}`
  );
});
