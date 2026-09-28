const [first, second] = process.argv.slice(2);
const [owner, repo] = first?.includes("/") ? first.split("/") : [first, second];
if (!owner || !repo) {
  console.error("Usage: node scripts/repo-details.js <owner> <repo>");
  console.error("   or: node scripts/repo-details.js <owner>/<repo>");
  console.error("   or: bun scripts/repo-details.ts <owner> <repo>");
  console.error("   or: bun scripts/repo-details.ts <owner>/<repo>");
  process.exit(1);
}
const BASE_URL = `https://api.github.com/repos/${owner}/${repo}`;
const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "github-repo-details"
};
async function fetchAPI(endpoint = "") {
  const response = await fetch(`${BASE_URL}${endpoint}`, { headers });
  if (!response.ok) {
    throw new Error(
      `GitHub API ${response.status}: ${await response.text()}`
    );
  }
  return response.json();
}
async function getRepoDetails() {
  const [repo2, languages, contributors, branches, releases] = await Promise.all([
    fetchAPI(),
    fetchAPI("/languages"),
    fetchAPI("/contributors?per_page=10"),
    fetchAPI("/branches?per_page=100"),
    fetchAPI("/releases?per_page=5")
  ]);
  const details = {
    name: repo2.full_name,
    description: repo2.description,
    url: repo2.html_url,
    homepage: repo2.homepage,
    visibility: repo2.visibility,
    is_private: repo2.private,
    is_fork: repo2.fork,
    archived: repo2.archived,
    disabled: repo2.disabled,
    owner: {
      username: repo2.owner.login,
      avatar: repo2.owner.avatar_url,
      profile: repo2.owner.html_url,
      type: repo2.owner.type
    },
    stats: {
      stars: repo2.stargazers_count,
      watchers: repo2.watchers_count,
      forks: repo2.forks_count,
      open_issues: repo2.open_issues_count,
      subscribers: repo2.subscribers_count,
      size_kb: repo2.size
    },
    metadata: {
      language: repo2.language,
      languages,
      topics: repo2.topics,
      license: repo2.license?.spdx_id ?? null,
      default_branch: repo2.default_branch,
      created_at: repo2.created_at,
      updated_at: repo2.updated_at,
      pushed_at: repo2.pushed_at
    },
    features: {
      has_issues: repo2.has_issues,
      has_projects: repo2.has_projects,
      has_wiki: repo2.has_wiki,
      has_pages: repo2.has_pages,
      has_discussions: repo2.has_discussions,
      has_downloads: repo2.has_downloads
    },
    contributors: contributors.map((c) => ({
      username: c.login,
      contributions: c.contributions,
      profile: c.html_url,
      avatar: c.avatar_url
    })),
    branches: branches.map((b) => ({
      name: b.name,
      protected: b.protected,
      commit_sha: b.commit.sha
    })),
    releases: releases.map((r) => ({
      tag: r.tag_name,
      name: r.name,
      description: r.body,
      url: r.html_url,
      published_at: r.published_at,
      prerelease: r.prerelease,
      draft: r.draft
    }))
  };
  console.log(JSON.stringify(details, null, 2));
}
getRepoDetails().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
