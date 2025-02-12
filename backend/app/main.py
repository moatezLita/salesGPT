from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime

from .config import get_settings
from .services.scraper import WebScraper
from .services.analyzer import CompanyAnalyzer
from .services.email_generator import EmailGenerator
from .services.database import DatabaseHandler

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

class EmailGenerationRequest(BaseModel):
    target_persona: Optional[str] = "Decision Maker"
    tone: Optional[str] = "professional"

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
        website_data = await scraper.scrape_website(request.url)
        
        # Analyze company
        analysis = analyzer.analyze_company(website_data, request.custom_notes)
        
        # Save to database
        analysis_id = await db.save_analysis(request.url, website_data, analysis)
        
        return {
            "status": "success",
            "analysis_id": analysis_id,
            "website_data": website_data,
            "analysis": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
        return {
            "status": "success",
            "emails": emails
        }
    except Exception as e:
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
            analysis["analysis"],
            request.target_persona,
            request.tone
        )
        
        # Save emails to database
        email_id = await db.save_email(analysis_id, emails)
        
        return {
            "status": "success",
            "email_id": email_id,
            "emails": emails
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

