import { TextChannel } from "discord.js";
import client from "./discord";
import { ghCreateWH } from "./github";

export const createWH = async (
  repoName: string,
  chan: TextChannel | undefined
): Promise<void> => {
  try {
    const webhook = await chan?.createWebhook(
      `GitHub-${repoName.split("/")[1]}`
    );
    if (webhook) {
      await ghCreateWH(repoName, webhook);
      await chan?.send(`Webhook connecté à <https://github.com/${repoName}>`);
    }
  } catch (err) {
    console.log(err);
    await chan?.delete();
  }
};

export const createChannel = async (repoName: string): Promise<void> => {
  const guild = client.guilds.cache.get(process.env.SERVER_ID || "");
  const chan = await guild?.channels.create(`🤖${repoName.split("/")[1]}`, {
    topic: `https://github.com/${repoName}`,
    parent: process.env.DEFAULT_CATEGORY_ID || "",
  });
  await createWH(repoName, chan);
};
