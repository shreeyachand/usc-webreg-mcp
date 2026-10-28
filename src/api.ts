export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: string,
  ) {
    super(message);
  }
}

export class InvalidResponseError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const BASE_URL = "https://classes.usc.edu/api";
const USER_AGENT = "usc-course-catalog-mcp/0.1.2";

type Params = Record<string, string | number | undefined>;

function buildQuery(params: Params): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }
  return parts.length > 0 ? `?${parts.join("&")}` : "";
}

export async function get<T>(
  path: string,
  params: Params = {},
  options: { allowEmpty?: boolean } = {},
): Promise<T> {
  const url = `${BASE_URL}${path}${buildQuery(params)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(60_000),
    });
  } catch (err) {
    throw new Error(`Request to ${url} failed: ${(err as Error).message}`);
  }

  const text = await res.text();
  if (!res.ok) {
    throw new ApiError(`USC API ${res.status} for ${path}`, res.status, text.slice(0, 500));
  }

  if (text === "") {
    if (options.allowEmpty) return null as T;
    throw new InvalidResponseError(`Empty response from ${path}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new InvalidResponseError(`Invalid JSON from ${path}: ${text.slice(0, 200)}`);
  }
}