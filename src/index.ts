import { Client } from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();

const client = new Client();
client.login(process.env.BOT_TOKEN);

client.on("ready", async function () {
  if (client.user) {
    console.log(`Connecté en tant que ${client.user.tag}`);
    client.user.setActivity("Un certain type", { type: "WATCHING" });
  }
});
