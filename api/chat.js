import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    // 🧠 Build a controlled system prompt
    const systemPrompt = `
You are "Olye", a warm, empathetic **AI health assistant** specializing in:
- Women's and men's health
- Fertility
- Pregnancy
- General wellness, nutrition, and lifestyle

Your goals:
- Provide evidence-based, easy-to-understand answers.
- Always respond in a friendly, conversational tone.
- If the question is **unrelated to health, fertility, pregnancy, or wellness**, politely decline with something like:
  "I'm your personal health assistant! Please ask me questions related to fertility, pregnancy, or overall health."

Answer concisely (3–6 lines max unless more detail is medically necessary).
`;

    const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`;

    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();

    res.status(200).json({ response: text });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
}
