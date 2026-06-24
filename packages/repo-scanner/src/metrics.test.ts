import { describe, expect, it } from "vitest";
import { computeRepoDerivedMetrics } from "./metrics.js";
import type { RepoSummary } from "@repo/github-client";

describe("computeRepoDerivedMetrics", () => {
  it("marks repo as stale when last push is older than 180 days", () => {
    const repo: RepoSummary = {
      name: "test",
      nameWithOwner: "owner/test",
      owner: "owner",
      isFork: false,
      isArchived: false,
      stars: 10,
      forks: 1,
      pushedAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      primaryLanguage: "TypeScript",
      topics: [],
    };

    const metrics = computeRepoDerivedMetrics(repo, null, new Date("2025-01-01"));

    expect(metrics.isStale).toBe(true);
    expect(metrics.hasTopics).toBe(false);
  });

  it("computes star velocity from previous snapshot", () => {
    const repo: RepoSummary = {
      name: "test",
      nameWithOwner: "owner/test",
      owner: "owner",
      isFork: false,
      isArchived: false,
      stars: 20,
      forks: 1,
      pushedAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
      primaryLanguage: "TypeScript",
      topics: ["ai"],
    };

    const metrics = computeRepoDerivedMetrics(
      repo,
      {
        stars: 10,
        lastScannedAt: new Date("2025-01-01"),
      },
      new Date("2025-01-11"),
    );

    expect(metrics.starVelocity).toBe(1);
  });
});
