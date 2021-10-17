import { CommandInteraction } from "discord.js";
import { addCommand } from "../../bot/commands";
import config from "../../config";
import { clearCache } from "./src/express/multi";

let timer: NodeJS.Timer;

const timerFnc = (generateEDT) => {
  for (const login of config.ul?.logins) {
    generateEDT(login);
  }
};

export const start = async (): Promise<boolean> => {
  // Start express
  import("./src/express");

  const { generateEDT } = await import("./src/express/multi");
  timer = setInterval(() => timerFnc(generateEDT), 60 * 60 * 1000);

  addCommand([
    {
      name: "ul",
      description: "UL actions",
      options: [
        {
          name: "add",
          description: "Add login to watched timetables",
          type: 1,
          action: async (interaction: CommandInteraction): Promise<void> => {
            const login = interaction.options.getString("login");
            config.add({
              ul: {
                ...config.ul,
                logins: config.ul?.logins
                  ? [...config.ul?.logins, login]
                  : [login],
              },
            });
            generateEDT(login ?? "");
            interaction.reply({
              content: "Config updated",
              ephemeral: true,
            });
          },
          options: [
            {
              name: "login",
              description: "The login to watch",
              type: 3,
              required: true,
            },
          ],
        },
        {
          name: "reload",
          description: "Resend all watched timetables",
          type: 1,
          action: async (interaction: CommandInteraction): Promise<void> => {
            await clearCache();
            timerFnc(generateEDT);
            interaction.reply({
              content: "Timetables reloaded",
              ephemeral: true,
            });
          },
          permissions: [
            {
              id: process.env.OWNER_ID,
              type: "USER",
              permission: true,
            },
          ],
        },
      ],
    },
  ]);
  return true;
};

export const stop = (): void => {
  if (timer) {
    clearInterval(timer);
  }
};
