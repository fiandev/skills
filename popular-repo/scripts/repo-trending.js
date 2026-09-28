import { pathToFileURL } from "node:url";
const BASE_URL = "https://api.github.com/search/repositories";
const PERIODS = {
  "1day": 1,
  "1week": 7,
  "1month": 30
};
async function getTrending(period) {
  const days = PERIODS[period];
  if (!days) {
    throw new Error(
      `Invalid period "${period}". Use one of: ${Object.keys(PERIODS).join(", ")}`
    );
  }
  const since = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
  const params = new URLSearchParams({
    q: `pushed:>=${since}`,
    sort: "stars",
    order: "desc",
    per_page: "20"
  });
  const response = await fetch(`${BASE_URL}?${params}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "github-trending-fetcher"
    }
  });
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  }
  const data = await response.json();
  return {
    period,
    filter: "pushed",
    since,
    total: data.total_count,
    repositories: (data.items ?? []).map((repo, index) => ({
      rank: index + 1,
      name: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      created_at: repo.created_at,
      updated_at: repo.updated_at
    }))
  };
}
const isMain = process.argv[1] != null && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const arg = process.argv[2] ?? "1week";
  getTrending(arg).then((result) => console.log(JSON.stringify(result, null, 2))).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
export {
  getTrending
};
