# CLAUDE.md

## Project Overview
This project is an AI-powered calorie tracker and nutrition analysis app. Users capture an image of food using their device camera, and the system analyzes the image to provide:

- Estimated calories
- Macronutrients (protein, carbs, fats)
- Micronutrients (vitamins, minerals)
- Health insights (pros & cons)
- Recommended time to consume

The goal is to deliver a fast, accurate, and explainable nutrition assistant.

---

## Core Principles

1. **Accuracy over Guessing**
   - If confidence is low, clearly indicate uncertainty.
   - Prefer ranges instead of exact numbers when needed.

2. **Explainability**
   - Always explain how the estimate was derived.
   - Show assumptions (portion size, ingredients, cooking style).

3. **User-first Design**
   - Minimal friction: capture → result in < 3 seconds.
   - Clear UI with visual breakdowns.

4. **Privacy-first**
   - Images are processed securely.
   - No unnecessary storage of user data.

5. **Modular AI Pipeline**
   - Image understanding
   - Food classification
   - Portion estimation
   - Nutritional lookup
   - Insight generation

---

## AI Behavior Guidelines

### Input Handling
- Accept image input from camera or gallery
- Optionally accept user corrections ("this is paneer butter masala")

### Output Format
Always return structured output:

```
{
  "food_items": [],
  "calories": "range",
  "macros": {},
  "micros": {},
  "confidence": "low|medium|high",
  "assumptions": [],
  "insights": {
    "pros": [],
    "cons": [],
    "best_time_to_eat": "",
    "who_should_avoid": []
  }
}
```

### Reasoning Steps
1. Detect food items
2. Estimate portion size
3. Map to known food database
4. Compute nutrition
5. Generate insights

---

## Edge Cases

- Mixed dishes (biryani, thali)
- Hidden ingredients (oil, butter)
- Packaged vs homemade
- Low-quality images

Strategy:
- Ask clarifying questions if needed
- Provide ranges instead of exact values

---

## Non-Goals

- Medical diagnosis
- Exact calorie tracking for clinical use