import { CommandInteraction } from "discord.js";
import Logger from "js-logger";
import { addCommand } from "../../bot/commands";
import getConfig from "../../config";
import { clearCache, generateEDT } from "./src/express/multi";

let timer: NodeJS.Timer;

const timerFnc = async () => {
  Logger.get("module-UL").info("Checking EDTs");
  try {
    const config = getConfig();
    if (config.ul && config.ul.logins) {
      await Promise.all(
        Object.entries(config.ul.logins).map(([login, resourceId]) =>
          generateEDT(login, resourceId as number)
        )
      );
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

  await timerFnc();
  timer = setInterval(async () => await timerFnc(), 60 * 60 * 1000);

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
            const resourceId = interaction.options.getString("resourceId");
            if (!login || !resourceId) {
              interaction.reply({
                content: "At least on param is incorrect",
                ephemeral: true,
              });
              return;
            }

            const config = getConfig();

            const logins = config.ul?.logins ?? {};
            logins[login] = parseInt(resourceId);
            config.add({
              ul: {
                ...config.ul,
                logins,
              },
            });

            interaction.reply({
              content: "Config updated",
              ephemeral: true,
            });
            await generateEDT(login, parseInt(resourceId));
          },
          options: [
            {
              name: "login",
              description: "The login of the user",
              type: 3,
              required: true,
            },
            {
              name: "resourceId",
              description: "The resourceId to watch",
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
            await timerFnc();
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
