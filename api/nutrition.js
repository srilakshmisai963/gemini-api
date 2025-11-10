import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  try {
    const { userData } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    // Dynamically map meal times to categories
    const mealCategories = userData.mealTimes.map((time) => {
      const [hour, minutePart] = time.split(":");
      let hourNum = parseInt(hour);
      if (time.toLowerCase().includes("pm") && hourNum < 12) hourNum += 12;

      if (hourNum >= 5 && hourNum < 12) return "breakfast";
      if (hourNum >= 12 && hourNum < 16) return "lunch";
      if (hourNum >= 16 && hourNum < 18) return "snacks";
      if (hourNum >= 18 && hourNum <= 23) return "dinner";
      return "misc";
    });

    const uniqueMealCategories = [...new Set(mealCategories.filter(m => m !== "misc"))];

    const prompt = `
You are a professional **nutritionist and wellness expert**. 
Create a **7-day meal plan** focusing on **local and regional foods specific to ${userData.city}, ${userData.state}**. 
Use  dishes from that city or region.

Each day should include only the relevant meals based on the user's selected meal times:
${uniqueMealCategories.join(", ")}.

Ensure each day's meals are **balanced, wholesome, and realistic**, respecting the user's:
- Diet type: ${userData.dietType}
- Food preferences: ${userData.foodItems}
- Drink preferences: ${userData.drinkItems}
- Smoking: ${userData.smoking}
- Drinking: ${userData.drinking}

Include short hydration or wellness tips each day.

Also generate a **personalized AI-written summary** at the end that reflects the user's choices, tone, and goals. 
Make it warm, supportive, and empowering — for example:
"Your personalized plan is tailored to support your body's unique needs and hormonal balance. 
It includes nutrient-rich foods that help improve energy, regulate cycles, and support overall health and fertility."

Output format (strict JSON, no extra text, no markdown):

{
  "7_day_plan": [
    {
      "day": "Day 1",
      ${uniqueMealCategories.map((m) => `"${m}": "string"`).join(",\n      ")},
      "hydration_tip": "string"
    },
    ...
  ],
  "summary": "string"
}
`;

    const result = await model.generateContent([prompt]);
    let text = result.response.text();

    // Clean JSON formatting
    text = text.replace(/```json|```/g, "").trim();

    let planJSON;
    try {
      planJSON = JSON.parse(text);
    } catch (err) {
      console.error("⚠️ JSON parsing failed, fallback to raw text:", text);
      planJSON = { raw: text };
    }

    res.status(200).json({ plan: planJSON });
  } catch (error) {
    console.error("❌ Error generating nutrition plan:", error);
    res.status(500).json({ error: error.message });
  }
}
