import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config";
import type { ApiResponse, PagedResult } from "@/types";

export interface RecipeSubmission {
  id: string;
  userId?: string;
  name?: string;
  email?: string;
  title: string;
  description?: string;
  ingredients?: string;
  steps?: string;
  imageUrl?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  prizeMoney?: number;
  certificateUrl?: string;
  reviewedByUserId?: string;
  createdAt: string;
  reviewedAt?: string;
}

export const adminSubmissionService = {
  async getAll(
    page: number = 1,
    pageSize: number = 10,
    status?: "PENDING" | "APPROVED" | "REJECTED",
  ): Promise<PagedResult<RecipeSubmission>> {
    const params: Record<string, string> = {
      page: page.toString(),
      pageSize: pageSize.toString(),
    };
    if (status) params.status = status;

    const res = await apiClient.get<ApiResponse<PagedResult<RecipeSubmission>>>(
      API_ENDPOINTS.management.submissions.list,
      { params },
    );
    return res.data;
  },

  async review(
    id: string,
    approve: boolean,
    adminNotes?: string,
    prizeMoney?: number,
    certificateUrl?: string,
  ): Promise<void> {
    await apiClient.put<ApiResponse>(
      API_ENDPOINTS.management.submissions.review(id),
      {
        approve,
        adminNotes,
        prizeMoney,
        certificateUrl,
      },
    );
  },
};
