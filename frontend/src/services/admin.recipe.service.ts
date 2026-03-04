/**
 * Admin Recipe Service — CRUD operations for recipes.
 * Requires ADMIN JWT token (automatically attached by apiClient).
 *
 * Backend routes:
 *   GET    /api/recipes                    — public list (with isActive filter)
 *   POST   /api/management/recipes         — create (ADMIN)
 *   PUT    /api/management/recipes/{id}    — update (ADMIN)
 *   DELETE /api/management/recipes/{id}    — soft-delete (ADMIN)
 */
import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Recipe, PagedResult } from "@/types";

export interface CreateRecipeRequest {
    flavorName: string;
    shortDescription?: string;
    ingredients?: string;
    procedure?: string;
    imageUrl?: string;
}

export interface UpdateRecipeRequest {
    flavorName?: string;
    shortDescription?: string;
    ingredients?: string;
    procedure?: string;
    imageUrl?: string;
    isActive?: boolean;
}

export const adminRecipeService = {
    /** List all recipes (admin sees both active & inactive) */
    getAll: (page = 1, pageSize = 10, isActive?: boolean) => {
        const params: Record<string, string> = {
            page: String(page),
            pageSize: String(pageSize),
        };
        if (isActive !== undefined) params.isActive = String(isActive);
        return apiClient.get<ApiResponse<PagedResult<Recipe>>>("/recipes", { params });
    },

    /** Create a new recipe */
    create: (data: CreateRecipeRequest) =>
        apiClient.post<ApiResponse<{ id: string }>>("/management/recipes", data),

    /** Update an existing recipe */
    update: (id: string, data: UpdateRecipeRequest) =>
        apiClient.put<ApiResponse<void>>(`/management/recipes/${id}`, data),

    /** Soft-delete a recipe */
    remove: (id: string) =>
        apiClient.delete<ApiResponse<void>>(`/management/recipes/${id}`),
};
