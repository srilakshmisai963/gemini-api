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

Create a **7-day meal plan** based on **local and regional dishes specific to ${userData.city}, ${userData.country} ${userData.longitude} ${userData.latitude}**. 
The foods should reflect authentic, commonly eaten items from that region. 
For example:
- If the city is Chennai or anywhere in Tamil Nadu → include dishes like idli, dosa, pongal, upma, sambar, rasam, curd rice, etc.
- If the city is Mumbai → include poha, thepla, pav bhaji, dal khichdi, etc.
- If the city is Delhi → include paratha, rajma chawal, paneer dishes, etc.
- If the city is Kolkata → include luchi, aloo dum, fish curry, rice, etc.
- If the city is Hyderabad → include biryani, pesarattu, ragi malt, etc.
(Use similar logic for any other Indian city.)

Ensure the plan is **regionally authentic first**, using dishes native to ${userData.city}, ${userData.state}.  
Then, try to **incorporate or adapt** the user's preferences (${userData.foodItems}, ${userData.drinkItems}) into that cuisine.  
If a preference doesn’t fit (e.g., roti in South India), replace it with a similar local equivalent (e.g., chapati, dosa, or idli).
Keep the meals realistic and wholesome, and adjust for:
- Diet type: ${userData.dietType}
- Smoking: ${userData.smoking}
- Drinking: ${userData.drinking}


Include one short hydration or lifestyle tip per day (related to weather or general wellness in ${userData.city}).

Also generate a **short personalized summary** (maximum 5 lines) that feels human and empathetic. 
It should sound like:  
"Your personalized plan is tailored to support your body’s unique needs and hormonal balance. It includes nutrient-rich foods that help improve energy, regulate cycles, and support overall fertility health."

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
