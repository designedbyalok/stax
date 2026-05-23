const DEFAULT_TIMEOUT_MS = 4_000;

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export class FetchTimeoutError extends Error {
  constructor() {
    super("Parser fetch timed out");
    this.name = "FetchTimeoutError";
  }
}

export async function fetchHtml(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<string> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": UA,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error(`Upstream returned ${res.status}`);
    }
    return await res.text();
  } catch (err) {
    if ((err as Error).name === "AbortError") throw new FetchTimeoutError();
    throw err;
  } finally {
    clearTimeout(t);
  }
}
