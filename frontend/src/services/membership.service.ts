import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config";
import type {
  ApiResponse,
  MembershipPlan,
  MembershipSubscription,
} from "@/types";

export interface CreateSubscriptionRequest {
  planId: number;
  paymentId?: string; // Optional payment ID from payment gateway
}

export const membershipService = {
  /**
   * GET /api/membership/plans
   * Returns the list of available membership plans
   */
  async getPlans(): Promise<MembershipPlan[]> {
    const res = await apiClient.get<ApiResponse<MembershipPlan[]>>(
      API_ENDPOINTS.membership.plans,
    );
    return res.data ?? [];
  },

  /**
   * GET /api/membership/me
   * Returns the current user's membership subscription status, if any.
   */
  async getStatus(): Promise<MembershipSubscription | null> {
    try {
      const res = await apiClient.get<ApiResponse<MembershipSubscription>>(
        API_ENDPOINTS.membership.me,
      );
      return res.data ?? null;
    } catch {
      // Handled when user has no active subscription (404/400 depends on backend)
      return null;
    }
  },

  /**
   * POST /api/membership/subscribe
   * Subscribe to a specific membership plan
   */
  async subscribe(data: CreateSubscriptionRequest): Promise<void> {
    const res = await apiClient.post<ApiResponse>(
      API_ENDPOINTS.membership.subscribe,
      data,
    );
    if (!res.success) {
      throw new Error(
        res.message || "Failed to subscribe to the membership plan.",
      );
    }
  },
};
