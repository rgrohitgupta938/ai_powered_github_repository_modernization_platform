export class GithubClientError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "GithubClientError";
  }
}

export class GithubTokenMissingError extends GithubClientError {
  constructor() {
    super("GITHUB_TOKEN is missing. Add it to your local .env file.");
    this.name = "GithubTokenMissingError";
  }
}
