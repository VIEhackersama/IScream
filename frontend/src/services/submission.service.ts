/**
 * Submission service – POST /api/submissions, GET /api/submissions/{id}
 */
import { apiClient } from "@/lib/api-client";
import type { ApiResponse, CreateSubmissionRequest, RecipeSubmission } from "@/types";

export const submissionService = {
    submit: (data: CreateSubmissionRequest) =>
        apiClient.post<ApiResponse<{ submissionId: string }>>("/submissions", data),

    getById: (id: string) =>
        apiClient.get<ApiResponse<RecipeSubmission>>(`/submissions/${id}`),
};
