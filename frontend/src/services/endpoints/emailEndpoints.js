// services/endpoints/emailEndpoints.js

import axiosInstance from "../axios/instance";

export const emailEndpoints = {
  generateEmail: async (analysisId, params) => {
    // Transform the params into the expected backend format
    const payload = {
      business_info: {
        company_name: params.companyName,
        business_type: params.businessType,
        product_description: params.serviceDescription
      },
      target_persona: params.targetPersona,
      tone: params.tone
    };

    const response = await axiosInstance.post(`/api/v1/generate-email/${analysisId}`, payload);
    return response.data;
  },
  
  getEmails: async (analysisId) => {
    const response = await axiosInstance.get(`/api/v1/emails/${analysisId}`);
    return response.data;
  }
};