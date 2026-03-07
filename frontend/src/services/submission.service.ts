/**
 * Submission service – POST /api/submissions, GET /api/submissions/{id}
 */
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config";
import type {
  ApiResponse,
  CreateSubmissionRequest,
  RecipeSubmission,
} from "@/types";

export const submissionService = {
  submit: (data: CreateSubmissionRequest) =>
    apiClient.post<ApiResponse<{ submissionId: string }>>(
      API_ENDPOINTS.submissions.create,
      data,
    ),

  getById: (id: string) =>
    apiClient.get<ApiResponse<RecipeSubmission>>(
      API_ENDPOINTS.submissions.byId(id),
    ),
};
