import "dotenv/config";
import { runRepositoryDiscovery } from "@repo/repo-scanner";

interface CliOptions {
  org?: string;
  includeForks: boolean;
  includeArchived: boolean;
  minStars?: number;
  topics?: string[];
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (!process.env.GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is missing. Add it to .env before running discovery.");
  }

  console.warn("Starting GitHub repository discovery...");

  const result = await runRepositoryDiscovery({
    ...(options.org !== undefined && { org: options.org }),
    includeForks: options.includeForks,
    includeArchived: options.includeArchived,
    ...(options.minStars !== undefined && { minStars: options.minStars }),
    ...(options.topics !== undefined && { topics: options.topics }),
  });

  console.warn("Repository discovery completed.");
  console.warn(`Run ID: ${result.runId}`);
  console.warn(`Repositories saved: ${result.repoCount}`);
  console.warn(`Stale repositories: ${result.staleRepoCount}`);
  console.warn(`Repositories without topics: ${result.reposWithoutTopics}`);
}

function parseArgs(args: string[]): CliOptions {
  const org = getArgValue(args, "org");
  const minStars = getNumberArg(args, "min-stars");
  const topics = getListArg(args, "topics");

  return {
    ...(org !== undefined && { org }),
    includeForks: hasFlag(args, "include-forks"),
    includeArchived: hasFlag(args, "include-archived"),
    ...(minStars !== undefined && { minStars }),
    ...(topics !== undefined && { topics }),
  };
}

function hasFlag(args: string[], name: string): boolean {
  return args.includes(`--${name}`);
}

function getArgValue(args: string[], name: string): string | undefined {
  const prefix = `--${name}=`;
  return args.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function getNumberArg(args: string[], name: string): number | undefined {
  const value = getArgValue(args, name);

  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid numeric value for --${name}: ${value}`);
  }

  return parsed;
}

function getListArg(args: string[], name: string): string[] | undefined {
  const value = getArgValue(args, name);

  if (!value) {
    return undefined;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

main().catch((error) => {
  console.error("Repository discovery failed.");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exit(1);
});
