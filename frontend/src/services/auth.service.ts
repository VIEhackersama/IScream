/**
 * Auth service — register, login, and profile-related API calls.
 *
 * Backend API contracts (Azure Functions):
 *   POST /api/auth/register  → ApiResponse<{ userId: string }>
 *   POST /api/auth/login     → ApiResponse<LoginResponse>
 *
 * ApiResponse shape: { success: bool, message?: string, data?: T, timestamp: string }
 *
 * On failure the backend still returns 4xx with JSON body:
 *   { success: false, message: "<error string>", data: null }
 *
 * The api-client throws on !res.ok with message:
 *   "API POST /path failed (400): <raw response text>"
 * so we parse that raw text as JSON to extract `message`.
 */
import { apiClient } from "@/lib/api-client";
import { extractApiError } from "@/lib/api-error";
import { API_ENDPOINTS } from "@/config";
import type { ApiResponse } from "@/types";

// ── Request / Response DTOs (mirror backend Models/Auth/AuthDtos.cs) ──────────

export interface RegisterRequest {
  /** Required. Min 3 chars, only letters/numbers/underscores. */
  username: string;
  /** Required. Min 6 chars. */
  password: string;
  email?: string;
  fullName?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
}

export interface LoginRequest {
  /** Username or email address. */
  usernameOrEmail: string;
  password: string;
}

export interface UserInfo {
  id: string; // Guid from backend
  username: string;
  fullName?: string;
  email?: string;
  role: "MEMBER" | "ADMIN";
}

export interface LoginResponse {
  token: string;
  tokenType: string; // always "Bearer"
  expiresInSeconds: number; // 28800 = 8 hours
  user: UserInfo;
}

export interface RegisterResponse {
  userId: string;
}

// ── Token helpers ─────────────────────────────────────────────────────────────

const TOKEN_KEY = "iscream_token";
const USER_KEY = "iscream_user";

export const tokenStorage = {
  save(token: string, user: UserInfo) {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  getUser(): UserInfo | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserInfo) : null;
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// ── Error extraction ──────────────────────────────────────────────────────────

// Re-export so existing consumers can still import from this file
export { extractApiError } from "@/lib/api-error";

// ── Service ───────────────────────────────────────────────────────────────────

export const authService = {
  /**
   * POST /api/auth/register
   * Returns the new user's UUID on success.
   * Throws with error message on failure.
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const res = await apiClient.post<ApiResponse<RegisterResponse>>(
      API_ENDPOINTS.auth.register,
      {
        username: data.username,
        password: data.password,
        email: data.email || undefined,
        fullName: data.fullName || undefined,
      },
    );
    if (!res.success) throw new Error(res.message ?? "Registration failed.");
    return res.data!;
  },

  /**
   * POST /api/auth/login
   * Saves JWT + user info to localStorage on success.
   * Throws with error message on failure.
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await apiClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.auth.login,
      {
        usernameOrEmail: data.usernameOrEmail,
        password: data.password,
      },
    );
    if (!res.success) throw new Error(res.message ?? "Login failed.");
    const loginData = res.data!;
    tokenStorage.save(loginData.token, loginData.user);
    return loginData;
  },

  /**
   * POST /api/auth/admin/login
   * Admin-specific login that forces server-side role check.
   * HTTP 403 Forbidden is returned if the user is not an admin.
   */
  async adminLogin(data: LoginRequest): Promise<LoginResponse> {
    const res = await apiClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.auth.adminLogin,
      {
        usernameOrEmail: data.usernameOrEmail,
        password: data.password,
      },
    );
    if (!res.success) throw new Error(res.message ?? "Admin login failed.");
    const loginData = res.data!;
    tokenStorage.save(loginData.token, loginData.user);
    return loginData;
  },

  /**
   * GET /api/auth/me
   * Fetch the authenticated user's current profile from backend.
   */
  async getMe(): Promise<UserInfo> {
    const res = await apiClient.get<ApiResponse<UserInfo>>(
      API_ENDPOINTS.auth.me,
    );
    if (!res.success)
      throw new Error(res.message ?? "Failed to fetch profile.");
    return res.data!;
  },

  /**
   * PUT /api/auth/profile
   * Updates the authenticated user's profile.
   */
  async updateProfile(data: UpdateProfileRequest): Promise<void> {
    const res = await apiClient.put<ApiResponse>(
      API_ENDPOINTS.auth.profile,
      data,
    );
    if (!res.success)
      throw new Error(res.message ?? "Failed to update profile.");
  },

  /**
   * Clear authentication state (logout client-side).
   */
  logout() {
    tokenStorage.clear();
  },

  isLoggedIn(): boolean {
    return !!tokenStorage.getToken();
  },
};
