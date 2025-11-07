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

    // ✅ Use correct model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // ✅ The input must be in array format (as Gemini expects)
    const result = await model.generateContent([prompt]);

    // ✅ The response is nested, so extract it properly
    const text = await result.response.text();

    res.status(200).json({ response: text });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
}
