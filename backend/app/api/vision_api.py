from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.vision_service import identify_product

router = APIRouter(prefix="/vision", tags=["vision"])

class IdentifyRequest(BaseModel):
    image: str  # Base64 encoded image

@router.post("/recognize")
async def recognize_api(request: IdentifyRequest):
    try:
        product, confidence = identify_product(request.image)
        
        return {
            "product": product,
            "confidence": confidence,
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
