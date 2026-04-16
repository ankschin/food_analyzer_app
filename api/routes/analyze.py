import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import BadRequestError, AuthenticationError, RateLimitError

from services.vision import analyze_food_image
from services.usda import enrich_with_usda

logger = logging.getLogger(__name__)
router = APIRouter()


class AnalyzeRequest(BaseModel):
    image: str  # base64 encoded


@router.post("/analyze")
async def analyze(request: AnalyzeRequest):
    if not request.image:
        raise HTTPException(status_code=400, detail="Image is required.")

    try:
        result = await analyze_food_image(request.image)
    except BadRequestError as e:
        logger.error("Groq bad request: %s", e)
        raise HTTPException(status_code=422, detail=f"Image could not be processed by AI: {e}")
    except AuthenticationError:
        logger.error("Groq auth failed — check GROQ_API_KEY")
        raise HTTPException(status_code=500, detail="AI service authentication failed.")
    except RateLimitError:
        raise HTTPException(status_code=429, detail="AI rate limit hit. Try again in a moment.")
    except ValueError as e:
        logger.error("Failed to parse AI response: %s", e)
        raise HTTPException(status_code=502, detail=f"AI returned unexpected response: {e}")
    except Exception as e:
        logger.exception("Unexpected error in analyze_food_image")
        raise HTTPException(status_code=500, detail=str(e))

    result = await enrich_with_usda(result)
    return result
