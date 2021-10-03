import { CommandInteraction, TextChannel } from "discord.js";
import Logger from "js-logger";
import { Command } from "./types";

const commands: Command[] = [
  {
    name: "repo",
    description: "Repo actions",
    permissions: [
      {
        id: process.env.OWNER_ID,
        type: "USER",
        permission: true,
      },
    ],
    options: [
      {
        name: "archive",
        description: "Archive repo",
        type: 1, // 1 is type SUB_COMMAND
        action: async (interaction: CommandInteraction): Promise<void> => {
          const channel = interaction.options.getChannel("repo");
          if (channel instanceof TextChannel) {
            const repo = channel.topic?.replace("https://github.com/", "");
            if (repo) {
              Logger.get("Discord").warn(
                "`/repo archive <repo>` is not implemented"
              );
              channel.send(`${repo} is now archived`);
              interaction.reply({
                content: `${repo} is now archived`,
                ephemeral: true,
              });
            } else {
              interaction.reply({
                content: "Channel's topic is not valid !",
                ephemeral: true,
              });
            }
          } else {
            interaction.reply({
              content: "Channel not valid !",
              ephemeral: true,
            });
          }
        },
        options: [
          {
            name: "repo",
            description: "The repo's channel",
            type: 7,
            required: true,
          },
        ],
      },
      {
        name: "create",
        description: "Create repo",
        type: 1,
        action: async (interaction: CommandInteraction): Promise<void> => {
          interaction.reply("WIP create");
        },
      },
      {
        name: "delete",
        description: "Delete repo",
        type: 1,
        action: async (interaction: CommandInteraction): Promise<void> => {
          interaction.reply("WIP delete");
        },
      },
      {
        name: "rename",
        description: "Rename repo",
        type: 1,
        action: async (interaction: CommandInteraction): Promise<void> => {
          interaction.reply("WIP rename");
        },
      },
    ],
  },
];

export default commands;
