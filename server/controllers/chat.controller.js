import axios from 'axios'
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const chatController = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ success: false, message: "Question is required" });
        }

        const chat = model.startChat();
        const response = await chat.sendMessage(question);

        const answer = response.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

        res.status(200).json({ success: true, answer });

    } catch (error) {
        console.error("error in chatController", error);
        res.status(500).json({success: false, message: "Internal Server Error"});
    }
}

export {chatController}