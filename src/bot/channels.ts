import { Repository, User } from "@octokit/webhooks-types";
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
        description: `Création d'un webhook connecté à [${repo.full_name}](https://github.com/${repo.full_name})`,
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
    description: `[${full_name}](https://github.com/${full_name}) a été supprimé`,
  });
  await chan?.send({ embeds: [embed] });
  await chan?.delete();
};

export const renameChannel = async (
  from: string,
  to: { full_name: string; name: string; owner: User }
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
    description: `[${to.owner.name}/${from}](${chan?.topic}) a été renommé en [${to.full_name}](https://github.com/${to.full_name})>`,
  });
  await chan?.send({ embeds: [embed] });
  await chan?.setTopic(`https://github.com/${to.full_name}`);
  await chan?.setName(`🤖${to.name}`);
};

export const notifyNewPackage = async ({
  registry_package,
  repository,
}: any): Promise<void> => {
  const chan = guild()?.channels.cache.find(
    (c) => c.name === `🤖${repository.name.toLowerCase()}`
  ) as TextChannel;
  const embed = createEmbed({
    title: "Package Disponible",
    author: {
      name: "GitHub",
      iconURL:
        "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    },
    description: `Le package [${registry_package.name}:${registry_package.package_version.container_metadata.tag.name}](${registry_package.package_version.html_url}) est disponible.\nConfiguration nécéssaire sur le VPS pour un déploiement automatique.`,
    fields: [
      {
        name: "Commande docker",
        value: `\`docker service create --name ${repository.name} --publish 808x:80 ${registry_package.package_version.package_url}\``,
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
ProxyPass /${repository.name} "http://127.0.0.1:808x"
        \`\`\``,
      },
    ],
    timestamp: new Date(registry_package.created_at),
  });
  await chan?.send({ embeds: [embed] });
};

export const testMessage = async (): Promise<void> => {
  const chan = guild()?.channels.cache.find(
    (c) => c.name === "bot"
  ) as TextChannel;
  Logger.get("Discord").debug("Test message sent");

  const repository = {
    full_name: "oxypomme/pommebot",
    name: "pommebot",
  };
  const embed = createEmbed({
    title: "Test embed",
    author: {
      name: "OxyTom",
      iconURL: "https://avatars.githubusercontent.com/u/34627360?v=4",
    },
    description: `Simple test d'init\nAvec retour et [MD Links](https://github.com/settings/apps/pommebot)`,
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
ProxyPass /${repository.name} "http://127.0.0.1:808x"
\`\`\``,
      },
    ],
    timestamp: new Date(),
  });
  await chan?.send({ embeds: [embed] });
};
