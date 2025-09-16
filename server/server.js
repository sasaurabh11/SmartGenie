import express from 'express';
import cors from 'cors';
import "dotenv/config";
import connectDB from './db/index.js';
import userRouter from './routes/user.routes.js';
import imageRouter from './routes/image.routes.js';
import summarizeRouter from './routes/summarize.routes.js';
import chatRouter from './routes/chat.router.js';
import { fal } from "@fal-ai/client";
import ragChatRouter from './routes/rag_chat.routes.js';

const PORT = process.env.PORT || 5000;
const app = express();

fal.config({
    credentials: process.env.FALAI_API_KEY
})

app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.options("*", cors());
console.log("Allowed Origin:", process.env.CORS_ORIGIN);
app.use(express.static('stories'));

app.use('/api/v1/user', userRouter);
app.use('/api/v1/image', imageRouter);
app.use('/api/v1/website', summarizeRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/askrag', ragChatRouter)

app.get('/', (req, res) => {
    res.send("App started");
})

connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port http://localhost:${PORT}`);
    })
})
.catch((error) => {
    console.log("Error in connecting to DB", error);
})
