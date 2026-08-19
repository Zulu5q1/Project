const API_URL = import.meta.env.VITE_API_URL || "";

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token: explicitToken, ...fetchOptions } = options;
  const token = explicitToken ?? getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data.data;
}

export function getToken(): string | null {
  return localStorage.getItem("unixchange_token");
}

export function setToken(token: string): void {
  localStorage.setItem("unixchange_token", token);
}

export function removeToken(): void {
  localStorage.removeItem("unixchange_token");
}
