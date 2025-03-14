// services/queries/useEmails.js
import { useMutation, useQuery } from '@tanstack/react-query';
import { emailEndpoints } from '../endpoints/emailEndpoints';

export const useGenerateEmail = () => {
  return useMutation({
    mutationFn: ({ 
      analysisId, 
      targetPersona, 
      tone, 
      companyName,
      businessType,
      serviceDescription 
    }) => emailEndpoints.generateEmail(analysisId, { 
      targetPersona, 
      tone,
      companyName,
      businessType,
      serviceDescription
    }),
    onError: (error) => {
      console.error('Error generating email:', error);
    }
  });
};

export const useEmailResults = (analysisId) => {
  return useQuery({
    queryKey: ['emails', analysisId],
    queryFn: () => emailEndpoints.getEmails(analysisId),
    enabled: !!analysisId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};