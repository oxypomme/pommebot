import { TextChannel } from "discord.js";
import { Repository } from "@octokit/webhooks-types";
import Logger from "js-logger";
import client from "./discord";
import { ghCreateWH } from "./github";

const guild = () => client.guilds.cache.get(process.env.SERVER_ID || "");

export const createWH = async (
  repo: Repository,
  chan: TextChannel | undefined
): Promise<void> => {
  try {
    const webhook = await chan?.createWebhook(`GitHub-${repo.name}`);
    if (webhook) {
      await ghCreateWH(repo, webhook);
      await chan?.send(
        `Webhook connecté à <https://github.com/${repo.full_name}>`
      );
    }
  } catch (err) {
    Logger.get("Discord").error(err);
    await chan?.delete();
  }
};

export const createChannel = async (repo: Repository): Promise<void> => {
  const chan = await guild()?.channels.create(`🤖${repo.name}`, {
    topic: `https://github.com/${repo.full_name}`,
    parent: process.env.DEFAULT_CATEGORY_ID || "",
  });
  await createWH(repo, chan);
};

export const deleteChannel = async ({
  name,
  full_name,
}: Repository): Promise<void> => {
  const chan = guild()?.channels.cache.find(
    (c) => c.name === `🤖${name.toLowerCase()}`
  ) as TextChannel;
  await chan?.send(`<https://github.com/${full_name}> a été supprimé !`);
  await chan?.delete();
};

export const renameChannel = async (
  from: string,
  to: { full_name: string; name: string }
): Promise<void> => {
  const chan = guild()?.channels.cache.find(
    (c) => c.name === `🤖${from.toLowerCase()}`
  ) as TextChannel;
  await chan?.send(
    `<${chan?.topic}> a été renommé en <https://github.com/${to.full_name}> !`
  );
  await chan?.setTopic(`https://github.com/${to.full_name}`);
  await chan?.setName(`🤖${to.name}`);
};
