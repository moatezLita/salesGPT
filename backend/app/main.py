from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime
import logging

from .config import get_settings
from .services.scraper import WebScraper
from .services.analyzer import CompanyAnalyzer
from .services.email_generator import EmailGenerator
from .services.database import DatabaseHandler

logger = logging.getLogger(__name__)

settings = get_settings()

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
scraper = WebScraper()
analyzer = CompanyAnalyzer()
email_generator = EmailGenerator()
db = DatabaseHandler(settings.MONGODB_URL)

# Request Models
class WebsiteAnalysisRequest(BaseModel):
    url: str
    custom_notes: Optional[str] = None

class BusinessInfo(BaseModel):
    company_name: str
    business_type: str
    product_description: str

class EmailGenerationRequest(BaseModel):
    business_info: BusinessInfo
    target_persona: Optional[str] = "decision maker"
    tone: Optional[str] = "professional"

# Custom Exception
class WebsiteAnalysisError(Exception):
    """Base exception for website analysis errors"""
    pass

# API Endpoints
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "groq_api_key_set": bool(settings.GROQ_API_KEY)
    }

@app.post("/api/v1/analyze-website")
async def analyze_website(request: WebsiteAnalysisRequest):
    try:
        # Scrape website
        try:
            website_data = await scraper.scrape_website(request.url)
        except Exception as e:
            logger.error(f"Scraping failed for URL {request.url}: {str(e)}")
            raise WebsiteAnalysisError(f"Failed to scrape website: {str(e)}")
        
        # Analyze company
        try:
            analysis = analyzer.analyze_company(website_data, request.custom_notes)
        except Exception as e:
            logger.error(f"Analysis failed for URL {request.url}: {str(e)}")
            raise WebsiteAnalysisError(f"Failed to analyze company data: {str(e)}")
        
        # Save to database
        try:
            analysis_id = await db.save_analysis(request.url, website_data, analysis)
        except Exception as e:
            logger.error(f"Database save failed for URL {request.url}: {str(e)}")
            raise WebsiteAnalysisError(f"Failed to save analysis: {str(e)}")
        
        return {
            "status": "success",
            "analysis_id": analysis_id,
            "website_data": website_data,
            "analysis": analysis
        }
    except WebsiteAnalysisError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during website analysis: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error occurred")


@app.get("/api/v1/analyses")
async def list_analyses():
    try:
        analyses = await db.list_analyses()
        return {
            "status": "success",
            "analyses": analyses
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/analyses/{analysis_id}")
async def get_analysis_by_id(analysis_id: str):
    try:
        analysis = await db.get_analysis(analysis_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        return {
            "status": "success",
            "analysis": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/api/v1/emails/{analysis_id}")
async def list_emails(analysis_id: str):
    try:
        emails = await db.get_emails(analysis_id)
        if not emails:
            return {
                "status": "success",
                "emails": []
            }
        return {
            "status": "success",
            "emails": emails
        }
    except Exception as e:
        logger.error(f"Error fetching emails: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/generate-email/{analysis_id}")
async def generate_email(analysis_id: str, request: EmailGenerationRequest):
    try:
        # Get analysis from database
        analysis = await db.get_analysis(analysis_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        # Generate emails
        emails = email_generator.generate_email(
            company_analysis=analysis["analysis"],
            user_business={
                "company_name": request.business_info.company_name,
                "business_type": request.business_info.business_type,
                "product_description": request.business_info.product_description
            },
            target_persona=request.target_persona,
            tone=request.tone
        )
        
        # Save emails to database with business info
        email_data = {
            "emails": emails,
            "business_info": request.business_info.dict(),
            "target_persona": request.target_persona,
            "tone": request.tone
        }
        email_id = await db.save_email(analysis_id, email_data)
        
        return {
            "status": "success",
            "email_id": email_id,
            "emails": emails
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error generating email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))