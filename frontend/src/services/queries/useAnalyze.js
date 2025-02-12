// services/queries/useAnalyze.js
import { useMutation, useQuery } from '@tanstack/react-query';
import { analyzeEndpoints } from '../endpoints/analyzeEndpoints';

// For analyzing a website
export const useAnalyzeWebsite = () => {
    return useMutation({
      mutationFn: (url) => analyzeEndpoints.analyzeWebsite(url),
    });
  };
// For fetching all analyses
export const useAnalyses = () => {
  return useQuery({
    queryKey: ['analyses'],
    queryFn: async () => {
      const response = await analyzeEndpoints.getAnalyses();
      return response.data;
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
  });
};

// For fetching a single analysis
export const useAnalysis = (id) => {
  return useQuery({
    queryKey: ['analysis', id],
    queryFn: async () => {
      const response = await analyzeEndpoints.getAnalysis(id);
      return response.data;
    },
    enabled: !!id, // Only run query if id is provided
    staleTime: 30000,
  });
};