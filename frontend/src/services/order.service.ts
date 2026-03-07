/**
 * Order service – POST /api/orders, GET /api/orders/{id}
 */
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config";
import type { ApiResponse, CreateOrderRequest, ItemOrder } from "@/types";

export const orderService = {
  placeOrder: (data: CreateOrderRequest) =>
    apiClient.post<ApiResponse<{ orderId: string }>>(
      API_ENDPOINTS.orders.create,
      data,
    ),

  getById: (id: string) =>
    apiClient.get<ApiResponse<ItemOrder>>(API_ENDPOINTS.orders.byId(id)),
};
