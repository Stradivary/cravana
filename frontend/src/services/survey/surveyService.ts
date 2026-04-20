import axios from 'axios';
import type {
  CreateSurveyReviewPayload,
  CreateSurveyReviewResponse,
  SurveyReviewsResponse,
} from 'types/survey';

const API_URL = process.env.REACT_APP_API_URL || 'https://cravana.vercel.app';

const toErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error || error.message;
  }

  return 'Terjadi kesalahan pada server';
};

export const surveyService = {
  getSurveyReviews: async (params: { limit: number; offset: number }): Promise<SurveyReviewsResponse> => {
    try {
      const searchParams = new URLSearchParams({
        limit: String(params.limit),
        offset: String(params.offset),
      });

      const res = await axios.get(`${API_URL}/api/surveys?${searchParams.toString()}`, {
        withCredentials: true,
      });

      return res.data as SurveyReviewsResponse;
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },

  createSurveyReview: async (payload: CreateSurveyReviewPayload): Promise<CreateSurveyReviewResponse> => {
    try {
      const res = await axios.post(
        `${API_URL}/api/surveys`,
        {
          name: payload.name,
          review: payload.review,
        },
        {
          withCredentials: true,
        }
      );

      return res.data as CreateSurveyReviewResponse;
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },
};
