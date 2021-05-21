import { Client } from "discord.js";

const client = new Client();
client.login(process.env.BOT_TOKEN);

client.on("error", (e) => console.log(e));
client.on("warn", (e) => console.log(e));
client.on("debug", (e) => console.log(e));

export default client;
