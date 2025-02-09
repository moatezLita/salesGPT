
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import Dict, List, Optional
import httpx
from bs4 import BeautifulSoup
from groq import Groq
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="SalesGPT Backend")

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class WebsiteAnalysisRequest(BaseModel):
    url: HttpUrl
    custom_notes: Optional[str] = None

class EmailGenerationRequest(BaseModel):
    company_analysis: Dict
    target_persona: Optional[str] = None
    tone: Optional[str] = "professional"

class WebScraper:
    async def scrape_website(self, url: str) -> Dict:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(str(url))
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')
                
                return {
                    'title': soup.title.string if soup.title else '',
                    'meta_description': self._get_meta_description(soup),
                    'main_content': self._extract_main_content(soup),
                    'social_links': self._find_social_links(soup),
                    'contact_info': self._extract_contact_info(soup)
                }
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to scrape website: {str(e)}")

    def _get_meta_description(self, soup) -> str:
        meta = soup.find('meta', {'name': 'description'})
        return meta['content'] if meta else ''

    def _extract_main_content(self, soup) -> str:
        # Remove script and style elements
        for script in soup(['script', 'style']):
            script.decompose()
        
        # Get main content areas
        main_content = []
        content_tags = soup.find_all(['main', 'article', 'div'], class_=['content', 'main', 'article'])
        
        for tag in content_tags:
            main_content.append(tag.get_text(strip=True))
        
        return ' '.join(main_content)

    def _find_social_links(self, soup) -> List[str]:
        social_patterns = ['facebook.com', 'linkedin.com', 'twitter.com', 'instagram.com']
        social_links = []
        
        for link in soup.find_all('a', href=True):
            if any(pattern in link['href'] for pattern in social_patterns):
                social_links.append(link['href'])
        
        return social_links

    def _extract_contact_info(self, soup) -> Dict:
        contact_info = {
            'email': None,
            'phone': None,
            'address': None
        }
        
        # Find email addresses
        email_elements = soup.find_all(string=lambda text: '@' in str(text))
        if email_elements:
            contact_info['email'] = email_elements[0].strip()
        
        return contact_info

class CompanyAnalyzer:
    def analyze_company(self, website_data: Dict, custom_notes: Optional[str] = None) -> Dict:
        prompt = self._create_analysis_prompt(website_data, custom_notes)
        
        try:
            response = client.chat.completions.create(
                model="mixtral-8x7b-32768",
                messages=[{
                    "role": "system",
                    "content": "You are an expert business analyst specializing in company analysis. Analyze the provided website data and extract key business insights."
                }, {
                    "role": "user",
                    "content": prompt
                }],
                temperature=0.7,
                max_tokens=2000
            )
            
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    def _create_analysis_prompt(self, website_data: Dict, custom_notes: Optional[str]) -> str:
        return f"""
        Analyze this company website data and provide a structured JSON response with the following information:
        1. Industry and market position
        2. Main products/services
        3. Target audience
        4. Unique selling points
        5. Company tone and brand voice
        6. Potential pain points their customers might have
        7. Key competitors (based on industry and offerings)
        8. Recommended sales approach
        
        Website Data:
        {json.dumps(website_data, indent=2)}
        
        Additional Notes:
        {custom_notes if custom_notes else 'No additional notes provided'}
        
        Return the analysis in valid JSON format with these exact keys:
        {
            "industry": "",
            "market_position": "",
            "products_services": [],
            "target_audience": "",
            "unique_selling_points": [],
            "brand_voice": "",
            "customer_pain_points": [],
            "competitors": [],
            "sales_approach": ""
        }
        """

class EmailGenerator:
    def generate_email(self, analysis: Dict, target_persona: Optional[str], tone: str) -> Dict:
        prompt = self._create_email_prompt(analysis, target_persona, tone)
        
        try:
            response = client.chat.completions.create(
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
            
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Email generation failed: {str(e)}")

    def _create_email_prompt(self, analysis: Dict, target_persona: Optional[str], tone: str) -> str:
        return f"""
        Generate 2 variations of a cold sales email based on this company analysis.
        Use a {tone} tone and focus on addressing the identified pain points.
        
        Company Analysis:
        {json.dumps(analysis, indent=2)}
        
        Target Persona:
        {target_persona if target_persona else 'Decision maker in the company'}
        
        Return the emails in valid JSON format with these exact keys:
        {
            "variation_1": {
                "subject_line": "",
                "email_body": "",
                "call_to_action": ""
            },
            "variation_2": {
                "subject_line": "",
                "email_body": "",
                "call_to_action": ""
            }
        }
        """

# Initialize components
scraper = WebScraper()
analyzer = CompanyAnalyzer()
email_generator = EmailGenerator()

@app.post("/analyze-website")
async def analyze_website(request: WebsiteAnalysisRequest):
    # Scrape website
    website_data = await scraper.scrape_website(request.url)
    
    # Analyze company
    analysis = analyzer.analyze_company(website_data, request.custom_notes)
    
    return {
        "website_data": website_data,
        "analysis": analysis
    }

@app.post("/generate-email")
async def generate_email(request: EmailGenerationRequest):
    email_variations = email_generator.generate_email(
        request.company_analysis,
        request.target_persona,
        request.tone
    )
    
    return email_variations