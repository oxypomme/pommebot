import { Client } from "discord.js";
import "./env";
import { ghCreateWH, ghFetch } from "./github";

const client = new Client();
client.login(process.env.BOT_TOKEN);

let lastGhEvent: any = {
  id: "",
};

const seekingNewRepos = async () => {
  const guild = client.guilds.cache.get(process.env.SERVER_ID || "");

  const result = await ghFetch(lastGhEvent);
  console.log(`fetched from octokit at ${new Date().toLocaleTimeString()}`);
  if (result) {
    lastGhEvent = result;
    const chan = await guild?.channels.create(
      `🤖${result.repo.name.split("/")[1]}`
    );
    try {
      await chan?.setTopic(`https://github.com/${result.repo.name}`);
      await chan?.setParent(process.env.DEFAULT_CATEGORY_ID || "");

      const webhook = await chan?.createWebhook(
        `GitHub-${result.repo.name.split("/")[1]}`
      );
      if (webhook) {
        await ghCreateWH(result.repo, webhook);
        await chan?.send(
          `Webhook connecté à <https://github.com/${result.repo.name}>`
        );
      }
    } catch (err) {
      console.log(err);
      await chan?.delete();
    }
  }
};

client.on("ready", async function () {
  if (client.user) {
    console.log(`Connecté en tant que ${client.user.tag}`);
    await client.user.setActivity("@OxyTom#1831", { type: "WATCHING" });

    seekingNewRepos();
    setInterval(seekingNewRepos, 5 * 60 * 1000);
  }
});

client.on("error", (e) => console.log(e));
client.on("warn", (e) => console.log(e));
client.on("debug", (e) => console.log(e));
