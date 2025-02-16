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
        company_analysis: Dict,
        user_business: Dict,
        tone: str = "professional",
        target_persona: str = "decision maker"
    ) -> Dict:
        """
        Generate personalized sales emails based on analyzed company and user's business.
        
        Args:
            company_analysis (Dict): Analysis of the target company
            user_business (Dict): Details of the user's business {
                "company_name": str,
                "business_type": str,
                "product_description": str
            }
            tone (str): Desired email tone
            target_persona (str): Target recipient role
        """
        try:
            # Generate opportunity analysis
            opportunity = self._analyze_business_opportunity(
                company_analysis,
                user_business
            )
            
            # Generate email content
            prompt = self._create_email_prompt(
                company_analysis,
                user_business,
                opportunity,
                tone,
                target_persona
            )
            
            response = self.client.chat.completions.create(
                model="mixtral-8x7b-32768",
                messages=[{
                    "role": "system",
                    "content": "You are an expert sales copywriter specializing in B2B email outreach."
                }, {
                    "role": "user",
                    "content": prompt
                }],
                temperature=0.7,
                max_tokens=1000
            )
            
            result = response.choices[0].message.content
            return json.loads(result)
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Email generation failed: {str(e)}"
            )

def _analyze_business_opportunity(
    self,
    company_analysis: Dict,
    user_business: Dict
) -> Dict:
    """Analyze how the user's business can benefit the target company."""
    
    # Use raw string and separate the JSON template
    template = {
        "needs_identified": [],
        "value_propositions": [],
        "specific_benefits": [],
        "industry_applications": []
    }
    
    prompt = f"""
    Analyze how {user_business['company_name']} ({user_business['business_type']}) 
    can provide value to the target company.

    Target Company Analysis:
    {json.dumps(company_analysis, indent=2)}

    Our Business:
    {json.dumps(user_business, indent=2)}

    Identify:
    1. Specific needs the target company might have for our product/service
    2. How our offering can improve their operations
    3. Potential cost savings or benefits
    4. Industry-specific use cases
    5. Relevant pain points we can address

    Return the analysis as JSON with these exact keys:
    {json.dumps(template, indent=2)}
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
    company_analysis: Dict,
    user_business: Dict,
    opportunity: Dict,
    tone: str,
    target_persona: str
) -> str:
    """Create prompt for email generation."""
    
    # Define template as a separate dictionary
    email_template = {
        "subject_lines": [
            "Subject line 1",
            "Subject line 2",
            "Subject line 3"
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
            },
            {
                "subject": "Subject line 3",
                "body": "Email body 3",
                "call_to_action": "CTA 3"
            }
        ]
    }
    
    prompt = f"""
    Generate three variations of a sales email for {user_business['company_name']} 
    targeting {company_analysis.get('company_name', 'the company')}.
    
    Our Business:
    Company: {user_business['company_name']}
    Type: {user_business['business_type']}
    Product/Service: {user_business['product_description']}

    Target Company Analysis:
    {json.dumps(company_analysis, indent=2)}

    Business Opportunity Analysis:
    {json.dumps(opportunity, indent=2)}

    Target persona: {target_persona}
    Tone: {tone}

    Guidelines:
    1. Start with a relevant observation about their business
    2. Clearly explain how our {user_business['business_type']} can benefit them
    3. Use specific examples from the opportunity analysis
    4. Keep emails concise (2-4 paragraphs)
    5. Include clear value propositions
    6. End with a simple, actionable call-to-action
    7. Maintain a {tone} tone throughout

    Return exactly 3 email variations in this JSON format:
    {json.dumps(email_template, indent=2)}
    """
    
    return prompt