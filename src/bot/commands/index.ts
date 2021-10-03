import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import Logger from "js-logger";
import repo from "./repo";
import utils from "./utils";

const rest = new REST({ version: "9" }).setToken(process.env.BOT_TOKEN ?? "");

const commands = [...repo, ...utils];

(async () => {
  try {
    if (!process.env.CLIENT_ID || !process.env.SERVER_ID) {
      throw new Error("CLIENT_ID or SERVER_ID is missing in env");
    }

    Logger.get("Discord").debug("Started refreshing application (/) commands.");

    await rest.put(
      // Bug with string types
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.SERVER_ID
      ),
      {
        body: commands,
      }
    );

    Logger.get("Discord").info(
      "Successfully reloaded application (/) commands."
    );
  } catch (err) {
    Logger.get("Discord").error(err);
  }
})();

export default commands;
