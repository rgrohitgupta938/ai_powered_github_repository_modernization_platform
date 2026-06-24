import type { RepoSummary } from "@repo/github-client";

export interface PreviousRepoSnapshot {
  stars: number;
  lastScannedAt?: Date | null;
}

export interface RepoDerivedMetrics {
  daysSinceLastPush: number;
  hasTopics: boolean;
  isStale: boolean;
  starVelocity: number | null;
}

export function computeRepoDerivedMetrics(
  repo: RepoSummary,
  previous?: PreviousRepoSnapshot | null,
  now: Date = new Date(),
): RepoDerivedMetrics {
  const daysSinceLastPush = differenceInDays(now, repo.pushedAt);
  const hasTopics = repo.topics.length > 0;
  const isStale = daysSinceLastPush > 180;

  let starVelocity: number | null = null;

  if (previous?.lastScannedAt) {
    const daysBetweenRuns = Math.max(differenceInDays(now, previous.lastScannedAt), 1);
    starVelocity = (repo.stars - previous.stars) / daysBetweenRuns;
  }

  return {
    daysSinceLastPush,
    hasTopics,
    isStale,
    starVelocity,
  };
}

function differenceInDays(later: Date, earlier: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((later.getTime() - earlier.getTime()) / msPerDay);
}
