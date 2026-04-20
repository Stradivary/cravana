export interface SurveyReviewItem {
  id: string;
  name: string;
  review: string;
  createdAt: string;
}

export interface SurveyReviewsPagination {
  limit: number;
  offset: number;
  count: number;
  total: number;
  hasMore: boolean;
}

export interface SurveyReviewsResponse {
  reviews: SurveyReviewItem[];
  pagination: SurveyReviewsPagination;
}

export interface CreateSurveyReviewPayload {
  name: string;
  review: string;
}

export interface CreateSurveyReviewResponse {
  message: string;
  review: {
    id: string;
    name: string;
    review: string;
    isVisible: boolean;
    isActive: boolean;
    createdAt: string;
  };
}
