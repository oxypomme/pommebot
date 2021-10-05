import { Repository } from "@octokit/webhooks-types";
import { Webhook } from "discord.js";
import GHApp from ".";

export const createWH = async (
  { name, full_name, owner }: Repository,
  { url }: Webhook
): Promise<string[]> => {
  const events = [
    "push",
    "issues",
    "pull_request",
    "check_run",
    "fork",
    "create",
  ];
  await GHApp.octokit.request("POST /repos/{owner}/{repo}/hooks", {
    owner: owner.name || full_name.split("/")[0],
    repo: name,
    events,
    config: {
      content_type: "json",
      url: `${url}/github`,
    },
  });
  return events;
};

export const removeWH = async ({
  name,
  full_name,
  owner,
}: Repository): Promise<void> => {
  const { status, data: webhooks } = await GHApp.octokit.request(
    "GET /repos/{owner}/{repo}/hooks",
    {
      owner: owner.name || full_name.split("/")[0],
      repo: name,
    }
  );
  if (status === 200) {
    for (const { id: hook_id } of webhooks) {
      await GHApp.octokit.request(
        "DELETE /repos/{owner}/{repo}/hooks/{hook_id}",
        {
          owner: owner.name || full_name.split("/")[0],
          repo: name,
          hook_id,
        }
      );
    }
  }
};
