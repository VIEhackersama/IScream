/**
 * Auth service – register, login, and profile-related API calls.
 */
import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types";

// ---- Request / Response types matching backend DTOs ----

export interface RegisterRequest {
    username: string;
    password: string;
    email?: string;
    fullName?: string;
}

export interface LoginRequest {
    usernameOrEmail: string;
    password: string;
}

export interface UserInfo {
    id: string;
    username: string;
    fullName?: string;
    email?: string;
    role: string;
}

export interface LoginResponse {
    token: string;
    tokenType: string;
    expiresInSeconds: number;
    user: UserInfo;
}

export interface RegisterResponse {
    userId: string;
}

// ---- Service ----

export const authService = {
    register: (data: RegisterRequest) =>
        apiClient.post<ApiResponse<RegisterResponse>>("/auth/register", data),

    login: (data: LoginRequest) =>
        apiClient.post<ApiResponse<LoginResponse>>("/auth/login", data),
};
