import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { userData } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `
    You are a professional nutritionist. Based on the following user details, create a personalized and healthy daily nutrition plan:

    - Meals per day: ${userData.mealsPerDay}
    - Meal times: ${userData.mealTimes.join(", ")}
    - Diet type: ${userData.dietType}
    - Drink preferences: ${userData.drinkItems}
    - Food preferences: ${userData.foodItems}
    - Smoking habits: ${userData.smoking}
    - Drinking habits: ${userData.drinking}

    Output a detailed plan in this format:

    🥣 Breakfast:
    🍱 Lunch:
    🍽️ Dinner:
    🍎 Snacks:
    💧 Hydration tip:
    ⚡ Summary: (how this plan supports the user’s lifestyle)
    `;

    const result = await model.generateContent([prompt]);
    const plan = result.response.text();

    res.status(200).json({ plan });
  } catch (error) {
    console.error("Error generating nutrition plan:", error);
    res.status(500).json({ error: error.message });
  }
}
