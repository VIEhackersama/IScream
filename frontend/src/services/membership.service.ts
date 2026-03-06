import { apiClient } from "@/lib/api-client";
import type { ApiResponse, MembershipPlan, MembershipSubscription } from "@/types";

export interface CreateSubscriptionRequest {
    planId: string;
    // We typically might capture payment details here, but our backend handles the mock flow
}

export const membershipService = {
    /**
     * GET /api/memberships/plans
     * Returns the list of available membership plans
     */
    async getPlans(): Promise<MembershipPlan[]> {
        const res = await apiClient.get<ApiResponse<MembershipPlan[]>>("/memberships/plans");
        return res.data ?? [];
    },

    /**
     * GET /api/memberships/status
     * Returns the current user's membership subscription status, if any.
     */
    async getStatus(): Promise<MembershipSubscription | null> {
        try {
            const res = await apiClient.get<ApiResponse<MembershipSubscription>>("/memberships/status");
            return res.data ?? null;
        } catch {
            // Handled when user has no active subscription (404/400 depends on backend)
            return null;
        }
    },

    /**
     * POST /api/memberships/subscribe
     * Subscribe to a specific membership plan
     */
    async subscribe(data: CreateSubscriptionRequest): Promise<void> {
        const res = await apiClient.post<ApiResponse>("/memberships/subscribe", data);
        if (!res.success) {
            throw new Error(res.message || "Failed to subscribe to the membership plan.");
        }
    }
};
