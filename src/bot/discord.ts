import { Client, Intents } from "discord.js";
import Logger from "js-logger";

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.login(process.env.BOT_TOKEN);

client.on("error", (e) => Logger.get("Discord").error(e));
client.on("warn", (e) => Logger.get("Discord").warn(e));
client.on("debug", (e) => Logger.get("Discord").debug(e));

export default client;
