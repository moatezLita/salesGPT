// services/endpoints/analyzeEndpoints.js
import axiosInstance from '../axios/instance';

export const analyzeEndpoints = {
    // Remove the { data } wrapper since we want { url }
    analyzeWebsite: (url) => 
      axiosInstance.post('/api/v1/analyze-website', { url }),
    
    getAnalyses: () => 
      axiosInstance.get('/api/v1/analyses'),
      
    getAnalysis: (id) => 
        axiosInstance.get(`/api/v1/analyses/${id}`), // Remove quotes around id
};