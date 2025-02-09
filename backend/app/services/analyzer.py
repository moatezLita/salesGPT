# File: backend/app/services/analyzer.py
from typing import Dict, Optional
from fastapi import HTTPException
import json
from groq import Groq
import os

class CompanyAnalyzer:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    def analyze_company(self, website_data: Dict, custom_notes: Optional[str] = None) -> Dict:
        try:
            content_for_analysis = {
                'title': website_data.get('title', ''),
                'description': website_data.get('meta_description', ''),
                'content': website_data.get('main_content', '')[:5000],
                'social_links': website_data.get('social_links', []),
                'contact_info': website_data.get('contact_info', {})
            }
            
            prompt = self._create_analysis_prompt(content_for_analysis, custom_notes)
            
            response = self.client.chat.completions.create(
                model="mixtral-8x7b-32768",
                messages=[{
                    "role": "system",
                    "content": "You are an expert business analyst. Analyze the provided website data and extract key business insights."
                }, {
                    "role": "user",
                    "content": prompt
                }],
                temperature=0.7,
                max_tokens=2000
            )
            
            result = response.choices[0].message.content
            return json.loads(result)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    def _create_analysis_prompt(self, website_data: Dict, custom_notes: Optional[str]) -> str:
        analysis_template = {
            "industry": "Industry name and description",
            "market_position": "Analysis of market position",
            "products_services": ["Product/Service 1", "Product/Service 2"],
            "target_audience": "Description of target audience",
            "unique_selling_points": ["USP 1", "USP 2"],
            "brand_voice": "Analysis of brand voice and tone",
            "customer_pain_points": ["Pain point 1", "Pain point 2"],
            "competitors": ["Competitor 1", "Competitor 2"],
            "sales_approach": "Recommended sales approach"
        }
        
        return f"""
        Analyze this company website data and provide insights in a structured JSON format.
        
        Website Data:
        {json.dumps(website_data, indent=2)}
        
        Additional Notes:
        {custom_notes if custom_notes else 'No additional notes provided'}
        
        Return your analysis in this exact JSON format:
        {json.dumps(analysis_template, indent=2)}
        """
