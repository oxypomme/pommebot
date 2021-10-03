import { CommandInteraction } from "discord.js";

export default [
  {
    name: "archive",
    description: "archive repo",
    action: async (interaction: CommandInteraction): Promise<void> => {
      interaction.reply("WIP");
    },
  },
  {
    name: "ping",
    description: "Replies with Pong!",
    action: async (interaction: CommandInteraction): Promise<void> => {
      interaction.reply("Pong !");
    },
  },
];
