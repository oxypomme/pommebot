import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { CommandInteraction } from "discord.js";
import Logger from "js-logger";
import repo from "./repo";
import { Command } from "./types";
import utils from "./utils";

let commands: Command[] = [...repo, ...utils];

const rest = new REST({ version: "9" }).setToken(process.env.BOT_TOKEN ?? "");

export const addCommand = (newCommands: Command[]): void => {
  commands = [...commands, ...newCommands];
};

export const reloadCommands = async (): Promise<void> => {
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
};

export const execCommand = async (
  interaction: CommandInteraction
): Promise<void> => {
  const command = commands.find((c) => c.name === interaction.commandName);
  if (command) {
    try {
      const subcommand = command.options?.find(
        (c) => c.type === 1 && c.name === interaction.options.getSubcommand()
      );
      if (subcommand.action) {
        await subcommand.action(interaction);
      }
    } catch (error) {
      if (command.action) {
        await command.action(interaction);
      }
    }
  }
};

export default commands;
