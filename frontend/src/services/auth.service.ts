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

export interface LoginRequest {
    /** Username or email address. */
    usernameOrEmail: string;
    password: string;
}

export interface UserInfo {
    id: string;          // Guid from backend
    username: string;
    fullName?: string;
    email?: string;
    role: "USER" | "ADMIN";
}

export interface LoginResponse {
    token: string;
    tokenType: string;   // always "Bearer"
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

/**
 * The api-client throws:  "API POST /path failed (400): <body>"
 * The body is JSON: { success: false, message: "...", data: null, timestamp: "..." }
 * This helper extracts the human-readable `message` from that body.
 */
export function extractApiError(err: unknown, fallback: string): string {
    if (!(err instanceof Error)) return fallback;

    // Try to parse the raw JSON body appended after the colon
    const colonIdx = err.message.indexOf("): ");
    if (colonIdx !== -1) {
        try {
            const raw = err.message.slice(colonIdx + 3);
            const parsed = JSON.parse(raw) as { message?: string };
            if (parsed.message) return parsed.message;
        } catch {
            // fall through
        }
    }
    return fallback;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const authService = {
    /**
     * POST /api/auth/register
     * Returns the new user's UUID on success.
     * Throws with error message on failure.
     */
    async register(data: RegisterRequest): Promise<RegisterResponse> {
        const res = await apiClient.post<ApiResponse<RegisterResponse>>(
            "/auth/register",
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
            "/auth/login",
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
     * Clear authentication state (logout client-side).
     */
    logout() {
        tokenStorage.clear();
    },

    isLoggedIn(): boolean {
        return !!tokenStorage.getToken();
    },
};
