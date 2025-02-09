from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import Dict, List, Optional
import httpx
from bs4 import BeautifulSoup
from groq import Groq
import os
from dotenv import load_dotenv
import json
import asyncio
from urllib.parse import urljoin
from datetime import datetime

# Load environment variables
load_dotenv()

# Check if GROQ_API_KEY is set
if not os.getenv("GROQ_API_KEY"):
    raise Exception("GROQ_API_KEY environment variable is not set")

# Initialize FastAPI app
app = FastAPI(title="SalesGPT Backend")

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class WebsiteAnalysisRequest(BaseModel):
    url: str
    custom_notes: Optional[str] = None

class WebScraper:
    async def scrape_website(self, url: str) -> Dict:
        try:
            async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
                # First request to handle redirects
                response = await client.get(url)
                final_url = str(response.url)
                
                # Get the page content
                soup = BeautifulSoup(response.text, 'html.parser')
                
                extracted_data = {
                    'title': self._clean_text(soup.title.string) if soup.title else '',
                    'meta_description': self._get_meta_description(soup),
                    'main_content': self._extract_main_content(soup),
                    'social_links': self._find_social_links(soup, final_url),
                    'contact_info': self._extract_contact_info(soup),
                    'final_url': final_url
                }
                
                return extracted_data

        except httpx.RequestError as e:
            raise HTTPException(status_code=400, detail=f"Error accessing website: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to process website: {str(e)}")

    def _clean_text(self, text: Optional[str]) -> str:
        if text:
            return ' '.join(text.split())
        return ''

    def _get_meta_description(self, soup) -> str:
        meta = soup.find('meta', {'name': ['description', 'Description']})
        if not meta:
            meta = soup.find('meta', {'property': ['og:description', 'twitter:description']})
        return self._clean_text(meta['content']) if meta and 'content' in meta.attrs else ''

    def _extract_main_content(self, soup) -> str:
        # Remove unwanted elements
        for element in soup(['script', 'style', 'nav', 'footer', 'iframe']):
            element.decompose()
        
        # Get text from important elements
        content_elements = []
        
        # Priority elements
        for tag in ['main', 'article', 'section']:
            elements = soup.find_all(tag)
            for element in elements:
                content_elements.append(self._clean_text(element.get_text(separator=' ')))
        
        # Fallback to divs with content-related classes
        if not content_elements:
            content_divs = soup.find_all('div', class_=lambda x: x and any(word in str(x).lower() 
                for word in ['content', 'main', 'article', 'body']))
            for div in content_divs:
                content_elements.append(self._clean_text(div.get_text(separator=' ')))
        
        # Final fallback to paragraphs
        if not content_elements:
            paragraphs = soup.find_all('p')
            content_elements = [self._clean_text(p.get_text()) for p in paragraphs]
        
        return ' '.join(content_elements)

    def _find_social_links(self, soup, base_url: str) -> List[str]:
        social_patterns = ['facebook.com', 'linkedin.com', 'twitter.com', 'instagram.com']
        social_links = set()
        
        for link in soup.find_all('a', href=True):
            href = link['href']
            if not href.startswith(('http://', 'https://')):
                href = urljoin(base_url, href)
            
            if any(pattern in href.lower() for pattern in social_patterns):
                social_links.add(href)
        
        return list(social_links)

    def _extract_contact_info(self, soup) -> Dict:
        contact_info = {
            'email': None,
            'phone': None,
            'address': None
        }
        
        # Find email addresses
        email_elements = soup.find_all(string=lambda text: '@' in str(text) if text else False)
        if email_elements:
            contact_info['email'] = self._clean_text(email_elements[0])
        
        return contact_info

class CompanyAnalyzer:
    def analyze_company(self, website_data: Dict, custom_notes: Optional[str] = None) -> Dict:
        try:
            # Prepare content for analysis
            content_for_analysis = {
                'title': website_data.get('title', ''),
                'description': website_data.get('meta_description', ''),
                'content': website_data.get('main_content', '')[:5000],  # Limit content length
                'social_links': website_data.get('social_links', []),
                'contact_info': website_data.get('contact_info', {})
            }
            
            messages = [
                {
                    "role": "system",
                    "content": "You are an expert business analyst. Analyze the provided website data and extract key business insights. Always return valid JSON."
                },
                {
                    "role": "user",
                    "content": self._create_analysis_prompt(content_for_analysis, custom_notes)
                }
            ]
            
            response = client.chat.completions.create(
                model="mixtral-8x7b-32768",
                messages=messages,
                temperature=0.7,
                max_tokens=2000
            )
            
            result = response.choices[0].message.content
            # Ensure valid JSON response
            try:
                return json.loads(result)
            except json.JSONDecodeError:
                return {
                    "error": "Failed to parse analysis",
                    "raw_response": result
                }
                
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

# Initialize components
scraper = WebScraper()
analyzer = CompanyAnalyzer()

@app.post("/analyze-website")
async def analyze_website(request: WebsiteAnalysisRequest):
    try:
        # Scrape website
        website_data = await scraper.scrape_website(request.url)
        
        # Analyze company
        analysis = analyzer.analyze_company(website_data, request.custom_notes)
        
        return {
            "status": "success",
            "website_data": website_data,
            "analysis": analysis
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "groq_api_key_set": bool(os.getenv("GROQ_API_KEY"))
    }