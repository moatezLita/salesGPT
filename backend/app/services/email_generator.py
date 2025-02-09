# File: backend/app/services/email_generator.py
from typing import Dict, Optional
from fastapi import HTTPException
import json
from groq import Groq
import os

class EmailGenerator:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    def generate_email(self, analysis: Dict, target_persona: str, tone: str) -> Dict:
        try:
            prompt = self._create_email_prompt(analysis, target_persona, tone)
            
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
            raise HTTPException(status_code=500, detail=f"Email generation failed: {str(e)}")

    def _create_email_prompt(self, analysis: Dict, target_persona: str, tone: str) -> str:
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
        Generate two variations of a sales email based on this company analysis.
        Target persona: {target_persona}
        Tone: {tone}

        Company Analysis:
        {json.dumps(analysis, indent=2)}

        Guidelines:
        1. Keep emails concise (3-4 paragraphs)
        2. Personalize based on company insights
        3. Address specific pain points
        4. Include clear value proposition
        5. End with strong call-to-action

        Return the emails in this exact JSON format:
        {json.dumps(email_template, indent=2)}
        """
