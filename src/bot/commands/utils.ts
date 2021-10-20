import { CommandInteraction, TextChannel } from "discord.js";
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
      // TODO: testing needed
      const chan = interaction.channel as TextChannel;
      await chan.bulkDelete(chan.messages.cache);
      interaction.reply({
        content: "Channel is now cleaned",
        ephemeral: true,
      });
    },
  },
];

export default commands;
