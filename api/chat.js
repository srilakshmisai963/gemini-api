// api/chat.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST requests are allowed" });
    }

    try {
        const { query } = req.body;

        if (!query || query.trim() === "") {
            return res.status(400).json({ response: "Query is empty." });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const result = await model.generateContent(query);
        const text = result.response.text();

        res.status(200).json({ response: text });
    } catch (error) {
        console.error("Error in Gemini API:", error);
        res.status(500).json({
            response: "An error occurred while generating the response.",
        });
    }
}
