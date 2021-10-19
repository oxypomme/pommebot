import { CommandInteraction } from "discord.js";
import Logger from "js-logger";
import { addCommand } from "../../bot/commands";
import config from "../../config";
import { clearCache, generateEDT } from "./src/express/multi";

let timer: NodeJS.Timer;

const timerFnc = () => {
  try {
    if (config.ul && config.ul.logins) {
      for (const login of config.ul.logins) {
        generateEDT(login);
      }
    } else {
      Logger.get("module-UL").error(
        "config.ul or config.ul.logins is undefined",
        config
      );
    }
  } catch (error) {
    Logger.get("module-UL").error(error);
  }
};

export const start = async (): Promise<boolean> => {
  // Start express
  import("./src/express");

  timer = setInterval(() => timerFnc(), 60 * 60 * 1000);

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
            timerFnc();
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
