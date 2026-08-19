export interface ApiResponse<T = unknown> {
  status: "success" | "error";
  message?: string;
  data?: T;
}

export function successResponse<T>(res: { status: (code: number) => { json: (body: ApiResponse<T>) => void } }, data: T, statusCode = 200) {
  return res.status(statusCode).json({ status: "success", data });
}

export function errorResponse(res: { status: (code: number) => { json: (body: ApiResponse) => void } }, message: string, statusCode = 400) {
  return res.status(statusCode).json({ status: "error", message });
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (password.length > 128) return "Password must be less than 128 characters";
  return null;
}

export function validateUsername(username: string): string | null {
  if (username.length < 3) return "Username must be at least 3 characters";
  if (username.length > 30) return "Username must be less than 30 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Username can only contain letters, numbers, and underscores";
  return null;
}

export function validateRequired(fields: Record<string, unknown>): string | null {
  for (const [name, value] of Object.entries(fields)) {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return `${name} is required`;
    }
  }
  return null;
}
