import { getToken } from "./storage";

export const API_BASE_URL = "http://localhost:5049";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(
      `Cannot reach the server. Make sure the API is running at ${API_BASE_URL}.`,
      0,
    );
  }

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}.`, response.status);
  }

  const text = await response.text();
  if (!text) return undefined as T;
  const trimmed = text.trim();
  const contentType = response.headers.get("Content-Type") ?? "";
  if (contentType.includes("json") || trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed) as T;
    } catch {
      if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
        return text as T;
      }
      throw new ApiError(`Server returned an unexpected response: ${text.slice(0, 200)}`, response.status);
    }
  }
  return text as T;
}
