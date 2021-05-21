import { Octokit } from "@octokit/core";
import { Webhook } from "discord.js";

const octokit = new Octokit({ auth: process.env.GH_AUTH });
const startDate = new Date();

export const ghFetch = ({ lastCreate, lastDelete }: any): Promise<any | null> =>
  new Promise((resolve) => {
    octokit
      .request("GET /users/{username}/events/public", {
        username: process.env.GH_USERNAME || "",
      })
      .then(({ status, data }) => {
        if (status === 200) {
          const newCreate = data.filter(
            ({ type, created_at, payload }) =>
              type === "CreateEvent" &&
              (payload as any).ref_type === "repository" &&
              (created_at ? new Date(created_at) > startDate : false)
          )[0];

          const newDelete = data.filter(
            ({ type, created_at, payload }) =>
              type === "DeleteEvent" &&
              (payload as any).ref_type === "repository" &&
              (created_at ? new Date(created_at) > startDate : false)
          )[0];

          let result = {};
          if (lastCreate?.id !== newCreate?.id) {
            result = {
              ...result,
              lastCreate: newCreate,
            };
          }
          if (lastDelete?.id !== newDelete?.id) {
            result = {
              ...result,
              lastDelete: newDelete,
            };
          }
          resolve(result);
        }
      });
  });

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
