// services/queries/useEmails.js
import { useMutation, useQuery } from '@tanstack/react-query';
import { emailEndpoints } from '../endpoints/emailEndpoints';

export const useGenerateEmail = () => {
  return useMutation({
    mutationFn: ({ analysisId, targetPersona, tone }) => 
      emailEndpoints.generateEmail(analysisId, { targetPersona, tone }),
    onError: (error) => {
      console.error('Error generating email:', error);
    }
  });
};

export const useEmailResults = (analysisId) => {
  return useQuery({
    queryKey: ['emails', analysisId],
    queryFn: () => emailEndpoints.getEmail(analysisId),
    enabled: !!analysisId,
    refetchOnWindowFocus: false,
    select: (data) => data.emails || []
  });
};