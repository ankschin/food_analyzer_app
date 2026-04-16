import os
import httpx

USDA_API_KEY = os.environ.get("USDA_API_KEY", "DEMO_KEY")
USDA_BASE = "https://api.nal.usda.gov/fdc/v1"


async def enrich_with_usda(result: dict) -> dict:
    """
    Attempts to enrich Claude's nutritional estimate with USDA data.
    Falls back to Claude's values if USDA lookup fails or returns no results.
    """
    food_items = result.get("food_items", [])
    if not food_items:
        return result

    primary_item = food_items[0]

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"{USDA_BASE}/foods/search",
                params={
                    "query": primary_item,
                    "api_key": USDA_API_KEY,
                    "pageSize": 1,
                    "dataType": "Foundation,SR Legacy",
                },
            )
            resp.raise_for_status()
            data = resp.json()

        foods = data.get("foods", [])
        if not foods:
            return result

        food = foods[0]
        nutrients = {n["nutrientName"]: n["value"] for n in food.get("foodNutrients", [])}

        # Merge USDA micros into result (don't override Claude's macros — USDA is per 100g)
        usda_micros = {}

        micro_map = {
            "Vitamin C, total ascorbic acid": "vitamin_c",
            "Iron, Fe": "iron",
            "Calcium, Ca": "calcium",
            "Fiber, total dietary": "fiber",
            "Potassium, K": "potassium",
            "Sodium, Na": "sodium",
            "Vitamin A, IU": "vitamin_a",
        }

        for usda_name, key in micro_map.items():
            if usda_name in nutrients and nutrients[usda_name]:
                unit = "mg" if "Vitamin A" not in usda_name else "IU"
                if "fiber" in key.lower():
                    unit = "g"
                usda_micros[key] = f"{round(nutrients[usda_name], 1)}{unit} (per 100g)"

        if usda_micros:
            result["micros"] = {**usda_micros, **result.get("micros", {})}

        result["assumptions"] = result.get("assumptions", []) + [
            f"Micronutrient data from USDA FoodData Central for '{food.get('description', primary_item)}'"
        ]

    except Exception:
        # USDA enrichment is best-effort — never fail the whole request
        pass

    return result
