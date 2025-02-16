# backend/app/services/email_generator.py

from typing import Dict, List, Optional
from fastapi import HTTPException
import json
from groq import Groq
import os

class EmailGenerator:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    def generate_email(
        self, 
        analysis: Dict, 
        service_description: str,
        target_persona: str, 
        tone: str
    ) -> Dict:
        try:
            # Analyze service fit with target company
            service_analysis = self._analyze_service_fit(analysis, service_description)
            
            # Generate email content
            prompt = self._create_email_prompt(
                analysis, 
                service_description,
                service_analysis,
                target_persona, 
                tone
            )
            
            response = self.client.chat.completions.create(
                model="mixtral-8x7b-32768",
                messages=[{
                    "role": "system",
                    "content": "You are an expert sales copywriter specializing in cold email outreach."
                }, {
                    "role": "user",
                    "content": prompt
                }],
                temperature=0.8,
                max_tokens=1000
            )
            
            result = response.choices[0].message.content
            return json.loads(result)
            
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Email generation failed: {str(e)}"
            )

    def _analyze_service_fit(self, analysis: Dict, service_description: str) -> Dict:
        prompt = f"""
        Analyze how this service fits the target company's needs:

        Company Analysis:
        {json.dumps(analysis, indent=2)}

        Service Description:
        {service_description}

        Identify:
        1. How the service addresses company's pain points
        2. Potential benefits and ROI
        3. Industry-specific applications
        4. Competitive advantages

        Return the analysis in JSON format.
        """

        response = self.client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[{
                "role": "system",
                "content": "You are an expert business analyst."
            }, {
                "role": "user",
                "content": prompt
            }],
            temperature=0.7,
            max_tokens=1000
        )

        return json.loads(response.choices[0].message.content)

    def _create_email_prompt(
        self, 
        analysis: Dict,
        service_description: str,
        service_analysis: Dict,
        target_persona: str, 
        tone: str
    ) -> str:
        email_template = {
            "subject_lines": [
                "Subject line 1",
                "Subject line 2"
            ],
            "emails": [
                {
                    "subject": "Subject line 1",
                    "body": "Email body 1",
                    "call_to_action": "CTA 1"
                },
                {
                    "subject": "Subject line 2",
                    "body": "Email body 2",
                    "call_to_action": "CTA 2"
                }
            ]
        }
        
        return f"""
        Generate two variations of a sales email based on this analysis.
        
        Company Analysis:
        {json.dumps(analysis, indent=2)}

        Our Service/Product:
        {service_description}

        Service Fit Analysis:
        {json.dumps(service_analysis, indent=2)}

        Target persona: {target_persona}
        Tone: {tone}

        Guidelines:
        1. Focus on how our service/product specifically solves their needs
        2. Use industry-specific language and examples
        3. Highlight relevant benefits and ROI
        4. Keep emails concise (3-4 paragraphs)
        5. Include clear value proposition
        6. End with strong call-to-action

        Return the emails in this exact JSON format:
        {json.dumps(email_template, indent=2)}
        """