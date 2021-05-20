import { Octokit } from "@octokit/core";
import { Webhook } from "discord.js";

const octokit = new Octokit({ auth: process.env.GH_AUTH });
const startDate = new Date();

export const ghFetch = ({ id: lastId }: any): Promise<any | null> =>
  new Promise((resolve) => {
    octokit
      .request("GET /users/{username}/events/public", {
        username: process.env.GH_USERNAME || "",
      })
      .then(({ status, data }) => {
        if (status === 200) {
          const evs = data.filter(
            ({ type, created_at, payload }) =>
              type === "CreateEvent" &&
              (payload as any).ref_type === "repository" &&
              (created_at ? new Date(created_at) > startDate : false)
          );
          if (lastId !== evs[0]?.id) {
            resolve(evs[0]);
          } else {
            resolve(null);
          }
        }
      });
  });

export const ghCreateWH = async (
  { name }: any,
  { url }: Webhook
): Promise<void> => {
  console.log(name.split("/"));
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
