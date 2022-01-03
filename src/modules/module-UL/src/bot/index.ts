import { Dayjs } from "dayjs";
import { CategoryChannel, TextChannel } from "discord.js";
import Logger from "js-logger";
import { client } from "../../../..";
import { createEmbed } from "../../../../bot/discord";

const guild = () => client.guilds.cache.get(process.env.SERVER_ID || "");

export const sendTimetable = async (
  login: string,
  image: string,
  startDate: Dayjs,
  endDate: Dayjs
): Promise<void> => {
  const categ = guild()?.channels.cache.find(
    (c) => c.name === "📅edts"
  ) as CategoryChannel;

  let chan = categ.children.find(
    (c) => c.name === login && c instanceof TextChannel
  ) as TextChannel | undefined;

  if (!chan) {
    chan = (await guild()?.channels.create(login, {
      parent: categ.id,
    })) as TextChannel;
  } else {
    // Delete previous messages
    try {
      await chan.bulkDelete(chan.messages.cache);
    } catch (error) {
      Logger.get("module-UL").warn(error);
    }
  }

  // Send EDT
  const embed = createEmbed({
    title: `${login} - EDT`,
    author: {
      name: "UL",
      iconURL: "https://multi.univ-lorraine.fr/favicon.png",
    },
    description: "Emploi du temps mis à jour.",
    fields: [
      {
        name: "Début",
        value: startDate.format("DD/MM/YYYY"),
        inline: true,
      },
      {
        name: "Fin",
        value: endDate.format("DD/MM/YYYY"),
        inline: true,
      },
    ],
    image: {
      url: image,
    },
  });
  await chan?.send({ embeds: [embed] });
};
