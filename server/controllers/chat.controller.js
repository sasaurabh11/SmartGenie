import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const chatController = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ success: false, message: "Question is required" });
        }

        const response = await model.generateContent(question);
        const answer = response?.response?.text() || "No response generated.";

        res.status(200).json({ success: true, answer });

    } catch (error) {
        console.error("Error in chatController", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export { chatController };
