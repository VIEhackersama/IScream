/**
 * Item (Recipe Book) service – calls GET /api/items, GET /api/items/{id}
 */
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config";
import type { ApiResponse, Item, PagedResult } from "@/types";

export const itemService = {
  getAll: (page = 1, pageSize = 12, search?: string) =>
    apiClient.get<ApiResponse<PagedResult<Item>>>(API_ENDPOINTS.items.list, {
      params: {
        page: String(page),
        pageSize: String(pageSize),
        ...(search ? { search } : {}),
      },
    }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Item>>(API_ENDPOINTS.items.byId(id)),
};
