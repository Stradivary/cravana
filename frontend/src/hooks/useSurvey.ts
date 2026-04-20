import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { surveyService } from 'services/survey/surveyService';

export const SURVEY_REVIEWS_QUERY_KEY = ['survey-reviews'];

export const useSurveyReviews = (limit = 5) => {
  return useInfiniteQuery({
    queryKey: [...SURVEY_REVIEWS_QUERY_KEY, limit],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => {
      return surveyService.getSurveyReviews({ limit, offset: pageParam });
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.pagination.hasMore) {
        return undefined;
      }

      const loadedCount = allPages.reduce((sum, page) => sum + page.pagination.count, 0);
      return loadedCount;
    },
  });
};

export const useCreateSurveyReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: surveyService.createSurveyReview,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SURVEY_REVIEWS_QUERY_KEY });
    },
  });
};
