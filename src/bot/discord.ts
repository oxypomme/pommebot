import { Client, Intents, MessageEmbed, MessageEmbedOptions } from "discord.js";
import Logger from "js-logger";

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.login(process.env.BOT_TOKEN);

client.on("error", (e) => Logger.get("Discord").error(e));
client.on("warn", (e) => Logger.get("Discord").warn(e));
client.on("debug", (e) => Logger.get("Discord").debug(e));

export const createEmbed = (data?: MessageEmbedOptions): MessageEmbed =>
  new MessageEmbed({
    footer: {
      text: "by @OxyTom#1831",
      iconURL:
        "https://cdn.discordapp.com/avatars/845027189552054302/3244763092c20218c6c74adfa854a841.png?size=4096",
    },
    timestamp: new Date(),
    ...data,
  });

export default client;
