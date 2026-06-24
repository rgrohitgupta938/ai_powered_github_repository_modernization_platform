import { graphql } from "@octokit/graphql";
import { Octokit } from "@octokit/rest";
import { GithubClientError, GithubTokenMissingError } from "./errors.js";
import { getRateLimitWaitMs, sleep } from "./rate-limit.js";
import type {
  GithubClient,
  ListReposOptions,
  RateLimitStatus,
  RepoSummary,
  TreeEntry,
} from "./types.js";

interface GithubClientConfig {
  token?: string;
}

interface GraphqlRepoNode {
  name: string;
  nameWithOwner: string;
  isFork: boolean;
  isArchived: boolean;
  stargazerCount: number;
  forkCount: number;
  pushedAt: string;
  updatedAt: string;
  primaryLanguage?: {
    name: string;
  } | null;
  repositoryTopics: {
    nodes: Array<{
      topic: {
        name: string;
      };
    }>;
  };
  owner: {
    login: string;
  };
}

interface ViewerReposResponse {
  viewer: {
    repositories: {
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
      nodes: GraphqlRepoNode[];
    };
  };
}

interface OrgReposResponse {
  organization: {
    repositories: {
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
      nodes: GraphqlRepoNode[];
    };
  };
}

const VIEWER_REPOS_QUERY = `
  query ListViewerRepos(
    $cursor: String,
    $perPage: Int!,
    $affiliations: [RepositoryAffiliation!]
  ) {
    viewer {
      repositories(
        first: $perPage,
        after: $cursor,
        ownerAffiliations: $affiliations,
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          name
          nameWithOwner
          isFork
          isArchived
          stargazerCount
          forkCount
          pushedAt
          updatedAt
          primaryLanguage {
            name
          }
          repositoryTopics(first: 10) {
            nodes {
              topic {
                name
              }
            }
          }
          owner {
            login
          }
        }
      }
    }
  }
`;

const ORG_REPOS_QUERY = `
  query ListOrgRepos(
    $org: String!,
    $cursor: String,
    $perPage: Int!
  ) {
    organization(login: $org) {
      repositories(
        first: $perPage,
        after: $cursor,
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          name
          nameWithOwner
          isFork
          isArchived
          stargazerCount
          forkCount
          pushedAt
          updatedAt
          primaryLanguage {
            name
          }
          repositoryTopics(first: 10) {
            nodes {
              topic {
                name
              }
            }
          }
          owner {
            login
          }
        }
      }
    }
  }
`;

export class OctokitGithubClient implements GithubClient {
  private readonly rest: Octokit;
  private readonly graphqlWithAuth: typeof graphql;

  constructor(config: GithubClientConfig = {}) {
    const token = config.token ?? process.env.GITHUB_TOKEN;

    if (!token) {
      throw new GithubTokenMissingError();
    }

    this.rest = new Octokit({
      auth: token,
    });

    this.graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${token}`,
      },
    });
  }

  async listUserRepos(opts: ListReposOptions = {}): Promise<RepoSummary[]> {
    const perPage = Math.min(opts.perPage ?? 100, 100);
    const affiliation = opts.affiliation ?? "OWNER";

    const repos: RepoSummary[] = [];
    let cursor: string | null = null;

    do {
      await this.pauseIfNearRateLimit();

      const response: ViewerReposResponse = await this.graphqlWithAuth<ViewerReposResponse>(
        VIEWER_REPOS_QUERY,
        {
          cursor,
          perPage,
          affiliations: [affiliation],
        },
      );

      const page = response.viewer.repositories;

      repos.push(...page.nodes.map(this.mapRepoNode));

      cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
    } while (cursor);

    return this.applyFilters(repos, opts);
  }

  async listOrgRepos(org: string, opts: ListReposOptions = {}): Promise<RepoSummary[]> {
    const perPage = Math.min(opts.perPage ?? 100, 100);

    const repos: RepoSummary[] = [];
    let cursor: string | null = null;

    do {
      await this.pauseIfNearRateLimit();

      const response: OrgReposResponse = await this.graphqlWithAuth<OrgReposResponse>(
        ORG_REPOS_QUERY,
        {
          org,
          cursor,
          perPage,
        },
      );

      const page = response.organization.repositories;

      repos.push(...page.nodes.map(this.mapRepoNode));

      cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
    } while (cursor);

    return this.applyFilters(repos, opts);
  }

  async getRepoTree(owner: string, repo: string, ref?: string): Promise<TreeEntry[]> {
    try {
      await this.pauseIfNearRateLimit();

      const treeSha = await this.resolveTreeSha(owner, repo, ref);

      const response = await this.rest.git.getTree({
        owner,
        repo,
        tree_sha: treeSha,
        recursive: "true",
      });

      return response.data.tree
        .filter((entry) => entry.path && entry.type && entry.sha)
        .map((entry) => {
          const treeEntry: TreeEntry = {
            path: entry.path as string,
            type: entry.type as TreeEntry["type"],
            sha: entry.sha as string,
          };
          if (entry.size !== undefined) {
            treeEntry.size = entry.size;
          }
          return treeEntry;
        });
    } catch (error) {
      throw new GithubClientError(`Failed to fetch repository tree for ${owner}/${repo}`, error);
    }
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
    try {
      await this.pauseIfNearRateLimit();

      const response = await this.rest.repos.getContent({
        owner,
        repo,
        path,
      });

      if (Array.isArray(response.data) || response.data.type !== "file") {
        return null;
      }

      if (!("content" in response.data) || !response.data.content) {
        return null;
      }

      return Buffer.from(response.data.content.replace(/\n/g, ""), "base64").toString("utf8");
    } catch (error: unknown) {
      if (this.isNotFoundError(error)) {
        return null;
      }

      throw new GithubClientError(`Failed to fetch file ${path} from ${owner}/${repo}`, error);
    }
  }

  async getRateLimitStatus(): Promise<RateLimitStatus> {
    const response = await this.rest.rateLimit.get();

    const graphqlLimit = response.data.resources?.graphql;
    if (!graphqlLimit) {
      throw new GithubClientError("GraphQL rate limit data is unavailable");
    }

    return {
      limit: graphqlLimit.limit,
      remaining: graphqlLimit.remaining,
      resetAt: new Date(graphqlLimit.reset * 1000),
    };
  }

  private async pauseIfNearRateLimit(): Promise<void> {
    const status = await this.getRateLimitStatus();

    if (status.remaining > 1) {
      return;
    }

    const waitMs = getRateLimitWaitMs(status.resetAt);
    await sleep(waitMs);
  }

  private async resolveTreeSha(owner: string, repo: string, ref?: string): Promise<string> {
    const branch =
      ref ??
      (
        await this.rest.repos.get({
          owner,
          repo,
        })
      ).data.default_branch;

    try {
      const branchResponse = await this.rest.repos.getBranch({
        owner,
        repo,
        branch,
      });

      return branchResponse.data.commit.commit.tree.sha;
    } catch {
      const commitResponse = await this.rest.git.getCommit({
        owner,
        repo,
        commit_sha: branch,
      });

      return commitResponse.data.tree.sha;
    }
  }

  private mapRepoNode(node: GraphqlRepoNode): RepoSummary {
    return {
      name: node.name,
      nameWithOwner: node.nameWithOwner,
      owner: node.owner.login,
      isFork: node.isFork,
      isArchived: node.isArchived,
      stars: node.stargazerCount,
      forks: node.forkCount,
      pushedAt: new Date(node.pushedAt),
      updatedAt: new Date(node.updatedAt),
      primaryLanguage: node.primaryLanguage?.name ?? null,
      topics: node.repositoryTopics.nodes.map((item) => item.topic.name),
    };
  }

  private applyFilters(repos: RepoSummary[], opts: ListReposOptions): RepoSummary[] {
    const topicAllowList = new Set((opts.topics ?? []).map((topic: string) => topic.toLowerCase()));

    return repos.filter((repo) => {
      if (!opts.includeForks && repo.isFork) {
        return false;
      }

      if (!opts.includeArchived && repo.isArchived) {
        return false;
      }

      if (opts.minStars !== undefined && repo.stars < opts.minStars) {
        return false;
      }

      if (topicAllowList.size > 0) {
        const repoTopics = repo.topics.map((topic: string) => topic.toLowerCase());
        const hasAllowedTopic = repoTopics.some((topic: string) => topicAllowList.has(topic));

        if (!hasAllowedTopic) {
          return false;
        }
      }

      return true;
    });
  }

  private isNotFoundError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as Record<string, unknown>).status === "number" &&
      (error as Record<string, unknown>).status === 404
    );
  }
}

export function createGithubClient(config: GithubClientConfig = {}): GithubClient {
  return new OctokitGithubClient(config);
}
