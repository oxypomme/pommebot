import "./.env";
import { createChannel, deleteChannel } from "./channels";
import client from "./discord";
import { ghFetch } from "./github";

/*TODO: Orga - Webhook
  New member -> If on server, add role + say hello
  New on Discord -> If in orga, add role + say hello
  New repo -> New channel in category
*/
//TODO: try-catch
//TODO: Config

let lastGhEvent: any = {};

const seekingRepos = async () => {
  const result = await ghFetch(lastGhEvent);
  console.log(`fetched from octokit at ${new Date().toLocaleTimeString()}`);
  if (result.lastCreate || result.lastDelete) {
    lastGhEvent = result;
  }
  if (result.lastCreate) {
    await createChannel(result.lastCreate.repo.name);
  }
  if (result.lastDelete) {
    await deleteChannel(result.lastDelete.repo.name);
  }
};

client.on("ready", async function () {
  if (client.user) {
    console.log(`Connecté en tant que ${client.user.tag}`);
    await client.user.setActivity("@OxyTom#1831", { type: "WATCHING" });

    seekingRepos();
    setInterval(seekingRepos, 5 * 60 * 1000);
  }
});
