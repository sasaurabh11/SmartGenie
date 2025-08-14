import { GoogleGenerativeAI } from "@google/generative-ai";
import { RAGSystem } from "../utils/ragSystem.js";

const ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

let ragSystem = null;

const initializeRAG = async () => {
    if (!ragSystem) {
        ragSystem = new RAGSystem();
        await ragSystem.init();
    }
    return ragSystem;
};

const History = [];

async function transformQuery(question) {
    const tempHistory = [...History];
    
    tempHistory.push({
        role: 'user',
        parts: [{ text: question }]
    });

    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const response = await model.generateContent({
        contents: tempHistory,
        systemInstruction: `You are a query rewriting expert. Based on the provided chat history, rephrase the "Follow Up user Question" into a complete, standalone question that can be understood without the chat history.
Only output the rewritten question and nothing else.`
    });

    return response.response.text();
}

const ragChatController = async (req, res) => {
    try {
        const { question, docId = null } = req.body;
        
        if (!question) {
            return res.status(400).json({ success: false, message: "Question is required" });
        }

        const rag = await initializeRAG();

        const transformedQuery = await transformQuery(question);

        const relevantResults = await rag.getRelevantContent(
            transformedQuery, 
            120000, 
            docId   
        );

        const context = relevantResults
            .map((result, index) => {
                return `Document ${index + 1} (Score: ${result.score.toFixed(3)}):\n${result.content}`;
            })
            .join("\n\n---\n\n");

        if (!context || context.trim().length === 0) {
            return res.status(200).json({
                success: true,
                message: "I don't have any relevant information in my knowledge base to answer this question.",
                context: "",
                searchResults: []
            });
        }

        History.push({
            role: 'user',
            parts: [{ text: question }] 
        });

        const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        
        const response = await model.generateContent({
            contents: History,
            systemInstruction: `You are a helpful AI assistant that answers questions based ONLY on the provided context.

IMPORTANT RULES:
1. Base your answers EXCLUSIVELY on the information provided in the context below
2. If the context doesn't contain enough information to answer the question, clearly state "I don't have enough information to answer this question"
3. Do not use any external knowledge or make assumptions beyond what's in the context
4. If you're unsure about something, acknowledge the uncertainty
5. Be concise and direct in your responses
6. If multiple sources contain relevant information, synthesize the information appropriately
7. CRITICAL: Answer naturally without mentioning "context", "documents", "provided information", "sources", or "based on" phrases
8. Write as if you naturally know this information, but stick strictly to only what's provided below
9. Don't reference where the information comes from - just present it as factual knowledge

Context:
${context}

Remember: Answer ONLY based on the context provided above. Do not add information from outside sources. Present your answer naturally without referencing the context or sources.`
        });

        const responseText = response.response.text();

        History.push({
            role: 'model',
            parts: [{ text: responseText }]
        });

        res.status(200).json({ 
            success: true, 
            message: responseText,
            totalResults: relevantResults.length
        });

    } catch (error) {
        console.error("Error in ragChatController:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const clearHistoryController = async (req, res) => {
    try {
        History.length = 0; 
        res.status(200).json({ 
            success: true, 
            message: "Chat history cleared successfully" 
        });
    } catch (error) {
        console.error("Error in clearHistoryController:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
};

export { ragChatController, clearHistoryController };