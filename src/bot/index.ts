import client from "./discord";

/*TODO: Orga - Webhook
  New member -> If on server, add role + say hello
  New on Discord -> If in orga, add role + say hello
  New repo -> New channel in category
*/
//TODO: try-catch
//TODO: Config

client.on("ready", async function () {
  if (client.user) {
    console.log(`Connecté en tant que ${client.user.tag}`);
    await client.user.setActivity("@OxyTom#1831", { type: "WATCHING" });

    // seekingRepos();
    // setInterval(seekingRepos, 5 * 60 * 1000);
  }
});
