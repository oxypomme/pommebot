import Logger from "js-logger";
import commands from "./commands";
import client from "./discord";

/*TODO: Orga - Webhook
  New member -> If on server, add role + say hello
  New on Discord -> If in orga, add role + say hello
  New repo -> New channel in category
*/
//TODO: try-catch
//TODO: Config

client.on("ready", function () {
  if (client.user) {
    Logger.get("Discord").info(`Connected as ${client.user.tag}`);
    client.user.setActivity("some GitHub events", { type: "WATCHING" });

    // seekingRepos();
    // setInterval(seekingRepos, 5 * 60 * 1000);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }

  const command = commands.find((c) => c.name === interaction.commandName);
  if (command) {
    command.action(interaction);
  }
});
