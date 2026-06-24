export type RepoAffiliation = "OWNER" | "COLLABORATOR" | "ORGANIZATION_MEMBER";

export interface RepoSummary {
  name: string;
  nameWithOwner: string;
  owner: string;
  isFork: boolean;
  isArchived: boolean;
  stars: number;
  forks: number;
  pushedAt: Date;
  updatedAt: Date;
  primaryLanguage?: string | null;
  topics: string[];
}

export interface TreeEntry {
  path: string;
  type: "blob" | "tree" | "commit";
  size?: number;
  sha: string;
}

export interface RateLimitStatus {
  limit: number;
  remaining: number;
  resetAt: Date;
}

export interface ListReposOptions {
  affiliation?: RepoAffiliation;
  perPage?: number;
  includeForks?: boolean;
  includeArchived?: boolean;
  minStars?: number;
  topics?: string[];
}

export interface GithubClient {
  listUserRepos(opts?: ListReposOptions): Promise<RepoSummary[]>;
  listOrgRepos(org: string, opts?: ListReposOptions): Promise<RepoSummary[]>;
  getRepoTree(owner: string, repo: string, ref?: string): Promise<TreeEntry[]>;
  getFileContent(owner: string, repo: string, path: string): Promise<string | null>;
  getRateLimitStatus(): Promise<RateLimitStatus>;
}
