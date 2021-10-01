import { Client } from "discord.js";

const client = new Client();
client.login(process.env.BOT_TOKEN);

client.on("error", (e) =>
  console.log(`${new Date().toLocaleString()} - {DISCORD} - ERROR :`, e)
);
client.on("warn", (e) =>
  console.log(`${new Date().toLocaleString()} - {DISCORD} - WARN :`, e)
);
client.on("debug", (e) =>
  console.log(`${new Date().toLocaleString()} - {DISCORD} - DEBUG :`, e)
);

export default client;
