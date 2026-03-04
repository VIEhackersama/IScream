/**
 * Order service – POST /api/orders, GET /api/orders/{id}
 */
import { apiClient } from "@/lib/api-client";
import type { ApiResponse, CreateOrderRequest, ItemOrder } from "@/types";

export const orderService = {
    placeOrder: (data: CreateOrderRequest) =>
        apiClient.post<ApiResponse<{ orderId: string }>>("/orders", data),

    getById: (id: string) =>
        apiClient.get<ApiResponse<ItemOrder>>(`/orders/${id}`),
};
