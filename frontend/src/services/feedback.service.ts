/**
 * Feedback service – POST /api/feedback
 */
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config";
import type { ApiResponse, CreateFeedbackRequest } from "@/types";

export const feedbackService = {
  submit: (data: CreateFeedbackRequest) =>
    apiClient.post<ApiResponse<{ feedbackId: string }>>(
      API_ENDPOINTS.feedback.create,
      data,
    ),
};
