const [first, second] = process.argv.slice(2);

const [owner, repo] = first?.includes("/")
  ? first.split("/")
  : [first, second];

if (!owner || !repo) {
  console.error("Usage: bun scripts/repo-details.ts <owner> <repo>");
  console.error("   or: bun scripts/repo-details.ts <owner>/<repo>");
  process.exit(1);
}

const BASE_URL = `https://api.github.com/repos/${owner}/${repo}`;

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "github-repo-details",
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
  const [repo, languages, contributors, branches, releases] =
    await Promise.all([
      fetchAPI(),
      fetchAPI("/languages"),
      fetchAPI("/contributors?per_page=10"),
      fetchAPI("/branches?per_page=100"),
      fetchAPI("/releases?per_page=5"),
    ]);

  const details = {
    name: repo.full_name,
    description: repo.description,
    url: repo.html_url,
    homepage: repo.homepage,
    visibility: repo.visibility,
    is_private: repo.private,
    is_fork: repo.fork,
    archived: repo.archived,
    disabled: repo.disabled,

    owner: {
      username: repo.owner.login,
      avatar: repo.owner.avatar_url,
      profile: repo.owner.html_url,
      type: repo.owner.type,
    },

    stats: {
      stars: repo.stargazers_count,
      watchers: repo.watchers_count,
      forks: repo.forks_count,
      open_issues: repo.open_issues_count,
      subscribers: repo.subscribers_count,
      size_kb: repo.size,
    },

    metadata: {
      language: repo.language,
      languages,
      topics: repo.topics,
      license: repo.license?.spdx_id ?? null,
      default_branch: repo.default_branch,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
    },

    features: {
      has_issues: repo.has_issues,
      has_projects: repo.has_projects,
      has_wiki: repo.has_wiki,
      has_pages: repo.has_pages,
      has_discussions: repo.has_discussions,
      has_downloads: repo.has_downloads,
    },

    contributors: contributors.map((c) => ({
      username: c.login,
      contributions: c.contributions,
      profile: c.html_url,
      avatar: c.avatar_url,
    })),

    branches: branches.map((b) => ({
      name: b.name,
      protected: b.protected,
      commit_sha: b.commit.sha,
    })),

    releases: releases.map((r) => ({
      tag: r.tag_name,
      name: r.name,
      description: r.body,
      url: r.html_url,
      published_at: r.published_at,
      prerelease: r.prerelease,
      draft: r.draft,
    })),
  };

  console.log(JSON.stringify(details, null, 2));
}

getRepoDetails().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
