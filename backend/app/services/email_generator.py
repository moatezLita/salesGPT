from typing import Dict
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
        try:
            # First, analyze the business opportunity
            opportunity_analysis = self._analyze_opportunity(company_analysis, user_business)
            
            # Then generate the emails based on the analysis
            email_response = self._generate_emails(
                company_analysis,
                user_business,
                opportunity_analysis,
                tone,
                target_persona
            )
            
            return email_response
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Email generation failed: {str(e)}"
            )

    def _analyze_opportunity(self, company_analysis: Dict, user_business: Dict) -> Dict:
        """Analyze the business opportunity and generate insights."""
        analysis_prompt = f"""
        You are a business analyst specializing in identifying B2B opportunities.
        
        Analyze how {user_business['company_name']} ({user_business['business_type']}) could provide value to the target company.
        
        Target Company Information:
        {json.dumps(company_analysis, indent=2)}
        
        Our Offering:
        {user_business['product_description']}
        
        Analyze and return a JSON response with:
        1. Key pain points this company might have related to our offering
        2. Specific benefits we can provide
        3. Potential ROI or cost savings
        4. Competitive advantages
        5. Industry-specific applications
        
        Format the response as:
        {{
            "pain_points": ["point1", "point2", ...],
            "benefits": ["benefit1", "benefit2", ...],
            "value_metrics": ["metric1", "metric2", ...],
            "competitive_edges": ["edge1", "edge2", ...],
            "use_cases": ["case1", "case2", ...]
        }}
        """

        response = self.client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[{
                "role": "system",
                "content": "You are an expert business analyst specializing in B2B opportunity analysis."
            }, {
                "role": "user",
                "content": analysis_prompt
            }],
            temperature=0.7,
            max_tokens=1000
        )
        
        return json.loads(response.choices[0].message.content)

    def _generate_emails(
        self,
        company_analysis: Dict,
        user_business: Dict,
        opportunity: Dict,
        tone: str,
        target_persona: str
    ) -> Dict:
        """Generate personalized sales emails based on the opportunity analysis."""
        
        email_prompt = f"""
        As an expert B2B sales copywriter, craft three unique email variations based on this analysis:
        
        TARGET COMPANY:
        {json.dumps(company_analysis, indent=2)}
        
        OUR BUSINESS:
        Company: {user_business['company_name']}
        Type: {user_business['business_type']}
        Offering: {user_business['product_description']}
        
        OPPORTUNITY ANALYSIS:
        Pain Points: {json.dumps(opportunity['pain_points'], indent=2)}
        Benefits: {json.dumps(opportunity['benefits'], indent=2)}
        Value Metrics: {json.dumps(opportunity['value_metrics'], indent=2)}
        Competitive Edges: {json.dumps(opportunity['competitive_edges'], indent=2)}
        Use Cases: {json.dumps(opportunity['use_cases'], indent=2)}
        
        TARGET PERSONA: {target_persona}
        TONE: {tone}
        
        EMAIL REQUIREMENTS:
        1. Subject Line:
           - Attention-grabbing but professional
           - Mention specific value or pain point
           - No clickbait or spam-like language
        
        2. Email Body:
           - Open with a specific observation about their business
           - Reference identified pain points
           - Present clear value proposition
           - Use industry-specific language
           - Include relevant metrics/benefits
           - 2-4 concise paragraphs
           - No generic sales language
        
        3. Call to Action:
           - Clear and specific
           - Low-pressure but compelling
           - Actionable next step
        
        Return three variations in this exact JSON format:
        {{
            "emails": [
                {{
                    "subject": "Compelling subject line",
                    "body": "Professional email body\\n\\nWith clear value proposition",
                    "call_to_action": "Clear call to action"
                }},
                {{
                    "subject": "Different angle subject",
                    "body": "Alternative approach\\n\\nFocusing on different benefits",
                    "call_to_action": "Alternative call to action"
                }},
                {{
                    "subject": "Third variation subject",
                    "body": "Unique perspective\\n\\nWith different emphasis",
                    "call_to_action": "Final call to action variation"
                }}
            ]
        }}
        """
        
        response = self.client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[{
                "role": "system",
                "content": f"You are an expert B2B sales copywriter crafting personalized outreach in a {tone} tone."
            }, {
                "role": "user",
                "content": email_prompt
            }],
            temperature=0.7,
            max_tokens=1000
        )
        
        return json.loads(response.choices[0].message.content)

# # backend/app/services/email_generator.py

# from typing import Dict, List, Optional
# from fastapi import HTTPException
# import json
# from groq import Groq
# import os

# class EmailGenerator:
#     def __init__(self):
#         self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

#     def generate_email(
#         self, 
#         analysis: Dict, 
#         service_description: str,
#         target_persona: str, 
#         tone: str
#     ) -> Dict:
#         try:
#             # Analyze service fit with target company
#             service_analysis = self._analyze_service_fit(analysis, service_description)
            
#             # Generate email content
#             prompt = self._create_email_prompt(
#                 analysis, 
#                 service_description,
#                 service_analysis,
#                 target_persona, 
#                 tone
#             )
            
#             response = self.client.chat.completions.create(
#                 model="mixtral-8x7b-32768",
#                 messages=[{
#                     "role": "system",
#                     "content": "You are an expert sales copywriter specializing in cold email outreach."
#                 }, {
#                     "role": "user",
#                     "content": prompt
#                 }],
#                 temperature=0.8,
#                 max_tokens=1000
#             )
            
#             result = response.choices[0].message.content
#             return json.loads(result)
            
#         except Exception as e:
#             raise HTTPException(
#                 status_code=500, 
#                 detail=f"Email generation failed: {str(e)}"
#             )

#     def _analyze_service_fit(self, analysis: Dict, service_description: str) -> Dict:
#         prompt = f"""
#         Analyze how this service fits the target company's needs:

#         Company Analysis:
#         {json.dumps(analysis, indent=2)}

#         Service Description:
#         {service_description}

#         Identify:
#         1. How the service addresses company's pain points
#         2. Potential benefits and ROI
#         3. Industry-specific applications
#         4. Competitive advantages

#         Return the analysis in JSON format.
#         """

#         response = self.client.chat.completions.create(
#             model="mixtral-8x7b-32768",
#             messages=[{
#                 "role": "system",
#                 "content": "You are an expert business analyst."
#             }, {
#                 "role": "user",
#                 "content": prompt
#             }],
#             temperature=0.7,
#             max_tokens=1000
#         )

#         return json.loads(response.choices[0].message.content)

#     def _create_email_prompt(
#         self, 
#         analysis: Dict,
#         service_description: str,
#         service_analysis: Dict,
#         target_persona: str, 
#         tone: str
#     ) -> str:
#         email_template = {
#             "subject_lines": [
#                 "Subject line 1",
#                 "Subject line 2"
#             ],
#             "emails": [
#                 {
#                     "subject": "Subject line 1",
#                     "body": "Email body 1",
#                     "call_to_action": "CTA 1"
#                 },
#                 {
#                     "subject": "Subject line 2",
#                     "body": "Email body 2",
#                     "call_to_action": "CTA 2"
#                 }
#             ]
#         }
        
#         return f"""
#         Generate two variations of a sales email based on this analysis.
        
#         Company Analysis:
#         {json.dumps(analysis, indent=2)}

#         Our Service/Product:
#         {service_description}

#         Service Fit Analysis:
#         {json.dumps(service_analysis, indent=2)}

#         Target persona: {target_persona}
#         Tone: {tone}

#         Guidelines:
#         1. Focus on how our service/product specifically solves their needs
#         2. Use industry-specific language and examples
#         3. Highlight relevant benefits and ROI
#         4. Keep emails concise (3-4 paragraphs)
#         5. Include clear value proposition
#         6. End with strong call-to-action

#         Return the emails in this exact JSON format:
#         {json.dumps(email_template, indent=2)}
#         """