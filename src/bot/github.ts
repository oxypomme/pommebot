import { Octokit } from "@octokit/core";
import { Webhook } from "discord.js";

const octokit = new Octokit({ auth: process.env.GH_AUTH });

export const ghCreateWH = async (
  name: string,
  { url }: Webhook
): Promise<void> => {
  await octokit.request("POST /repos/{owner}/{repo}/hooks", {
    owner: name.split("/")[0],
    repo: name.split("/")[1],
    events: ["push", "issues", "pull_request", "check_run", "fork", "create"],
    config: {
      content_type: "json",
      url: `${url}/github`,
    },
  });
};

export const ghRemoveWH = async (name: string): Promise<void> => {
  const { status, data: webhooks } = await octokit.request(
    "GET /repos/{owner}/{repo}/hooks",
    {
      owner: name.split("/")[0],
      repo: name.split("/")[1],
    }
  );
  if (status === 200) {
    for (const { id: hook_id } of webhooks) {
      await octokit.request("DELETE /repos/{owner}/{repo}/hooks/{hook_id}", {
        owner: name.split("/")[0],
        repo: name.split("/")[1],
        hook_id,
      });
    }
  }
};
