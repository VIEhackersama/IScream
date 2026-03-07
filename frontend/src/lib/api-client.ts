import { tokenStorage } from "@/services/auth.service";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://iscream-d2bcdxh5aqhsd5fd.southeastasia-01.azurewebsites.net/api"
  // "http://localhost:7071/api"
  ;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface FetchOptions extends Omit<RequestInit, "method" | "body"> {
  params?: Record<string, string>;
}

/**
 * Thin wrapper around fetch that points to the backend API.
 * Automatically attaches JWT Bearer token from localStorage if present.
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

  // Attach JWT token if present in localStorage
  const token = typeof window !== "undefined" ? tokenStorage.getToken() : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

  // Helper to convert PascalCase keys to camelCase deeply
  function camelizeKeys(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((v) => camelizeKeys(v));
    } else if (obj !== null && typeof obj === "object") {
      return Object.keys(obj).reduce((result, key) => {
        let camelKey = key.charAt(0).toLowerCase() + key.slice(1);
        if (key === "ID") camelKey = "id";
        result[camelKey as keyof typeof result] = camelizeKeys(obj[key]);
        return result;
      }, {} as any);
    }
    return obj;
  }

  const data = await res.json();
  return camelizeKeys(data) as T;
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
