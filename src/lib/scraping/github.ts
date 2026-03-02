interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  location: string | null;
  blog: string | null;
  created_at: string;
}

interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  fork: boolean;
  size: number;
  default_branch: string;
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      date: string;
    };
  };
}

interface RepoLanguages {
  [language: string]: number;
}

export interface ScrapedGitHubData {
  user: GitHubUser;
  repos: GitHubRepo[];
  repoDetails: RepoDetail[];
  totalCommits: number;
  languageBreakdown: { name: string; bytes: number; percentage: number }[];
}

export interface RepoDetail {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  readme: string | null;
  packageJson: Record<string, unknown> | null;
  recentCommits: { message: string; date: string }[];
  languages: RepoLanguages;
  directoryStructure: string[];
  is_fork: boolean;
}

const GITHUB_API = "https://api.github.com";

function getToken(token?: string): string {
  return token || process.env.GITHUB_ACCESS_TOKEN || "";
}

async function githubFetch<T>(path: string, token?: string): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${getToken(token)}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Claimless-Scraper",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`GitHub resource not found: ${path}`);
    }
    if (response.status === 403) {
      const rateLimitReset = response.headers.get("X-RateLimit-Reset");
      throw new Error(
        `GitHub rate limit hit. Resets at: ${rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toISOString() : "unknown"}`
      );
    }
    throw new Error(`GitHub API error: ${response.status} on ${path}`);
  }

  return response.json() as Promise<T>;
}

async function fetchUser(username: string, token?: string): Promise<GitHubUser> {
  return githubFetch<GitHubUser>(`/users/${username}`, token);
}

async function fetchRepos(username: string, token?: string): Promise<GitHubRepo[]> {
  // When we have the user's OAuth token, use /user/repos to include private repos.
  // The /users/{username}/repos endpoint only returns public repos regardless of auth.
  if (token) {
    const repos = await githubFetch<GitHubRepo[]>(
      `/user/repos?sort=pushed&per_page=100&affiliation=owner`,
      token
    );
    return repos;
  }

  const repos = await githubFetch<GitHubRepo[]>(
    `/users/${username}/repos?sort=pushed&per_page=100&type=all`,
    token
  );
  return repos;
}

async function fetchRepoReadme(fullName: string, token?: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${GITHUB_API}/repos/${fullName}/readme`,
      {
        headers: {
          Authorization: `Bearer ${getToken(token)}`,
          Accept: "application/vnd.github.v3.raw",
          "User-Agent": "Claimless-Scraper",
        },
      }
    );
    if (!response.ok) return null;
    const text = await response.text();
    return text.length > 3000 ? text.substring(0, 3000) + "\n...[truncated]" : text;
  } catch {
    return null;
  }
}

async function fetchPackageJson(
  fullName: string,
  defaultBranch: string,
  token?: string
): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(
      `${GITHUB_API}/repos/${fullName}/contents/package.json?ref=${defaultBranch}`,
      {
        headers: {
          Authorization: `Bearer ${getToken(token)}`,
          Accept: "application/vnd.github.v3.raw",
          "User-Agent": "Claimless-Scraper",
        },
      }
    );
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function fetchRepoLanguages(fullName: string, token?: string): Promise<RepoLanguages> {
  try {
    return await githubFetch<RepoLanguages>(`/repos/${fullName}/languages`, token);
  } catch {
    return {};
  }
}

async function fetchRecentCommits(
  fullName: string,
  username: string,
  token?: string
): Promise<{ message: string; date: string }[]> {
  try {
    const commits = await githubFetch<GitHubCommit[]>(
      `/repos/${fullName}/commits?author=${username}&per_page=10`,
      token
    );
    return commits.map((c) => ({
      message: c.commit.message.split("\n")[0],
      date: c.commit.author.date,
    }));
  } catch {
    return [];
  }
}

async function fetchDirectoryStructure(
  fullName: string,
  defaultBranch: string,
  token?: string
): Promise<string[]> {
  try {
    const tree = await githubFetch<{
      tree: { path: string; type: string }[];
    }>(`/repos/${fullName}/git/trees/${defaultBranch}?recursive=1`, token);

    return tree.tree
      .filter((item) => {
        const depth = item.path.split("/").length;
        return depth <= 2;
      })
      .map((item) => `${item.type === "tree" ? "\u{1F4C1}" : "\u{1F4C4}"} ${item.path}`)
      .slice(0, 50);
  } catch {
    return [];
  }
}

export async function scrapeGitHubProfile(
  username: string,
  accessToken?: string
): Promise<ScrapedGitHubData> {
  console.log(`[GitHub Scraper] Starting scrape for: ${username}, accessToken provided: ${!!accessToken}`);

  const user = await fetchUser(username, accessToken);
  console.log(`[GitHub Scraper] User found: ${user.name || user.login} — ${user.public_repos} public repos`);

  const repos = await fetchRepos(username, accessToken);
  console.log(`[GitHub Scraper] Fetched ${repos.length} repos (using ${accessToken ? "authenticated /user/repos" : "public /users endpoint"})`);

  const topRepos = [...repos]
    .sort((a, b) => {
      if (b.stargazers_count !== a.stargazers_count) {
        return b.stargazers_count - a.stargazers_count;
      }
      return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
    })
    .slice(0, 10);

  console.log(`[GitHub Scraper] Fetching details for ${topRepos.length} top repos...`);
  const repoDetails: RepoDetail[] = await Promise.all(
    topRepos.map(async (repo) => {
      const [readme, packageJson, languages, recentCommits, directoryStructure] =
        await Promise.all([
          fetchRepoReadme(repo.full_name, accessToken),
          fetchPackageJson(repo.full_name, repo.default_branch, accessToken),
          fetchRepoLanguages(repo.full_name, accessToken),
          fetchRecentCommits(repo.full_name, username, accessToken),
          fetchDirectoryStructure(repo.full_name, repo.default_branch, accessToken),
        ]);

      return {
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        topics: repo.topics,
        readme,
        packageJson,
        recentCommits,
        languages,
        directoryStructure,
        is_fork: repo.fork,
      };
    })
  );

  const totalLanguageBytes: Record<string, number> = {};
  for (const detail of repoDetails) {
    for (const [lang, bytes] of Object.entries(detail.languages)) {
      totalLanguageBytes[lang] = (totalLanguageBytes[lang] || 0) + bytes;
    }
  }
  const totalBytes = Object.values(totalLanguageBytes).reduce(
    (sum, b) => sum + b,
    0
  );
  const languageBreakdown = Object.entries(totalLanguageBytes)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
    }))
    .sort((a, b) => b.bytes - a.bytes);

  const totalCommits = repoDetails.reduce(
    (sum, repo) => sum + repo.recentCommits.length,
    0
  );

  console.log(`[GitHub Scraper] Scrape complete. ${repoDetails.length} repos analyzed, ${languageBreakdown.length} languages detected.`);

  return {
    user,
    repos,
    repoDetails,
    totalCommits,
    languageBreakdown,
  };
}
