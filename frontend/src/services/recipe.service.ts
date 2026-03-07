/**
 * Recipe service – all recipe-related API calls.
 * Backend: GET /api/recipes, GET /api/recipes/{id}
 */
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config";
import type { ApiResponse, Recipe, PagedResult } from "@/types";

export const recipeService = {
  getAll: (page = 1, pageSize = 12, isActive = true) =>
    apiClient.get<ApiResponse<PagedResult<Recipe>>>(
      API_ENDPOINTS.recipes.list,
      {
        params: {
          page: String(page),
          pageSize: String(pageSize),
          isActive: String(isActive),
        },
      },
    ),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Recipe>>(API_ENDPOINTS.recipes.byId(id)),
};
