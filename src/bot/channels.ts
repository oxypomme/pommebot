import { PackagePublishedEvent, Repository } from "@octokit/webhooks-types";
import { TextChannel } from "discord.js";
import Logger from "js-logger";
import { createWH as ghCreateWH } from "../github/webhooks";
import client, { createEmbed } from "./discord";

const guild = () => client.guilds.cache.get(process.env.SERVER_ID || "");

export const createWH = async (
  repo: Repository,
  chan: TextChannel | undefined
): Promise<void> => {
  try {
    const webhook = await chan?.createWebhook(`GitHub-${repo.name}`);
    if (webhook) {
      const events = await ghCreateWH(repo, webhook);

      const embed = createEmbed({
        title: "Nouveau repository",
        author: {
          name: "GitHub",
          iconURL:
            "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
        },
        description: `Création d'un webhook connecté à <https://github.com/${repo.full_name}>`,
        fields: [{ name: "Events", value: events.join(", ") }],
        timestamp: new Date(repo.created_at),
      });
      await chan?.send({ embeds: [embed] });
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
  const embed = createEmbed({
    title: "Repository supprimé",
    author: {
      name: "GitHub",
      iconURL:
        "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    },
    description: `<https://github.com/${full_name}> a été supprimé`,
  });
  await chan?.send({ embeds: [embed] });
  await chan?.delete();
};

export const renameChannel = async (
  from: string,
  to: { full_name: string; name: string }
): Promise<void> => {
  const chan = guild()?.channels.cache.find(
    (c) => c.name === `🤖${from.toLowerCase()}`
  ) as TextChannel;
  const embed = createEmbed({
    title: "Repository renommé",
    author: {
      name: "GitHub",
      iconURL:
        "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    },
    description: `<${chan?.topic}> a été renommé en <https://github.com/${to.full_name}>`,
  });
  await chan?.send({ embeds: [embed] });
  await chan?.setTopic(`https://github.com/${to.full_name}`);
  await chan?.setName(`🤖${to.name}`);
};

export const notifyNewPackage = async ({
  package: pckg,
  repository,
}: PackagePublishedEvent): Promise<void> => {
  const chan = guild()?.channels.cache.find(
    (c) => c.name === `🤖${repository.name.toLowerCase()}`
  ) as TextChannel;
  const embed = createEmbed({
    title: "Repository renommé",
    author: {
      name: "GitHub",
      iconURL:
        "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    },
    description: `Le package _${pckg.name}_ (${pckg.package_type}) est disponible [pour ${repository.full_name}](https://github.com/${repository.owner.name}?tab=packages&repo_name=${repository.name}).\nConfiguration nécéssaire sur le VPS pour un déploiement automatique.`,
    fields: [
      {
        name: "Commande docker",
        value: `\`docker service create --name ${chan?.name} --publish 808x:80 ghcr.io/${repository.full_name}:main\``,
      },
      {
        name: "Commande Apache",
        value: "`sudo nano +35 /etc/apache2/sites-available/000-default.conf`",
      },
      {
        name: "Config Apache",
        value: `\`\`\`conf
        # ${repository.name}
        RewriteCond %{HTTP_REFERER} ^https?:\\/\\/.*\\/${repository.name} [NC]
        RewriteRule "^\\/(?!${repository.name})(.+)$" "/${repository.name}/$1" [P,NC]
        ProxyPass /${repository.name} "http://127.0.0.1:808y"
        \`\`\``,
      },
    ],
    timestamp: new Date(pckg.created_at),
  });
  await chan?.send({ embeds: [embed] });
};

export const notifyPackageUpdate = async ({
  package: pckg,
  repository,
}: PackagePublishedEvent): Promise<void> => {
  const chan = guild()?.channels.cache.find(
    (c) => c.name === `🤖${repository.name.toLowerCase()}`
  ) as TextChannel;
  const embed = createEmbed({
    title: "Repository renommé",
    author: {
      name: "GitHub",
      iconURL:
        "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    },
    description: `Une nouvelle version package _${pckg.name}_ (${pckg.package_type}) est disponible [pour ${repository.full_name}](${pckg.html_url}).\nConfiguration nécéssaire sur le VPS pour un déploiement automatique.`,
    timestamp: new Date(pckg.updated_at),
  });
  await chan?.send({ embeds: [embed] });
};
