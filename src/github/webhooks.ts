import GHApp from ".";
import { Repository } from "@octokit/webhooks-types";

import { Webhook } from "discord.js";

export const createWH = async (
  { name, full_name, owner }: Repository,
  { url }: Webhook
): Promise<void> => {
  await GHApp.octokit.request("POST /repos/{owner}/{repo}/hooks", {
    owner: owner.name || full_name.split("/")[0],
    repo: name,
    events: ["push", "issues", "pull_request", "check_run", "fork", "create"],
    config: {
      content_type: "json",
      url: `${url}/github`,
    },
  });
};

export const removeWH = async (name: string): Promise<void> => {
  const { status, data: webhooks } = await GHApp.octokit.request(
    "GET /repos/{owner}/{repo}/hooks",
    {
      owner: name.split("/")[0],
      repo: name.split("/")[1],
    }
  );
  if (status === 200) {
    for (const { id: hook_id } of webhooks) {
      await GHApp.octokit.request(
        "DELETE /repos/{owner}/{repo}/hooks/{hook_id}",
        {
          owner: name.split("/")[0],
          repo: name.split("/")[1],
          hook_id,
        }
      );
    }
  }
};
