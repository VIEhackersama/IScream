/**
 * Feedback service – POST /api/feedback
 */
import { apiClient } from "@/lib/api-client";
import type { ApiResponse, CreateFeedbackRequest } from "@/types";

export const feedbackService = {
    submit: (data: CreateFeedbackRequest) =>
        apiClient.post<ApiResponse<{ feedbackId: string }>>("/feedback", data),
};
