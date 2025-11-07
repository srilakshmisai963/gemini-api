import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  try {
    // ✅ Correct model name for Gemini Pro
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = req.body.prompt;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    res.status(200).json({ response });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
}
