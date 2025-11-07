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

    // ✅ Load the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // ✅ The API expects an object with 'contents'
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // ✅ Extract response safely
    const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    res.status(200).json({ response: text });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
}
