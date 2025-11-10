const prompt = `
You are a professional **nutritionist and wellness expert**.

Create a **7-day meal plan** based on **local and regional dishes specific to ${userData.city}, ${userData.state} (India)**. 
The foods should reflect authentic, commonly eaten items from that region. 
For example:
- If the city is Chennai or anywhere in Tamil Nadu → include dishes like idli, dosa, pongal, upma, sambar, rasam, curd rice, etc.
- If the city is Mumbai → include poha, thepla, pav bhaji, dal khichdi, etc.
- If the city is Delhi → include paratha, rajma chawal, paneer dishes, etc.
- If the city is Kolkata → include luchi, aloo dum, fish curry, rice, etc.
- If the city is Hyderabad → include biryani, pesarattu, ragi malt, etc.
(Use similar logic for any other Indian city.)

Each day should include only the relevant meals based on the user's selected meal times:
${uniqueMealCategories.join(", ")}.

Ensure each day's meals are **balanced, wholesome, and realistic**, respecting the user's:
- Diet type: ${userData.dietType}
- Food preferences: ${userData.foodItems}
- Drink preferences: ${userData.drinkItems}
- Smoking: ${userData.smoking}
- Drinking: ${userData.drinking}

Include one short hydration or wellness tip

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
