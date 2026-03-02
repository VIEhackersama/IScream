/**
 * Recipe service – all recipe-related API calls live here.
 */
import { apiClient } from "@/lib/api-client";
import type { Recipe, ApiResponse, PaginatedResponse } from "@/types";

export const recipeService = {
  getAll: (page = 1, pageSize = 10) =>
    apiClient.get<PaginatedResponse<Recipe>>("/recipes", {
      params: { page: String(page), pageSize: String(pageSize) },
    }),

  getById: (id: string) => apiClient.get<ApiResponse<Recipe>>(`/recipes/${id}`),

  create: (data: Partial<Recipe>) =>
    apiClient.post<ApiResponse<Recipe>>("/recipes", data),

  update: (id: string, data: Partial<Recipe>) =>
    apiClient.put<ApiResponse<Recipe>>(`/recipes/${id}`, data),

  delete: (id: string) => apiClient.delete<ApiResponse<null>>(`/recipes/${id}`),
};
