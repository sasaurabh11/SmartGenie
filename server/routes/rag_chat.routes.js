import express, { Router } from "express";
import { ragChatController } from "../controllers/rag_chat.controller.js";

const ragChatRouter = express.Router();

ragChatRouter.post("/", ragChatController);

export default ragChatRouter;