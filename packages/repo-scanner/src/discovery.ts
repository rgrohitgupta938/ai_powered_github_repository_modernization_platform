import { createGithubClient, type ListReposOptions, type RepoSummary } from "@repo/github-client";
import { prisma } from "@repo/db";
import { computeRepoDerivedMetrics } from "./metrics.js";

export interface RepositoryDiscoveryOptions extends ListReposOptions {
  org?: string;
}

export interface RepositoryDiscoveryResult {
  runId: string;
  repoCount: number;
  staleRepoCount: number;
  reposWithoutTopics: number;
}

export async function runRepositoryDiscovery(
  options: RepositoryDiscoveryOptions = {},
): Promise<RepositoryDiscoveryResult> {
  const run = await prisma.run.create({
    data: {
      type: "discovery",
      status: "running",
      repoCount: 0,
    },
  });

  try {
    const client = createGithubClient();

    const repos = options.org
      ? await client.listOrgRepos(options.org, options)
      : await client.listUserRepos(options);

    const summary = await persistRepositories(repos);

    await prisma.run.update({
      where: {
        id: run.id,
      },
      data: {
        status: "success",
        finishedAt: new Date(),
        repoCount: repos.length,
      },
    });

    return {
      runId: run.id,
      repoCount: repos.length,
      staleRepoCount: summary.staleRepoCount,
      reposWithoutTopics: summary.reposWithoutTopics,
    };
  } catch (error) {
    await prisma.run.update({
      where: {
        id: run.id,
      },
      data: {
        status: "failed",
        finishedAt: new Date(),
        error: getErrorMessage(error),
      },
    });

    throw error;
  }
}

async function persistRepositories(repos: RepoSummary[]): Promise<{
  staleRepoCount: number;
  reposWithoutTopics: number;
}> {
  let staleRepoCount = 0;
  let reposWithoutTopics = 0;

  for (const repo of repos) {
    const previous = await prisma.repository.findUnique({
      where: {
        nameWithOwner: repo.nameWithOwner,
      },
      select: {
        stars: true,
        lastScannedAt: true,
      },
    });

    const metrics = computeRepoDerivedMetrics(repo, previous);

    if (metrics.isStale) {
      staleRepoCount += 1;
    }

    if (!metrics.hasTopics) {
      reposWithoutTopics += 1;
    }

    await prisma.repository.upsert({
      where: {
        nameWithOwner: repo.nameWithOwner,
      },
      create: {
        nameWithOwner: repo.nameWithOwner,
        name: repo.name,
        owner: repo.owner,
        isFork: repo.isFork,
        isArchived: repo.isArchived,
        stars: repo.stars,
        forks: repo.forks,
        ...(repo.primaryLanguage !== undefined && { primaryLanguage: repo.primaryLanguage }),
        topics: repo.topics,
        pushedAt: repo.pushedAt,
        updatedAt: repo.updatedAt,
        lastScannedAt: new Date(),
      },
      update: {
        name: repo.name,
        owner: repo.owner,
        isFork: repo.isFork,
        isArchived: repo.isArchived,
        stars: repo.stars,
        forks: repo.forks,
        ...(repo.primaryLanguage !== undefined && { primaryLanguage: repo.primaryLanguage }),
        topics: repo.topics,
        pushedAt: repo.pushedAt,
        updatedAt: repo.updatedAt,
        lastScannedAt: new Date(),
      },
    });
  }

  return {
    staleRepoCount,
    reposWithoutTopics,
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
