# File: backend/app/services/database.py
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from typing import Dict, List, Optional
from bson import ObjectId

class DatabaseHandler:
    def __init__(self, mongodb_url: str):
        self.client = AsyncIOMotorClient(mongodb_url)
        self.db = self.client.salesgpt

    async def save_analysis(self, url: str, website_data: Dict, analysis: Dict) -> str:
        analysis_doc = {
            "url": url,
            "website_data": website_data,
            "analysis": analysis,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await self.db.analyses.insert_one(analysis_doc)
        return str(result.inserted_id)

    async def save_email(self, analysis_id: str, emails: Dict) -> str:
        email_doc = {
            "analysis_id": analysis_id,
            "emails": emails,
            "created_at": datetime.utcnow()
        }
        
        result = await self.db.emails.insert_one(email_doc)
        return str(result.inserted_id)

    async def get_analysis(self, analysis_id: str) -> Optional[Dict]:
        try:
            result = await self.db.analyses.find_one({"_id": ObjectId(analysis_id)})
            if result:
                result["_id"] = str(result["_id"])
            return result
        except Exception:
            return None

    async def get_emails(self, analysis_id: str) -> List[Dict]:
        cursor = self.db.emails.find({"analysis_id": analysis_id})
        emails = await cursor.to_list(length=None)
        for email in emails:
            email["_id"] = str(email["_id"])
        return emails

    async def list_analyses(self) -> List[Dict]:
        cursor = self.db.analyses.find().sort("created_at", -1)
        analyses = await cursor.to_list(length=50)  # Limit to last 50 analyses
        for analysis in analyses:
            analysis["_id"] = str(analysis["_id"])
        return analyses