import { CommandInteraction } from "discord.js";
import { Command } from "./types";

const commands: Command[] = [
  {
    name: "ping",
    description: "pong !",
    action: async (interaction: CommandInteraction): Promise<void> => {
      interaction.reply({
        content: "Pong !",
        ephemeral: true,
      });
    },
  },
  {
    name: "clear",
    description: "Clear all messages",
    action: async (interaction: CommandInteraction): Promise<void> => {
      const messages = await interaction.channel?.messages.fetch();
      if (messages) {
        for (const [, mess] of messages) {
          mess.delete();
        }
      }
      interaction.reply({
        content: "Channel is now cleaned",
        ephemeral: true,
      });
    },
  },
];

export default commands;
