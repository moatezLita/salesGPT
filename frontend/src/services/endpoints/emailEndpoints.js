// services/endpoints/emailEndpoints.js

import axiosInstance from "../axios/instance";

export const emailEndpoints = {
  generateEmail: async (analysisId, params) => {
    const response = await axiosInstance.post(`/api/v1/generate-email/${analysisId}`, {
      target_persona: params.targetPersona,
      tone: params.tone
    });
    return response.data;
  },
  
  getEmail: async (analysisId) => {
    const response = await axiosInstance.get(`/api/v1/emails/${analysisId}`);
    return response.data;
  }
};
