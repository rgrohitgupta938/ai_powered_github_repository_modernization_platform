export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getRateLimitWaitMs(resetAt: Date, bufferMs = 3000): number {
  const waitMs = resetAt.getTime() - Date.now() + bufferMs;
  return Math.max(waitMs, 0);
}
