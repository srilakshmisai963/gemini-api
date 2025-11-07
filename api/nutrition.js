import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  try {
    const { userData } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `
You are an Indian nutritionist who creates balanced and culturally authentic Indian meal plans.

Based on the following user details, create a **7-day Indian meal plan** formatted strictly as **JSON**. 
Each day must have Breakfast, Lunch, Dinner, Snacks, and a short hydration or lifestyle tip.

Use **local Indian dishes** suitable for the region (based on the city/state). 
Ensure variety, nutrition balance, and adherence to dietary preferences.

User details:
- Location: ${userData.city}, ${userData.state}
- Meals per day: ${userData.mealsPerDay}
- Meal times: ${userData.mealTimes.join(", ")}
- Diet type: ${userData.dietType}
- Food preferences: ${userData.foodItems}
- Drink preferences: ${userData.drinkItems}
- Smoking habits: ${userData.smoking}
- Drinking habits: ${userData.drinking}

Output format (strict JSON):
{
  "7_day_plan": [
    {
      "day": "Day 1",
      "breakfast": "string",
      "lunch": "string",
      "dinner": "string",
      "snacks": "string",
      "hydration_tip": "string"
    },
    ...
  ],
  "summary": "string"
}
`;

    const result = await model.generateContent([prompt]);
    let text = result.response.text();

    // Ensure it’s valid JSON
    text = text.replace(/```json|```/g, '').trim();

    let planJSON;
    try {
      planJSON = JSON.parse(text);
    } catch (err) {
      console.error("JSON parsing failed, fallback to text:", text);
      planJSON = { raw: text };
    }

    res.status(200).json({ plan: planJSON });
  } catch (error) {
    console.error("❌ Error generating nutrition plan:", error);
    res.status(500).json({ error: error.message });
  }
}
