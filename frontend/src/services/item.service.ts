/**
 * Item (Recipe Book) service – calls GET /api/items, GET /api/items/{id}
 */
import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Item, PagedResult } from "@/types";

export const itemService = {
    getAll: (page = 1, pageSize = 12, search?: string) =>
        apiClient.get<ApiResponse<PagedResult<Item>>>("/items", {
            params: {
                page: String(page),
                pageSize: String(pageSize),
                ...(search ? { search } : {}),
            },
        }),

    getById: (id: string) =>
        apiClient.get<ApiResponse<Item>>(`/items/${id}`),
};
