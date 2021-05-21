import "./.env";
import { createChannel } from "./channels";
import client from "./discord";
import { ghFetch } from "./github";

//TODO: Removing ADMIN permission
//TODO: try-catch
//TODO: Config

let lastGhEvent: any = {
  id: "",
};

const seekingNewRepos = async () => {
  const result = await ghFetch(lastGhEvent);
  console.log(`fetched from octokit at ${new Date().toLocaleTimeString()}`);
  if (result) {
    lastGhEvent = result;
    await createChannel(result.repo.name);
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
