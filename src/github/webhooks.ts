import { Repository } from "@octokit/webhooks-types";
import { Webhook } from "discord.js";
import GHApp, { createGHAuth } from ".";

const getAuth = async ({ name, full_name, owner }: Repository) => {
  const { data: installation } = await GHApp.octokit.request(
    "GET /repos/{owner}/{repo}/installation",
    {
      owner: owner.name || full_name.split("/")[0],
      repo: name,
    }
  );
  return createGHAuth(installation.id);
};

export const createWH = async (
  repo: Repository,
  { url }: Webhook
): Promise<string[]> => {
  const { hook } = await getAuth(repo);
  const events = [
    "push",
    "issues",
    "pull_request",
    "check_run",
    "fork",
    "create",
  ];
  const { name, full_name, owner } = repo;
  await GHApp.octokit.request("POST /repos/{owner}/{repo}/hooks", {
    request: {
      hook,
    },
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

export const removeWH = async (repo: Repository): Promise<void> => {
  const { hook } = await getAuth(repo);

  const { name, full_name, owner } = repo;
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
          request: {
            hook,
          },
          owner: owner.name || full_name.split("/")[0],
          repo: name,
          hook_id,
        }
      );
    }
  }
};
