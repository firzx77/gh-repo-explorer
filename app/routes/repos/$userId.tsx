import { LoaderArgs } from "@remix-run/cloudflare";
import { Octokit } from "octokit";
import { Endpoints } from "@octokit/types";

export type listRepos = Endpoints["GET /users/{username}/repos"]["response"];
export type reposCount = Endpoints["GET /users/{username}"]["response"];

export async function loader({ context, request }: LoaderArgs) {
  const octokit = new Octokit({
    auth: context.GH_TOKEN,
  });

  const url = new URL(request.url);
  const username = url.searchParams.get("username") ?? "";
  const page = Number(url.searchParams.get("page")) ?? 1;

  const res: listRepos = await octokit.request("GET /users/{username}/repos", {
    username,
    per_page: 5,
    page,
  });

  const repos_count: reposCount = await octokit.request(
    "GET /users/{username}",
    {
      username,
    }
  );

  if (!repos_count) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  return {
    ...res,
    username,
    repos_count: repos_count.data.public_repos,
    current_page: page,
  };
}

export const shouldRevalidate = () => {
  return false;
};
