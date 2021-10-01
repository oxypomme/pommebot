import { TextChannel } from "discord.js";
import client from "./discord";
import { ghCreateWH } from "./github";

const guild = () => client.guilds.cache.get(process.env.SERVER_ID || "");

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
  const chan = await guild()?.channels.create(`🤖${repoName.split("/")[1]}`, {
    topic: `https://github.com/${repoName}`,
    parent: process.env.DEFAULT_CATEGORY_ID || "",
  });
  await createWH(repoName, chan);
};

export const deleteChannel = async (repoName: string): Promise<void> => {
  const chan = guild()?.channels.cache.find(
    (c) => c.name === `🤖${repoName.toLowerCase().split("/")[1]}`
  );
  await (chan as TextChannel)?.send(
    `<https://github.com/${repoName}> a été supprimé !`
  );
  await chan?.delete();
};

export const renameChannel = async (
  from: string,
  to: string
): Promise<void> => {
  const chan = guild()?.channels.cache.find(
    (c) => c.name === `🤖${from.toLowerCase()}`
  );
  await (chan as TextChannel)?.send(
    `<${
      (chan as TextChannel)?.topic
    }> a été renommé en <https://github.com/${to}> !`
  );
  await chan?.setTopic(`https://github.com/${to}`);
  await chan?.setName(`🤖${to.split("/")[1]}`);
};
