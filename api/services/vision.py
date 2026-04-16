import os
import json
import asyncio
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

def _get_client() -> AsyncGroq:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not set. Add it to api/.env")
    return AsyncGroq(api_key=api_key)

# Swap model here if needed:
# - meta-llama/llama-4-scout-17b-16e-instruct  (recommended — fast + vision)
# - meta-llama/llama-4-maverick-17b-128e-instruct (more capable)
# - llama-3.2-90b-vision-preview               (strong vision, 8K ctx)
# - llama-3.2-11b-vision-preview               (lightest, fastest)
MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"

SYSTEM_PROMPT = """You are an expert nutritionist and food analyst. When given a food image, you:
1. Identify all visible food items
2. Estimate portion sizes based on visual cues
3. Calculate nutritional content
4. Generate health insights

Always respond with a valid JSON object matching exactly this structure:
{
  "food_items": ["item1", "item2"],
  "calories": "350-400",
  "macros": {
    "protein": 20,
    "carbs": 45,
    "fats": 12
  },
  "micros": {
    "vitamin_c": "15mg",
    "iron": "2.5mg",
    "calcium": "80mg",
    "fiber": "4g"
  },
  "confidence": "high",
  "assumptions": [
    "Portion size estimated at 250g",
    "Standard cooking oil used"
  ],
  "insights": {
    "pros": ["High in protein", "Good source of fiber"],
    "cons": ["High sodium content"],
    "best_time_to_eat": "Lunch or dinner",
    "who_should_avoid": ["People with lactose intolerance"]
  }
}

Rules:
- calories must be a string range like "350-400" when uncertain, or a number when confident
- macros values must be numbers in grams
- confidence must be "low", "medium", or "high"
- If image quality is poor, set confidence to "low" and use wider ranges
- For mixed dishes, list all visible components in food_items
- Always include at least 3 micronutrients
- Never fabricate data — use "unknown" in assumptions if unsure
- Return ONLY the JSON object, no markdown, no explanation"""


def _detect_mime(base64_image: str) -> str:
    header = base64_image[:16]
    import base64 as _b64
    try:
        raw = _b64.b64decode(header + "==")[:4]
    except Exception:
        return "image/jpeg"
    if raw[:4] == b'\x89PNG':
        return "image/png"
    if raw[:4] == b'RIFF':
        return "image/webp"
    if raw[:3] == b'GIF':
        return "image/gif"
    return "image/jpeg"  # default


async def analyze_food_image(base64_image: str) -> dict:
    mime = _detect_mime(base64_image)
    response = await _get_client().chat.completions.create(
        model=MODEL,
        max_tokens=1024,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime};base64,{base64_image}"
                        },
                    },
                    {
                        "type": "text",
                        "text": "Analyze this food image and return the nutrition data as JSON.",
                    },
                ],
            },
        ],
    )

    content = response.choices[0].message.content

    # Extract JSON from response
    start = content.find("{")
    end = content.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError("No JSON found in model response")

    return json.loads(content[start:end])
