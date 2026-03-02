const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7071/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface FetchOptions extends Omit<RequestInit, "method" | "body"> {
  params?: Record<string, string>;
}

/**
 * Thin wrapper around fetch that points to the backend API.
 * Handles JSON serialisation, query params, and base-URL logic
 * so individual service files stay lean.
 */
async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options: FetchOptions = {},
): Promise<T> {
  const { params, ...init } = options;

  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...init.headers,
  };

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    ...init,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `API ${method} ${path} failed (${res.status}): ${errorBody}`,
    );
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, opts?: FetchOptions) =>
    request<T>("GET", path, undefined, opts),
  post: <T>(path: string, body?: unknown, opts?: FetchOptions) =>
    request<T>("POST", path, body, opts),
  put: <T>(path: string, body?: unknown, opts?: FetchOptions) =>
    request<T>("PUT", path, body, opts),
  patch: <T>(path: string, body?: unknown, opts?: FetchOptions) =>
    request<T>("PATCH", path, body, opts),
  delete: <T>(path: string, opts?: FetchOptions) =>
    request<T>("DELETE", path, undefined, opts),
};
